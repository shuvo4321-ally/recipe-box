"use client";

import { useDroppable } from "@dnd-kit/core";
import { MealType, DayOfWeek } from "@/types/mealPlan";
import { Recipe } from "@/services/recipeService";
import Image from "next/image";
import { X } from "lucide-react";

interface MealSlotProps {
    day: DayOfWeek;
    mealType: MealType;
    items: { id: string; recipe: Recipe }[];
    onRemove: (id: string) => void;
    id?: string; // Optional ID for droppable
}

export function MealSlot({ day, mealType, items, onRemove, id }: MealSlotProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id || `${day}-${mealType}`,
        data: {
            day,
            mealType,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[120px] p-2 rounded-lg border-2 border-dashed transition-colors ${isOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
        >
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{mealType}</div>

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="relative group bg-white p-2 rounded shadow-sm border border-gray-100 flex gap-2 items-center">
                        <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                                src={item.recipe.image_url || "/placeholder-recipe.jpg"}
                                alt={item.recipe.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-900 truncate">{item.recipe.title}</p>
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm border border-gray-200 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
