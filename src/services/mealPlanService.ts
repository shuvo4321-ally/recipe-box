import { createClient } from "@/lib/supabase/client";
import { MealPlanItem } from "@/types/mealPlan";

const supabase = createClient();

export const mealPlanService = {
    async getMealPlan(startDate: string, endDate: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("meal_plans")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("order", { ascending: true });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            recipeId: item.recipe_id,
            day: item.day,
            date: item.date,
            mealType: item.meal_type,
            order: item.order,
        })) as MealPlanItem[];
    },

    async addToMealPlan(item: Omit<MealPlanItem, "id">) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("meal_plans")
            .insert({
                user_id: user.id,
                recipe_id: item.recipeId,
                day: item.day,
                date: item.date,
                meal_type: item.mealType,
                order: item.order,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            recipeId: data.recipe_id,
            day: data.day,
            date: data.date,
            mealType: data.meal_type,
            order: data.order,
        } as MealPlanItem;
    },

    async removeFromMealPlan(id: string) {
        const { error } = await supabase
            .from("meal_plans")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async clearMealPlan() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from("meal_plans")
            .delete()
            .eq("user_id", user.id);

        if (error) throw error;
    },

    async clearMealPlanForRange(startDate: string, endDate: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from("meal_plans")
            .delete()
            .eq("user_id", user.id)
            .gte("date", startDate)
            .lte("date", endDate);

        if (error) throw error;
    },
};
