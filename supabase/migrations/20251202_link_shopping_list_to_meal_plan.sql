ALTER TABLE shopping_list_items
ADD COLUMN meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE;
