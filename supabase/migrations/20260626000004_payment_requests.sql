-- Vidara AI: Payment requests with expiry tracking

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id varchar(20) not null,
  package_label varchar(50) not null,
  credits integer not null,
  amount_idr integer not null,
  payment_method varchar(20) not null,
  status varchar(20) not null default 'pending'
    check (status in ('pending','confirmed','expired','cancelled')),
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_requests_user on public.payment_requests(user_id);
create index if not exists idx_payment_requests_status on public.payment_requests(status);

alter table public.payment_requests enable row level security;

create policy "payment_requests_owner" on public.payment_requests
  for all using (user_id = auth.uid());
