begin;

alter table public.weekly_menu
  add column if not exists meal_slot text not null default 'main';

alter table public.weekly_menu
  drop constraint if exists weekly_menu_meal_slot_check;

alter table public.weekly_menu
  add constraint weekly_menu_meal_slot_check
  check (meal_slot in ('main', 'secondary'));

alter table public.weekly_menu
  drop constraint if exists weekly_menu_pkey;

alter table public.weekly_menu
  add constraint weekly_menu_pkey
  primary key (room_code, week_start, day, meal_slot);

commit;
