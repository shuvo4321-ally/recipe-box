create table if not exists public.meal_plans (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    recipe_id uuid not null references public.recipes(id) on delete cascade,
    day text not null,
    meal_type text not null,
    "order" integer not null default 0,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

-- Enable RLS
alter table public.meal_plans enable row level security;

-- Policies
create policy "Users can view their own meal plans"
    on public.meal_plans for select
    using (auth.uid() = user_id);

create policy "Users can insert their own meal plans"
    on public.meal_plans for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own meal plans"
    on public.meal_plans for update
    using (auth.uid() = user_id);

create policy "Users can delete their own meal plans"
    on public.meal_plans for delete
    using (auth.uid() = user_id);
