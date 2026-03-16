create table prompt_versions (
  id uuid default gen_random_uuid() primary key,
  prompt_id uuid references prompts(id) on delete cascade not null,
  title text not null,
  content text not null,
  version_number int not null,
  created_at timestamptz default now() not null
);

alter table prompt_versions enable row level security;

create policy "Users can read their own prompt versions"
  on prompt_versions for select
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_versions.prompt_id
      and prompts.user_id = auth.uid()
    )
  );

create policy "Users can insert their own prompt versions"
  on prompt_versions for insert
  with check (
    exists (
      select 1 from prompts
      where prompts.id = prompt_versions.prompt_id
      and prompts.user_id = auth.uid()
    )
  );
