begin;

create or replace function public.create_household(p_name text)
returns table (
  id uuid,
  code text,
  name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := trim(p_name);
  v_code text;
  v_household public.households%rowtype;
  v_characters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_attempt integer;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar una sesión para crear un hogar';
  end if;

  if v_name = '' or length(v_name) > 50 then
    raise exception 'El nombre del hogar debe tener entre 1 y 50 caracteres';
  end if;

  for v_attempt in 1..20 loop
    select string_agg(
      substr(
        v_characters,
        1 + floor(random() * length(v_characters))::integer,
        1
      ),
      ''
    )
    into v_code
    from generate_series(1, 6);

    begin
      insert into public.households (code, name, created_by)
      values (v_code, v_name, v_user_id)
      returning * into v_household;

      exit;
    exception
      when unique_violation then
        v_household := null;
    end;
  end loop;

  if v_household.id is null then
    raise exception 'No se pudo generar un código de hogar único';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_household.id, v_user_id, 'owner')
  on conflict (household_id, user_id) do update
    set role = 'owner';

  return query
  select v_household.id, v_household.code, v_household.name;
end;
$$;

revoke all on function public.create_household(text)
from public, anon;
grant execute on function public.create_household(text)
to authenticated;

create or replace function public.join_household(p_code text)
returns table (
  id uuid,
  code text,
  name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(p_code));
  v_household public.households%rowtype;
  v_role text;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar una sesión para unirte a un hogar';
  end if;

  select *
  into v_household
  from public.households h
  where h.code = v_code;

  if v_household.id is null then
    raise exception 'No encontramos ningún hogar con ese código';
  end if;

  if exists (
    select 1
    from public.household_members hm
    where hm.household_id = v_household.id
  ) then
    v_role := 'member';
  else
    v_role := 'owner';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_household.id, v_user_id, v_role)
  on conflict (household_id, user_id) do nothing;

  if v_role = 'owner' and v_household.created_by is null then
    update public.households
    set created_by = v_user_id
    where households.id = v_household.id;
  end if;

  return query
  select v_household.id, v_household.code, v_household.name;
end;
$$;

revoke all on function public.join_household(text)
from public, anon;
grant execute on function public.join_household(text)
to authenticated;

create or replace function public.claim_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_subscription_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar una sesión para registrar este dispositivo';
  end if;

  if trim(p_endpoint) = '' or trim(p_p256dh) = '' or trim(p_auth) = '' then
    raise exception 'La suscripción push no está completa';
  end if;

  insert into public.push_subscriptions (
    endpoint,
    p256dh,
    auth,
    user_id,
    updated_at
  )
  values (
    p_endpoint,
    p_p256dh,
    p_auth,
    v_user_id,
    now()
  )
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_id = excluded.user_id,
        updated_at = now()
  returning id into v_subscription_id;

  update public.fasting_history
  set user_id = v_user_id
  where subscription_endpoint = p_endpoint
    and user_id is null;

  update public.scheduled_notifications
  set user_id = v_user_id,
      push_subscription_id = v_subscription_id
  where subscription_endpoint = p_endpoint
    and user_id is null;

  return v_subscription_id;
end;
$$;

revoke all on function public.claim_push_subscription(text, text, text)
from public, anon;
grant execute on function public.claim_push_subscription(text, text, text)
to authenticated;

-- Estas políticas seguras convivirán temporalmente con las antiguas.
-- Las políticas públicas se retirarán solo tras migrar todos los dispositivos.
drop policy if exists "Members can read own membership"
on public.household_members;

create policy "Members can read own membership"
on public.household_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Members can read their households"
on public.households;

create policy "Members can read their households"
on public.households
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members hm
    where hm.household_id = households.id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists "Members can read their weekly menu"
on public.weekly_menu;
create policy "Members can read their weekly menu"
on public.weekly_menu
for select
to authenticated
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = weekly_menu.household_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists "Members can insert their weekly menu"
on public.weekly_menu;
create policy "Members can insert their weekly menu"
on public.weekly_menu
for insert
to authenticated
with check (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = weekly_menu.household_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists "Members can update their weekly menu"
on public.weekly_menu;
create policy "Members can update their weekly menu"
on public.weekly_menu
for update
to authenticated
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = weekly_menu.household_id
      and hm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = weekly_menu.household_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists "Members can delete their weekly menu"
on public.weekly_menu;
create policy "Members can delete their weekly menu"
on public.weekly_menu
for delete
to authenticated
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = weekly_menu.household_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own fasting history"
on public.fasting_history;
create policy "Users can read own fasting history"
on public.fasting_history
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own fasting history"
on public.fasting_history;
create policy "Users can insert own fasting history"
on public.fasting_history
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can insert own notifications"
on public.scheduled_notifications;
create policy "Users can insert own notifications"
on public.scheduled_notifications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own notifications"
on public.scheduled_notifications;
create policy "Users can update own notifications"
on public.scheduled_notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;

select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'claim_push_subscription',
    'create_household',
    'join_household'
  )
order by p.proname;
