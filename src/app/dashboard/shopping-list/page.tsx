"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Trash2, Plus, ChevronDown, ChevronUp, Check } from "lucide-react";
import { shoppingListService, ShoppingListItem } from "@/services/shoppingListService";
import { mealPlanService } from "@/services/mealPlanService";
import { recipeService, Recipe } from "@/services/recipeService";
import Image from "next/image";

export default function ShoppingListPage() {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [meals, setMeals] = useState<Recipe[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "Produce": true,
        "Dairy & Eggs": true,
        "Meat & Fish": true,
        "Pantry Staples": true,
        "Other": true
    });

    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Removed auto-sync to prevent "Clear List" from being undone
            // await shoppingListService.syncFromMealPlan(startDate, endDate);

            const [itemsData, mealPlanData] = await Promise.all([
                shoppingListService.getItems(),
                mealPlanService.getMealPlan(startDate, endDate)
            ]);

            setItems(itemsData || []);

            // Fetch full recipe details for the meals list
            if (mealPlanData && mealPlanData.length > 0) {
                // Fetch all recipes once
                const allRecipes = await recipeService.getUserRecipes();
                const recipesMap = new Map(allRecipes.map(r => [r.id, r]));

                // Map meal plans to recipes (keeping duplicates)
                const mealsWithPlan = mealPlanData.map(mp => {
                    const recipe = recipesMap.get(mp.recipeId);
                    return recipe ? { ...recipe, _planId: mp.id, _day: mp.day, _date: mp.date } : null;
                }).filter(Boolean) as (Recipe & { _planId: string, _day: string, _date: string })[];

                setMeals(mealsWithPlan);
            } else {
                setMeals([]);
            }

        } catch (error) {
            console.error("Failed to load shopping list:", JSON.stringify(error, null, 2));
            if (error instanceof Error) console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await shoppingListService.syncFromMealPlan(startDate, endDate);
            await loadData();
        } catch (error) {
            console.error("Failed to sync:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        try {
            const newItem = await shoppingListService.addItem(newItemName);
            setItems([...items, newItem]);
            setNewItemName("");
        } catch (error) {
            console.error("Failed to add item:", error);
        }
    };

    const handleToggleItem = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setItems(items.map(i => i.id === id ? { ...i, is_checked: !currentStatus } : i));
            await shoppingListService.toggleItem(id, !currentStatus);
        } catch (error) {
            console.error("Failed to toggle item:", error);
            // Revert
            setItems(items.map(i => i.id === id ? { ...i, is_checked: currentStatus } : i));
        }
    };

    const handleClearList = async () => {
        if (confirm("Are you sure you want to clear the entire shopping list? This will also remove all planned meals for this week.")) {
            try {
                await Promise.all([
                    shoppingListService.clearList(),
                    mealPlanService.clearMealPlanForRange(startDate, endDate)
                ]);
                setItems([]);
                setMeals([]);
            } catch (error) {
                console.error("Failed to clear list:", error);
            }
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Group items by category
    const groupedItems: Record<string, ShoppingListItem[]> = {
        "Produce": [],
        "Dairy & Eggs": [],
        "Meat & Fish": [],
        "Pantry Staples": [],
        "Other": []
    };

    items.forEach(item => {
        const cat = groupedItems[item.category] ? item.category : "Other";
        groupedItems[cat].push(item);
    });

    const categories = ["Produce", "Dairy & Eggs", "Meat & Fish", "Pantry Staples", "Other"];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Your Shopping List</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Sync from Meals
                    </button>
                    <button
                        onClick={handleClearList}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear List
                    </button>
                </div>
            </div>
            <p className="text-gray-500 mb-8">A shopping list generated from your planned meals</p>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Meals */}
                <div className="w-full lg:w-1/3">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Meals for this List</h2>
                    <div className="space-y-4">
                        {meals.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                                No meals planned for this week.
                            </div>
                        ) : (
                            meals.map((meal: any) => (
                                <div key={meal._planId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                        {meal.image_url ? (
                                            <Image src={meal.image_url} alt={meal.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-xs">No img</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{meal.title}</h3>
                                        <p className="text-sm text-gray-500">{meal.category} • {meal._day}</p>
                                        <p className="text-xs text-gray-400">{format(new Date(meal._date), "MMMM d, yyyy")}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Shopping List */}
                <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Shopping List</h2>

                    <div className="space-y-6">
                        {categories.map(category => {
                            const categoryItems = groupedItems[category];
                            if (categoryItems.length === 0 && category !== "Other") return null; // Show Other if it has items, or maybe hide empty categories always?
                            if (categoryItems.length === 0) return null;

                            return (
                                <div key={category} className="border-b border-gray-100 pb-4 last:border-0">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="flex items-center justify-between w-full mb-3 group"
                                    >
                                        <h3 className="font-bold text-gray-900 text-lg">{category}</h3>
                                        {expandedCategories[category] ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                        )}
                                    </button>

                                    {expandedCategories[category] && (
                                        <div className="space-y-2">
                                            {categoryItems.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 group">
                                                    <button
                                                        onClick={() => handleToggleItem(item.id, item.is_checked)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.is_checked
                                                            ? "bg-green-500 border-green-500 text-white"
                                                            : "border-gray-300 hover:border-green-500"
                                                            }`}
                                                    >
                                                        {item.is_checked && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <span className={`text-gray-700 ${item.is_checked ? "line-through text-gray-400" : ""}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Custom Item */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3">Add Custom Item</h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                                placeholder="e.g., 1 bag - Coffee Beans"
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                            />
                            <button
                                onClick={handleAddItem}
                                className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
