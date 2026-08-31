begin;

-- Copia de seguridad privada previa a la migración.
create schema if not exists compausa_backup;
revoke all on schema compausa_backup from public, anon, authenticated;

create table if not exists compausa_backup.households_20260831
as table public.households;

create table if not exists compausa_backup.weekly_menu_20260831
as table public.weekly_menu;

create table if not exists compausa_backup.fasting_history_20260831
as table public.fasting_history;

create table if not exists compausa_backup.push_subscriptions_20260831
as table public.push_subscriptions;

create table if not exists compausa_backup.scheduled_notifications_20260831
as table public.scheduled_notifications;

revoke all on all tables in schema compausa_backup
from public, anon, authenticated;

-- Identidad del creador y miembros autorizados de cada hogar.
alter table public.households
  add column if not exists created_by uuid
  references auth.users(id) on delete set null;

create table if not exists public.household_members (
  household_id uuid not null
    references public.households(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

alter table public.household_members enable row level security;

create index if not exists household_members_user_id_idx
  on public.household_members(user_id);

create index if not exists households_created_by_idx
  on public.households(created_by);

-- Relación estable entre el menú y su hogar.
alter table public.weekly_menu
  add column if not exists household_id uuid
  references public.households(id) on delete cascade;

update public.weekly_menu wm
set household_id = h.id
from public.households h
where wm.household_id is null
  and h.code = wm.room_code;

create index if not exists weekly_menu_household_week_idx
  on public.weekly_menu(household_id, week_start);

-- Propiedad de los datos de ayuno y notificaciones.
alter table public.push_subscriptions
  add column if not exists user_id uuid
  references auth.users(id) on delete cascade;

alter table public.fasting_history
  add column if not exists user_id uuid
  references auth.users(id) on delete cascade;

alter table public.scheduled_notifications
  add column if not exists user_id uuid
  references auth.users(id) on delete cascade;

alter table public.scheduled_notifications
  add column if not exists push_subscription_id uuid
  references public.push_subscriptions(id) on delete cascade;

update public.scheduled_notifications sn
set push_subscription_id = ps.id,
    user_id = coalesce(sn.user_id, ps.user_id)
from public.push_subscriptions ps
where sn.push_subscription_id is null
  and ps.endpoint = sn.subscription_endpoint;

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

create index if not exists fasting_history_user_ended_idx
  on public.fasting_history(user_id, ended_at desc);

create index if not exists scheduled_notifications_user_status_idx
  on public.scheduled_notifications(user_id, status, scheduled_at);

create index if not exists scheduled_notifications_subscription_idx
  on public.scheduled_notifications(push_subscription_id);

-- Compatibilidad temporal con la versión 0.1.1.
-- Los clientes antiguos siguen escribiendo room_code y endpoint.
create or replace function public.compausa_fill_weekly_menu_household_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.household_id is null or new.room_code is distinct from old.room_code then
    select id into new.household_id
    from public.households
    where code = new.room_code;
  end if;

  return new;
end;
$$;

revoke all on function public.compausa_fill_weekly_menu_household_id()
from public, anon, authenticated;

drop trigger if exists compausa_fill_weekly_menu_household_id
on public.weekly_menu;

create trigger compausa_fill_weekly_menu_household_id
before insert or update of room_code, household_id
on public.weekly_menu
for each row
execute function public.compausa_fill_weekly_menu_household_id();

create or replace function public.compausa_fill_notification_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.push_subscription_id is null
     or new.subscription_endpoint is distinct from old.subscription_endpoint then
    select id, user_id
      into new.push_subscription_id, new.user_id
    from public.push_subscriptions
    where endpoint = new.subscription_endpoint;
  end if;

  return new;
end;
$$;

revoke all on function public.compausa_fill_notification_owner()
from public, anon, authenticated;

drop trigger if exists compausa_fill_notification_owner
on public.scheduled_notifications;

create trigger compausa_fill_notification_owner
before insert or update of subscription_endpoint, push_subscription_id
on public.scheduled_notifications
for each row
execute function public.compausa_fill_notification_owner();

-- Comprobaciones: cualquier fallo cancela toda la transacción.
do $$
begin
  if exists (
    select 1
    from public.weekly_menu
    where household_id is null
  ) then
    raise exception 'Hay filas de weekly_menu sin hogar asociado';
  end if;

  if exists (
    select 1
    from public.scheduled_notifications
    where push_subscription_id is null
  ) then
    raise exception 'Hay notificaciones sin suscripción asociada';
  end if;
end;
$$;

commit;

select
  (select count(*) from public.households) as households,
  (select count(*) from public.weekly_menu where household_id is not null)
    as menus_migrated,
  (select count(*) from public.fasting_history) as fasting_history,
  (select count(*) from public.push_subscriptions) as push_subscriptions,
  (select count(*) from public.scheduled_notifications
    where push_subscription_id is not null) as notifications_migrated;
