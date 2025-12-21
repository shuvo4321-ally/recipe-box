"use client";
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "servings_asc";

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", newSort);
        // Reset to page 1 when sorting changes
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
                value={currentSort}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
                <option value="servings_asc">Servings: Low to High</option>
                <option value="ingredients_asc">Ingredients: Low to High</option>
                <option value="time_asc">Time: Low to High</option>
            </select>
        </div>
    );
}
