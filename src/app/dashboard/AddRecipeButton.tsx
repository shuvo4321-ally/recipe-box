"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddRecipeButton() {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Link
                href="/dashboard/add-recipe"
                className="flex items-center justify-center p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 bg-green-500 hover:bg-green-600"
                aria-label="Add Recipe"
            >
                <Plus className="h-8 w-8 text-white" />
            </Link>
        </div>
    );
}
