create table public.events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  type text check (type in ('single', 'group')) not null
);

create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id),
  user_id uuid references auth.users(id),
  team_name text,
  members jsonb,
  created_at timestamptz default now()
);
