"use client";

import { useEffect, useState } from "react";
import { Recipe, recipeService } from "@/services/recipeService";
import { DraggableRecipe } from "./DraggableRecipe";
import { Search } from "lucide-react";

interface RecipeSidebarProps {
    recipes: Recipe[];
}

export default function RecipeSidebar({ recipes }: RecipeSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert"];

    const filteredRecipes = recipes.filter((recipe) => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                    <input
                        type="text"
                        placeholder="Find a recipe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-green-50/50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all placeholder:text-green-700/50 text-gray-900"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {filteredRecipes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No recipes found</div>
                ) : (
                    filteredRecipes.map((recipe) => (
                        <DraggableRecipe key={recipe.id} recipe={recipe} />
                    ))
                )}
            </div>
        </div>
    );
}
