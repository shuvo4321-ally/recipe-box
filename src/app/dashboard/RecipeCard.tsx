"use client";

import { Clock, Users, Heart, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recipeService } from "@/services/recipeService";

interface RecipeCardProps {
    id: string; // Add id prop
    title: string;
    description: string;
    time: string;
    servings: string | number;
    image: string;
    isFavorite?: boolean;
}

export default function RecipeCard({
    id, // Destructure id
    title,
    description,
    time,
    servings,
    image,
    isFavorite = false,
}: RecipeCardProps) {
    const [favorite, setFavorite] = useState(isFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggleFavorite = async () => {
        if (loading) return;
        setLoading(true);
        const newStatus = !favorite;
        setFavorite(newStatus); // Optimistic update

        try {
            await recipeService.toggleFavorite(id, newStatus);
            router.refresh(); // Refresh to update server state/filtering
        } catch (error) {
            console.error("Failed to toggle favorite:", JSON.stringify(error, null, 2));
            setFavorite(!newStatus); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Image Container */}
            <div className="relative h-48 w-full">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                />
                <button
                    onClick={handleToggleFavorite}
                    disabled={loading}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50"
                >
                    <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

                {/* Meta */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{servings}</span>
                        </div>
                    </div>

                    <Link href={`/dashboard/edit/${id}`} className="p-2 bg-yellow-50 rounded-full text-yellow-600 hover:bg-yellow-100 transition-colors">
                        <Eye className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
