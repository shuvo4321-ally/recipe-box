import { createClient } from "@/lib/supabase/client";

export interface Recipe {
    id?: string;
    title: string;
    cooking_time: string;
    servings: string;
    category: string;
    ingredients: any[];
    instructions: string;
    image_url?: string;
    user_id?: string;
    created_at?: string;
    is_favorite?: boolean;
}

const supabase = createClient();

export const recipeService = {
    async addRecipe(recipe: Recipe, imageFile?: File) {
        let imageUrl = "";

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        if (imageFile) {
            const { data, error: uploadError } = await supabase.storage
                .from("recipe")
                .upload(`${Date.now()}-${imageFile.name}`, imageFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from("recipe")
                .getPublicUrl(data.path);

            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from("recipes")
            .insert([
                {
                    title: recipe.title,
                    cooking_time: recipe.cooking_time,
                    servings: recipe.servings,
                    category: recipe.category,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    image_url: imageUrl,
                    user_id: user.id, // Add user_id
                    is_favorite: recipe.is_favorite || false,
                },
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },

    async getRecipes() {
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching recipes:", error);
            throw error;
        }

        return data;
    },

    async getUserRecipes() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user recipes:", error);
            throw error;
        }

        return data;
    },

    async getRecipeById(id: string) {
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    },

    async updateRecipe(id: string, recipe: Partial<Recipe>, imageFile?: File) {
        let imageUrl = recipe.image_url;

        if (imageFile) {
            const { data, error: uploadError } = await supabase.storage
                .from("recipe")
                .upload(`${Date.now()}-${imageFile.name}`, imageFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from("recipe")
                .getPublicUrl(data.path);

            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from("recipes")
            .update({
                title: recipe.title,
                cooking_time: recipe.cooking_time,
                servings: recipe.servings,
                category: recipe.category,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                image_url: imageUrl,
                is_favorite: recipe.is_favorite,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },

    async deleteRecipe(id: string) {
        const { error } = await supabase
            .from("recipes")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }
    },

    async toggleFavorite(id: string, isFavorite: boolean) {
        const { data, error } = await supabase
            .from("recipes")
            .update({ is_favorite: isFavorite })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    },
};
