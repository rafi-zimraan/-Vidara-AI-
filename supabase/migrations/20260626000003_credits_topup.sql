-- Vidara AI: Credit system (simplified, user-based)
-- No real payment gateway yet — mock topup for development

create table if not exists public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  balance integer not null default 0,
  total_purchased integer not null default 0,
  total_used integer not null default 0,
  total_expired integer not null default 0,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type varchar(20) not null
    check (type in ('purchase','usage','refund','bonus','expiration','adjustment')),
  amount integer not null,
  balance_after integer not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_credits_user on public.user_credits(user_id);
create index if not exists idx_credit_tx_user on public.credit_transactions(user_id);
create index if not exists idx_credit_tx_created on public.credit_transactions(created_at desc);

-- RLS
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

create policy "user_credits_owner" on public.user_credits
  for all using (user_id = auth.uid());

create policy "credit_transactions_owner" on public.credit_transactions
  for all using (user_id = auth.uid());

-- Updated_at trigger
create trigger set_user_credits_updated_at
  before update on public.user_credits
  for each row execute function public.set_updated_at();

-- Seed initial credits for existing users (optional)
-- This is handled by API when first accessed
