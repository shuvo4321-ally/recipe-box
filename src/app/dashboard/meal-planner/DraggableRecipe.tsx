"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Recipe } from "@/services/recipeService";
import { GripVertical, MoreVertical } from "lucide-react";

interface DraggableRecipeProps {
    recipe: Recipe;
}

export function DraggableRecipe({ recipe }: DraggableRecipeProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `recipe-${recipe.id}`,
        data: {
            type: "recipe",
            recipe,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing mb-3 group transition-all"
        >
            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                    src={recipe.image_url || "/placeholder-recipe.jpg"}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{recipe.title}</h4>
                <p className="text-xs text-green-600 font-medium">{recipe.cooking_time} min</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                <MoreVertical className="h-4 w-4" />
            </button>
        </div>
    );
}
