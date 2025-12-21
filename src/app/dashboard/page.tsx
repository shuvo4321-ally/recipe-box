import Sidebar from "./Sidebar";
import RecipeCard from "./RecipeCard";
import Pagination from "./Pagination";
import SortSelect from "./SortSelect";
import { createClient } from "@/lib/supabase/server";
import { Recipe } from "@/services/recipeService";
import AddRecipeButton from "./AddRecipeButton";

// Helper functions for sorting
function getCookingTimeMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const lowerTime = timeStr.toLowerCase();
  let minutes = 0;

  // Simple parsing for "X h Y m" or "X minutes"
  const hoursMatch = lowerTime.match(/(\d+)\s*h/);
  const minsMatch = lowerTime.match(/(\d+)\s*m/);

  if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
  if (minsMatch) minutes += parseInt(minsMatch[1]);

  // Fallback for just number or "mins"
  if (!hoursMatch && !minsMatch) {
    const simpleMatch = lowerTime.match(/(\d+)/);
    if (simpleMatch) minutes = parseInt(simpleMatch[1]);
  }

  return minutes;
}

function getServingsCount(servingsStr: string | number): number {
  if (!servingsStr) return 0;
  if (typeof servingsStr === "number") return servingsStr;
  const match = servingsStr.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function getIngredientCount(ingredients: any): number {
  if (Array.isArray(ingredients)) return ingredients.length;
  return 0;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; query?: string; favorites?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const { page, sort, query, favorites, category } = await searchParams;
  const currentPage = Number(page) || 1;
  const currentSort = sort || "servings_asc";
  const itemsPerPage = 6;

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch ALL recipes for the user to sort in memory
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user?.id);

  let sortedRecipes = [...(allRecipes || [])] as Recipe[];

  // Apply search filter
  const queryStr = query?.toLowerCase() || "";
  if (queryStr) {
    sortedRecipes = sortedRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(queryStr) ||
      (Array.isArray(recipe.ingredients) && recipe.ingredients.some((ing: any) => ing.name.toLowerCase().includes(queryStr)))
    );
  }

  // Apply favorites filter
  if (favorites === "true") {
    // Note: We are assuming 'is_favorite' property exists on the recipe object.
    sortedRecipes = sortedRecipes.filter((recipe: any) => recipe.is_favorite === true);
  }

  // Apply category filter
  if (category && category !== "All") {
    sortedRecipes = sortedRecipes.filter((recipe) => recipe.category === category);
  }

  // Apply sorting
  switch (currentSort) {
    case "time_asc":
      sortedRecipes.sort((a, b) => getCookingTimeMinutes(a.cooking_time) - getCookingTimeMinutes(b.cooking_time));
      break;
    case "ingredients_asc":
      sortedRecipes.sort((a, b) => getIngredientCount(a.ingredients) - getIngredientCount(b.ingredients));
      break;
    case "servings_asc":
    default:
      sortedRecipes.sort((a, b) => getServingsCount(a.servings) - getServingsCount(b.servings));
      break;
  }

  // Apply pagination
  const totalItems = sortedRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage;
  const paginatedRecipes = sortedRecipes.slice(from, to);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <Sidebar />

      <div className="flex-1">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover New Recipes</h1>
            <p className="text-gray-500 mt-1">
              Explore a world of culinary delights. Find the perfect recipe for any occasion.
            </p>
          </div>

          <SortSelect />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id!}
              title={recipe.title}
              description={recipe.instructions || "No description available."}
              time={recipe.cooking_time}
              servings={recipe.servings}
              image={recipe.image_url || "https://placehold.co/600x400?text=No+Image"}
              isFavorite={(recipe as any).is_favorite}
            />
          ))}
          {paginatedRecipes.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No recipes found. Create one to get started!
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
      <AddRecipeButton />
    </div>
  );
}