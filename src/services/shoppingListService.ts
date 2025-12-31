import { createClient } from "@/lib/supabase/client";
import { recipeService } from "./recipeService";
import { mealPlanService } from "./mealPlanService";

export interface ShoppingListItem {
    id: string;
    user_id: string;
    name: string;
    category: string;
    is_checked: boolean;
    created_at: string;
    meal_plan_id?: string;
}

const supabase = createClient();

export const shoppingListService = {
    async getItems() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("shopping_list_items")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data as ShoppingListItem[];
    },

    async addItem(name: string, category: string = "Other") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("shopping_list_items")
            .insert([{ user_id: user.id, name, category }])
            .select()
            .single();

        if (error) throw error;
        return data as ShoppingListItem;
    },

    async toggleItem(id: string, isChecked: boolean) {
        const { data, error } = await supabase
            .from("shopping_list_items")
            .update({ is_checked: isChecked })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as ShoppingListItem;
    },

    async deleteItem(id: string) {
        const { error } = await supabase
            .from("shopping_list_items")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async clearList() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from("shopping_list_items")
            .delete()
            .eq("user_id", user.id);

        if (error) throw error;
    },

    async removeChecked() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from("shopping_list_items")
            .delete()
            .eq("user_id", user.id)
            .eq("is_checked", true);

        if (error) throw error;
    },

    async syncFromMealPlan(startDate: string, endDate: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 1. Get meal plans for range
        const mealPlans = await mealPlanService.getMealPlan(startDate, endDate);

        // 2. Get all recipes involved
        // Optimization: Fetch all user recipes once (or we could fetch only specific IDs if we had a bulk method)
        const allRecipes = await recipeService.getUserRecipes();
        const recipesMap = new Map(allRecipes.map(r => [r.id, r]));

        // 3. For each meal plan, sync items
        for (const plan of mealPlans) {
            const recipe = recipesMap.get(plan.recipeId);
            if (!recipe) continue;

            // Extract target ingredients
            const targetIngredients: { name: string; category: string }[] = [];
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach((ing: any) => {
                    const name = `${ing.qty} ${ing.unit} ${ing.name}`.trim();
                    let category = "Other";
                    const lowerName = ing.name.toLowerCase();
                    if (["onion", "garlic", "tomato", "spinach", "lemon", "lettuce", "carrot", "pepper", "vegetable", "potato", "cucumber", "broccoli"].some(k => lowerName.includes(k))) category = "Produce";
                    else if (["milk", "cheese", "egg", "butter", "yogurt", "cream"].some(k => lowerName.includes(k))) category = "Dairy & Eggs";
                    else if (["chicken", "beef", "pork", "fish", "salmon", "meat", "shrimp", "steak", "bacon"].some(k => lowerName.includes(k))) category = "Meat & Fish";
                    else if (["flour", "sugar", "salt", "oil", "rice", "pasta", "bean", "bread", "sauce", "spice", "honey", "vanilla"].some(k => lowerName.includes(k))) category = "Pantry Staples";

                    targetIngredients.push({ name, category });
                });
            }

            // Get existing items for this meal plan
            const { data: existingItems } = await supabase
                .from("shopping_list_items")
                .select("*")
                .eq("meal_plan_id", plan.id);

            const existingNames = new Set(existingItems?.map(i => i.name.toLowerCase()) || []);
            const targetNames = new Set(targetIngredients.map(i => i.name.toLowerCase()));

            // Identify items to add
            const toAdd = targetIngredients.filter(i => !existingNames.has(i.name.toLowerCase()));

            // Identify items to remove (if recipe changed)
            const toRemove = (existingItems || []).filter(i => !targetNames.has(i.name.toLowerCase()));

            // Execute updates
            if (toRemove.length > 0) {
                await supabase
                    .from("shopping_list_items")
                    .delete()
                    .in("id", toRemove.map(i => i.id));
            }

            if (toAdd.length > 0) {
                const { error } = await supabase
                    .from("shopping_list_items")
                    .insert(toAdd.map(i => ({
                        user_id: user.id,
                        name: i.name,
                        category: i.category,
                        meal_plan_id: plan.id
                    })));

                if (error) console.error("Error adding items:", error);
            }
        }
    }
};
