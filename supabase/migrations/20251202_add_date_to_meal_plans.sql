alter table public.meal_plans 
add column if not exists "date" date not null default current_date;

-- Optional: Update existing records to have a meaningful date if needed, 
-- but default current_date is fine for now to avoid nulls.
