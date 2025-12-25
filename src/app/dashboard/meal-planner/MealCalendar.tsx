"use client";

import { DAYS, MEAL_TYPES, MealPlanItem } from "@/types/mealPlan";
import { MealSlot } from "./MealSlot";
import { Recipe } from "@/services/recipeService";

interface WeekDate {
    date: Date;
    dateString: string;
    dayName: string;
    displayDate: string;
}

interface MealCalendarProps {
    mealPlan: MealPlanItem[];
    recipes: Recipe[];
    onRemoveItem: (id: string) => void;
    weekDates: WeekDate[];
}

export default function MealCalendar({ mealPlan, recipes, onRemoveItem, weekDates }: MealCalendarProps) {
    const getItemsForSlot = (dateString: string, mealType: string) => {
        return mealPlan
            .filter((item) => item.date === dateString && item.mealType === mealType)
            .map((item) => {
                const recipe = recipes.find((r) => r.id === item.recipeId);
                return recipe ? { id: item.id, recipe } : null;
            })
            .filter((item): item is { id: string; recipe: Recipe } => item !== null);
    };

    return (
        <div className="grid grid-cols-7 gap-4 min-w-[800px]">
            {weekDates.map((dateObj) => (
                <div key={dateObj.dateString} className="space-y-3">
                    <div className="text-center pb-2 border-b border-gray-200">
                        <div className="font-bold text-gray-900">{dateObj.dayName}</div>
                        <div className="text-sm text-gray-500">{dateObj.displayDate}</div>
                    </div>
                    <div className="space-y-3">
                        {MEAL_TYPES.map((mealType) => (
                            <MealSlot
                                key={`${dateObj.dateString}-${mealType}`}
                                day={dateObj.dayName as any} // Cast to any to avoid strict type check for now, or import DayOfWeek
                                id={`${dateObj.dateString}::${mealType}`} // Pass unique ID for droppable
                                mealType={mealType}
                                items={getItemsForSlot(dateObj.dateString, mealType)}
                                onRemove={onRemoveItem}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
