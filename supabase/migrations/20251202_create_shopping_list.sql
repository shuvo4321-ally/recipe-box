create table if not exists public.shopping_list_items (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    category text not null default 'Other',
    is_checked boolean not null default false,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

-- Enable RLS
alter table public.shopping_list_items enable row level security;

-- Policies
create policy "Users can view their own shopping list items"
    on public.shopping_list_items for select
    using (auth.uid() = user_id);

create policy "Users can insert their own shopping list items"
    on public.shopping_list_items for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own shopping list items"
    on public.shopping_list_items for update
    using (auth.uid() = user_id);

create policy "Users can delete their own shopping list items"
    on public.shopping_list_items for delete
    using (auth.uid() = user_id);
