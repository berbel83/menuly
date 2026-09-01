begin;

alter table public.scheduled_notifications
  add column if not exists attempts integer not null default 0,
  add column if not exists processing_started_at timestamptz;

alter table public.scheduled_notifications
  drop constraint if exists scheduled_notifications_status_check;

alter table public.scheduled_notifications
  add constraint scheduled_notifications_status_check
  check (
    status in (
      'pending',
      'processing',
      'sent',
      'cancelled',
      'failed'
    )
  );

create or replace function public.claim_due_notifications(
  p_limit integer default 50
)
returns setof public.scheduled_notifications
language sql
security definer
set search_path = public, pg_temp
as $$
  with due as (
    select id
    from public.scheduled_notifications
    where (
      status = 'pending'
      and scheduled_at <= now()
    )
    or (
      status = 'processing'
      and processing_started_at < now() - interval '10 minutes'
    )
    order by scheduled_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 50), 100))
  )
  update public.scheduled_notifications as notification
  set
    status = 'processing',
    processing_started_at = now(),
    attempts = notification.attempts + 1
  from due
  where notification.id = due.id
  returning notification.*;
$$;

revoke all
  on function public.claim_due_notifications(integer)
  from public, anon, authenticated;

grant execute
  on function public.claim_due_notifications(integer)
  to service_role;

commit;
