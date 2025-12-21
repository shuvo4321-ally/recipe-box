ALTER TABLE shopping_list_items
ADD CONSTRAINT unique_meal_item UNIQUE (meal_plan_id, name);
