begin;

-- Retira las políticas públicas heredadas de Compausa 0.1.1.
drop policy if exists "Allow insert fasting history"
on public.fasting_history;
drop policy if exists "Allow read fasting history"
on public.fasting_history;

drop policy if exists "Anyone can read households"
on public.households;
drop policy if exists "Anyone can create households"
on public.households;

drop policy if exists "Anyone can read push subscriptions"
on public.push_subscriptions;
drop policy if exists "Anyone can insert push subscriptions"
on public.push_subscriptions;
drop policy if exists "Anyone can update push subscriptions"
on public.push_subscriptions;

drop policy if exists "Anyone can read scheduled notifications"
on public.scheduled_notifications;
drop policy if exists "Anyone can update scheduled notifications"
on public.scheduled_notifications;
drop policy if exists "Anyone can insert scheduled notifications"
on public.scheduled_notifications;

drop policy if exists "Anyone can read shared menus"
on public.weekly_menu;
drop policy if exists "Anyone can update shared menus"
on public.weekly_menu;
drop policy if exists "Anyone can add shared menus"
on public.weekly_menu;
drop policy if exists "Anyone can delete shared menus"
on public.weekly_menu;

-- Verifica que ninguna de las tablas sensibles conserva políticas anon.
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'fasting_history',
        'households',
        'push_subscriptions',
        'scheduled_notifications',
        'weekly_menu'
      )
      and 'anon' = any(roles)
  ) then
    raise exception 'Todavía existen políticas anónimas en tablas sensibles';
  end if;
end;
$$;

commit;

select
  tablename as tabla,
  policyname as politica,
  cmd as operacion,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'fasting_history',
    'household_members',
    'households',
    'push_subscriptions',
    'scheduled_notifications',
    'weekly_menu'
  )
order by tablename, policyname;
