-- Unicorn Language Center — Database schema
--
-- Run this once in your Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql/new) after creating the
-- project. Safe to re-run — every statement is idempotent.

-- =========================================================
-- 1. profiles — one row per player, mirrors auth.users
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null default 'Player',
  avatar_url text,
  xp integer not null default 0,
  coins integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_played_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by any signed-in player" on public.profiles;
create policy "profiles are readable by any signed-in player"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "players can update their own profile" on public.profiles;
create policy "players can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "players can insert their own profile" on public.profiles;
create policy "players can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create a profile row the moment someone signs in with Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. puzzle_attempts — one row per completed puzzle
-- =========================================================
create table if not exists public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tier text not null check (tier in ('foal', 'colt', 'stallion', 'pegasus', 'alicorn')),
  puzzle_id text not null,
  time_seconds integer not null check (time_seconds >= 0),
  accuracy numeric(5, 2) not null check (accuracy >= 0 and accuracy <= 100),
  hints_used integer not null default 0,
  score integer not null,
  is_daily_challenge boolean not null default false,
  completed_at timestamptz not null default now()
);

create index if not exists puzzle_attempts_leaderboard_idx
  on public.puzzle_attempts (tier, user_id, puzzle_id, score desc);

alter table public.puzzle_attempts enable row level security;

drop policy if exists "attempts are readable by any signed-in player" on public.puzzle_attempts;
create policy "attempts are readable by any signed-in player"
  on public.puzzle_attempts for select
  to authenticated
  using (true);

drop policy if exists "players can insert their own attempts" on public.puzzle_attempts;
create policy "players can insert their own attempts"
  on public.puzzle_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =========================================================
-- 3. user_achievements — unlocked badges
-- =========================================================
create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

alter table public.user_achievements enable row level security;

drop policy if exists "achievements are readable by any signed-in player" on public.user_achievements;
create policy "achievements are readable by any signed-in player"
  on public.user_achievements for select
  to authenticated
  using (true);

drop policy if exists "players can insert their own achievements" on public.user_achievements;
create policy "players can insert their own achievements"
  on public.user_achievements for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =========================================================
-- 4. Leaderboard views
--    Ranks players per difficulty tier by total score across their best
--    attempt at each puzzle in that tier (rewards full completion),
--    tie-broken by total time. security_invoker so RLS on the
--    underlying tables still applies to whoever queries the view.
-- =========================================================
create or replace view public.best_attempt_per_puzzle
  with (security_invoker = true) as
select distinct on (user_id, tier, puzzle_id)
  user_id, tier, puzzle_id, time_seconds, accuracy, score, hints_used, completed_at
from public.puzzle_attempts
order by user_id, tier, puzzle_id, score desc, time_seconds asc;

create or replace view public.tier_leaderboard
  with (security_invoker = true) as
select
  b.user_id,
  b.tier,
  p.username,
  p.avatar_url,
  sum(b.score)::integer as total_score,
  sum(b.time_seconds)::integer as total_time_seconds,
  round(avg(b.accuracy), 1) as avg_accuracy,
  count(distinct b.puzzle_id)::integer as puzzles_completed
from public.best_attempt_per_puzzle b
join public.profiles p on p.id = b.user_id
group by b.user_id, b.tier, p.username, p.avatar_url;

-- Query pattern used by the app for a tier's leaderboard:
--   select *, rank() over (order by total_score desc, total_time_seconds asc) as rank
--   from public.tier_leaderboard where tier = 'foal'
--   order by total_score desc, total_time_seconds asc limit 50;
