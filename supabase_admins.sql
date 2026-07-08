create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password text not null default '',
  role text not null default 'operational',
  active boolean not null default true,
  fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_admins_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admins_updated_at on public.admins;

create trigger trg_admins_updated_at
before update on public.admins
for each row
execute function public.set_admins_updated_at();

alter table public.admins enable row level security;

drop policy if exists "admins_select_public" on public.admins;
drop policy if exists "admins_insert_public" on public.admins;
drop policy if exists "admins_update_public" on public.admins;
drop policy if exists "admins_delete_public" on public.admins;

create policy "admins_select_public"
on public.admins for select
to anon, authenticated
using (true);

create policy "admins_insert_public"
on public.admins for insert
to anon, authenticated
with check (true);

create policy "admins_update_public"
on public.admins for update
to anon, authenticated
using (true)
with check (true);

create policy "admins_delete_public"
on public.admins for delete
to anon, authenticated
using (true);

insert into public.admins (name, password, role, active, fixed)
values
  ('ADM MASTER', 'ADM123', 'master', true, true),
  ('Lukas', 'Lukas123', 'master', true, true),
  ('Pedro', '', 'visual', true, true),
  ('Wanderson', '', 'operational', true, true),
  ('Enrico', '', 'operational', true, true),
  ('Henrique', '', 'operational', true, true)
on conflict (name) do update set
  role = excluded.role,
  active = excluded.active,
  fixed = excluded.fixed,
  updated_at = now();
