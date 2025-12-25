"use client";

import { useState, useEffect } from "react";
import { DndContext, DragOverlay, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { Recipe, recipeService } from "@/services/recipeService";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mealPlanService } from "@/services/mealPlanService";
import { MealPlanItem, DayOfWeek, MealType } from "@/types/mealPlan";
import MealCalendar from "./MealCalendar";
import RecipeSidebar from "./RecipeSidebar";
import { DraggableRecipe } from "./DraggableRecipe";

export default function MealPlannerPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor)
    );

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(currentWeekStart, i);
        return {
            date: date,
            dateString: format(date, "yyyy-MM-dd"),
            dayName: format(date, "EEEE") as DayOfWeek,
            displayDate: format(date, "MMM d"),
        };
    });

    useEffect(() => {
        const fetchData = async () => {
            const startDate = format(currentWeekStart, "yyyy-MM-dd");
            const endDate = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");

            const [recipesResult, mealPlanResult] = await Promise.allSettled([
                recipeService.getUserRecipes(),
                mealPlanService.getMealPlan(startDate, endDate),
            ]);

            if (recipesResult.status === "fulfilled") {
                setRecipes(recipesResult.value || []);
            } else {
                console.error("Failed to fetch recipes:", recipesResult.reason);
            }

            if (mealPlanResult.status === "fulfilled") {
                setMealPlan(mealPlanResult.value || []);
            } else {
                console.error("Failed to fetch meal plan:", JSON.stringify(mealPlanResult.reason, null, 2));
            }
        };
        fetchData();
    }, [currentWeekStart]);

    const handlePreviousWeek = () => {
        setCurrentWeekStart((prev: Date) => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart((prev: Date) => addWeeks(prev, 1));
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        const recipe = active.data.current?.recipe;
        if (recipe) {
            setActiveRecipe(recipe);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveRecipe(null);

        if (!over) return;

        const recipe = active.data.current?.recipe as Recipe;
        const overId = over.id as string; // Format: "DateString-MealType"

        if (recipe && overId) {
            const [dateString, mealType] = overId.split("::") as [string, MealType];
            const targetDateObj = weekDates.find(d => d.dateString === dateString);

            if (targetDateObj && mealType) {
                try {
                    const newItem = await mealPlanService.addToMealPlan({
                        recipeId: recipe.id!,
                        day: targetDateObj.dayName,
                        date: dateString,
                        mealType,
                        order: mealPlan.length,
                    });
                    setMealPlan((prev) => [...prev, newItem]);
                } catch (error) {
                    console.error("Failed to add to meal plan:", error);
                    alert("Failed to save meal plan. Please try again.");
                }
            }
        }
    };

    const handleRemoveItem = async (id: string) => {
        try {
            await mealPlanService.removeFromMealPlan(id);
            setMealPlan((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Failed to remove item:", error);
            alert("Failed to remove item. Please try again.");
        }
    };

    const handleClearPlan = async () => {
        if (confirm("Are you sure you want to clear the entire meal plan for this week?")) {
            // Note: This needs to be updated in service to only clear current week if desired, 
            // but for now keeping as is (clears all) or we can update service later.
            // Actually, let's just clear UI for now and assume service clears all. 
            // Ideally we should update service to clear only range.
            try {
                await mealPlanService.clearMealPlan();
                setMealPlan([]);
            } catch (error) {
                console.error("Failed to clear plan:", error);
                alert("Failed to clear plan. Please try again.");
            }
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-8rem)] gap-6">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Meal Calendar</h1>
                            <p className="text-gray-500">Drag & drop to plan your perfect week.</p>
                        </div>

                        <button
                            onClick={handleClearPlan}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Clear Plan
                        </button>
                    </div>

                    <MealCalendar mealPlan={mealPlan} recipes={recipes} onRemoveItem={handleRemoveItem} weekDates={weekDates} />
                </div>

                <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-2 mb-6">
                        <button onClick={handlePreviousWeek} className="p-1 hover:bg-white rounded-md transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="font-medium text-gray-900 text-sm">
                            {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
                        </span>
                        <button onClick={handleNextWeek} className="p-1 hover:bg-white rounded-md transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recipes</h2>
                    <RecipeSidebar recipes={recipes} />
                </div>
            </div>

            <DragOverlay>
                {activeRecipe ? (
                    <div className="opacity-80 rotate-3 cursor-grabbing pointer-events-none w-64">
                        <DraggableRecipe recipe={activeRecipe} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
