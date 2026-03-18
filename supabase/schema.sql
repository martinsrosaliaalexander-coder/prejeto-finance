create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('entrada','saida')),
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null check (status in ('recebido','pendente','pago')),
  client text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions
  for delete
  using (auth.uid() = user_id);
