begin;

drop policy if exists "Users can update own fasting history"
on public.fasting_history;

create policy "Users can update own fasting history"
on public.fasting_history
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;
