create table if not exists public.item_meta (
  id        text primary key,  -- minecraft item name e.g. "diamond_sword"
  name_ko   text not null,
  desc_ko   text,
  updated_at timestamptz default now()
);

alter table public.item_meta enable row level security;

create policy "public read" on public.item_meta
  for select using (true);

create policy "admin write" on public.item_meta
  for all using (auth.role() = 'service_role');
