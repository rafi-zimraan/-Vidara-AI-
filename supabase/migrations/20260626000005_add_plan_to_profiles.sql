-- Vidara AI: Add subscription plan tracking to profiles

alter table public.profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free','pro','business','enterprise')),
  add column if not exists plan_activated_at timestamptz,
  add column if not exists plan_expires_at timestamptz;

create index if not exists idx_profiles_plan on public.profiles(plan);
