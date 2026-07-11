-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  revision bigint not null default 1,
  device_id text,
  deleted boolean not null default false,
  primary key (user_id, key)
);

alter table public.user_data add column if not exists revision bigint not null default 1;
alter table public.user_data add column if not exists device_id text;
alter table public.user_data add column if not exists deleted boolean not null default false;

alter table public.user_data enable row level security;

drop policy if exists "Users can read their own app data" on public.user_data;
drop policy if exists "Users can insert their own app data" on public.user_data;
drop policy if exists "Users can update their own app data" on public.user_data;
drop policy if exists "Users can delete their own app data" on public.user_data;

create policy "Users can read their own app data"
on public.user_data for select
using (auth.uid() = user_id);

create policy "Users can insert their own app data"
on public.user_data for insert
with check (auth.uid() = user_id);

create policy "Users can update their own app data"
on public.user_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own app data"
on public.user_data for delete
using (auth.uid() = user_id);

create index if not exists user_data_updated_at_idx
on public.user_data (user_id, updated_at desc);

-- Required when "Automatically expose new tables" is disabled.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_data to authenticated;

-- A signed-in user can remove their own Auth identity. Cascades remove user_data.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
