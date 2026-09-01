begin;

-- El ayuno pertenece a la cuenta. El endpoint queda solo como dato heredado.
alter table public.fasting_history
  alter column subscription_endpoint drop not null;

create table if not exists public.user_fasting_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{"preset":"16:8","customHours":16,"startReminderEnabled":false,"startReminderTime":"20:30"}'::jsonb,
  active_fast jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_household_id uuid references public.households(id) on delete set null,
  timezone text not null default 'Europe/Madrid',
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  household_id uuid not null references public.households(id) on delete cascade,
  week_start date not null,
  item_key text not null,
  name text not null check (char_length(name) between 1 and 120),
  quantity text not null default '',
  checked boolean not null default false,
  manually_added boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (household_id, week_start, item_key)
);

create index if not exists shopping_items_household_week_idx
  on public.shopping_items(household_id, week_start);

alter table public.user_fasting_state enable row level security;
alter table public.user_preferences enable row level security;
alter table public.shopping_items enable row level security;

create policy "Users manage own fasting state"
on public.user_fasting_state for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users manage own preferences"
on public.user_preferences for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Members read household shopping"
on public.shopping_items for select to authenticated
using (exists (
  select 1 from public.household_members hm
  where hm.household_id = shopping_items.household_id and hm.user_id = auth.uid()
));

create policy "Members add household shopping"
on public.shopping_items for insert to authenticated
with check (updated_by = auth.uid() and exists (
  select 1 from public.household_members hm
  where hm.household_id = shopping_items.household_id and hm.user_id = auth.uid()
));

create policy "Members update household shopping"
on public.shopping_items for update to authenticated
using (exists (
  select 1 from public.household_members hm
  where hm.household_id = shopping_items.household_id and hm.user_id = auth.uid()
)) with check (updated_by = auth.uid() and exists (
  select 1 from public.household_members hm
  where hm.household_id = shopping_items.household_id and hm.user_id = auth.uid()
));

create policy "Members delete household shopping"
on public.shopping_items for delete to authenticated
using (exists (
  select 1 from public.household_members hm
  where hm.household_id = shopping_items.household_id and hm.user_id = auth.uid()
));

create or replace function public.leave_household(p_household_id uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_other uuid;
begin
  select role into v_role from public.household_members
  where household_id = p_household_id and user_id = v_user;
  if v_role is null then raise exception 'No perteneces a este hogar'; end if;

  if v_role = 'owner' then
    select user_id into v_other from public.household_members
    where household_id = p_household_id and user_id <> v_user
    order by created_at limit 1;
    if v_other is not null then
      update public.household_members set role = 'owner'
      where household_id = p_household_id and user_id = v_other;
      update public.households set created_by = v_other where id = p_household_id;
    end if;
  end if;

  delete from public.household_members
  where household_id = p_household_id and user_id = v_user;

  delete from public.households h where h.id = p_household_id
    and not exists (select 1 from public.household_members hm where hm.household_id = h.id);
  update public.user_preferences set active_household_id = null, updated_at = now()
  where user_id = v_user and active_household_id = p_household_id;
end;
$$;

revoke all on function public.leave_household(uuid) from public, anon;
grant execute on function public.leave_household(uuid) to authenticated;

create or replace function public.rotate_household_code(p_household_id uuid)
returns text language plpgsql security definer set search_path = public, auth as $$
declare
  v_code text;
  v_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if not exists (
    select 1 from public.household_members
    where household_id = p_household_id and user_id = auth.uid() and role = 'owner'
  ) then raise exception 'Solo la persona propietaria puede renovar el código'; end if;
  loop
    select string_agg(substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1), '')
      into v_code from generate_series(1, 6);
    begin
      update public.households set code = v_code where id = p_household_id;
      return v_code;
    exception when unique_violation then null;
    end;
  end loop;
end;
$$;

revoke all on function public.rotate_household_code(uuid) from public, anon;
grant execute on function public.rotate_household_code(uuid) to authenticated;

create or replace function public.delete_household_meal(p_household_id uuid, p_meal_id integer)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not exists (select 1 from public.household_members
    where household_id = p_household_id and user_id = auth.uid()) then
    raise exception 'No perteneces a este hogar';
  end if;
  update public.weekly_menu set meal_id = null, updated_at = now()
    where household_id = p_household_id and meal_id = p_meal_id;
  delete from public.meals where id = p_meal_id and household_id = p_household_id;
end;
$$;

revoke all on function public.delete_household_meal(uuid, integer) from public, anon;
grant execute on function public.delete_household_meal(uuid, integer) to authenticated;

commit;
