-- closedNote v1.0 Feature Schema
-- Adds: prompt_chains, chain_steps

-- ============================================================
-- NEW TABLE: prompt_chains
-- ============================================================
create table if not exists public.prompt_chains (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists chains_user_id_idx on public.prompt_chains(user_id);
create index if not exists chains_created_at_idx on public.prompt_chains(created_at desc);

alter table public.prompt_chains enable row level security;

create policy "Users can view their own chains"
  on public.prompt_chains for select using (auth.uid() = user_id);
create policy "Users can create their own chains"
  on public.prompt_chains for insert with check (auth.uid() = user_id);
create policy "Users can update their own chains"
  on public.prompt_chains for update using (auth.uid() = user_id);
create policy "Users can delete their own chains"
  on public.prompt_chains for delete using (auth.uid() = user_id);

drop trigger if exists handle_chains_updated_at on public.prompt_chains;
create trigger handle_chains_updated_at
  before update on public.prompt_chains
  for each row execute function public.handle_updated_at();

-- ============================================================
-- NEW TABLE: chain_steps
-- ============================================================
create table if not exists public.chain_steps (
  id uuid primary key default uuid_generate_v4(),
  chain_id uuid references public.prompt_chains(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete set null,
  step_order integer not null,
  title text not null default '',
  content text not null default '',
  output_variable text,
  input_mapping jsonb default '{}',
  created_at timestamptz default now() not null
);

create index if not exists steps_chain_id_idx on public.chain_steps(chain_id);
create index if not exists steps_order_idx on public.chain_steps(chain_id, step_order);

alter table public.chain_steps enable row level security;

create policy "Users can view steps for their chains"
  on public.chain_steps for select using (
    exists (select 1 from public.prompt_chains where prompt_chains.id = chain_steps.chain_id and prompt_chains.user_id = auth.uid())
  );
create policy "Users can create steps for their chains"
  on public.chain_steps for insert with check (
    exists (select 1 from public.prompt_chains where prompt_chains.id = chain_steps.chain_id and prompt_chains.user_id = auth.uid())
  );
create policy "Users can update steps for their chains"
  on public.chain_steps for update using (
    exists (select 1 from public.prompt_chains where prompt_chains.id = chain_steps.chain_id and prompt_chains.user_id = auth.uid())
  );
create policy "Users can delete steps for their chains"
  on public.chain_steps for delete using (
    exists (select 1 from public.prompt_chains where prompt_chains.id = chain_steps.chain_id and prompt_chains.user_id = auth.uid())
  );
