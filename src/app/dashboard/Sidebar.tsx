"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

export default function Sidebar() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleFavoritesChange = (checked: boolean) => {
        const params = new URLSearchParams(searchParams);
        if (checked) {
            params.set("favorites", "true");
        } else {
            params.delete("favorites");
        }
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category && category !== "All") {
            params.set("category", category);
        } else {
            params.delete("category");
        }
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
            {/* Filters Header */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, ingredient..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get("query")?.toString()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Show Favorites */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="favorites"
                    onChange={(e) => handleFavoritesChange(e.target.checked)}
                    defaultChecked={searchParams.get("favorites") === "true"}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="favorites" className="text-sm font-medium text-gray-700">
                    Show Favorites Only
                </label>
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                </label>
                <select
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    defaultValue={searchParams.get("category")?.toString() || "All"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                    <option>All</option>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Dessert</option>
                </select>
            </div>

        </aside>
    );
}
