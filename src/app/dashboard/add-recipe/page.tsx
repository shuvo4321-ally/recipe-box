"use client";

import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recipeService } from "@/services/recipeService";

interface Ingredient {
    id: string;
    qty: string;
    unit: string;
    name: string;
}

export default function AddRecipePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [cookingTime, setCookingTime] = useState("");
    const [servings, setServings] = useState("");
    const [category, setCategory] = useState("Breakfast");
    const [instructions, setInstructions] = useState("");

    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: "1", qty: "2", unit: "cups", name: "flour" },
        { id: "2", qty: "1", unit: "cup", name: "sugar" },
    ]);

    const [newIngredient, setNewIngredient] = useState({
        qty: "",
        unit: "",
        name: "",
    });

    const handleAddIngredient = () => {
        if (newIngredient.name) {
            setIngredients([
                ...ingredients,
                { ...newIngredient, id: Math.random().toString(36).substr(2, 9) },
            ]);
            setNewIngredient({ qty: "", unit: "", name: "" });
        }
    };

    const handleDeleteIngredient = (id: string) => {
        setIngredients(ingredients.filter((ing) => ing.id !== id));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await recipeService.addRecipe(
                {
                    title,
                    cooking_time: cookingTime,
                    servings,
                    category,
                    ingredients,
                    instructions,
                },
                imageFile || undefined
            );
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Error saving recipe:", error);
            alert("Failed to save recipe. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a New Recipe</h1>

            <div className="space-y-8">
                {/* Recipe Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        Recipe Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter the title of your recipe"
                        className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                            Cooking Time
                        </label>
                        <input
                            type="text"
                            value={cookingTime}
                            onChange={(e) => setCookingTime(e.target.value)}
                            placeholder="e.g., 30 minutes"
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                            Servings
                        </label>
                        <input
                            type="text"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            placeholder="e.g., 4 people"
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                // Added 'appearance-none' to the start of the class list below
                                className="appearance-none w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            >
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Dessert</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-900">
                        Ingredients
                    </label>

                    <div className="space-y-3">
                        {ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center justify-between group py-2">
                                <span className="text-gray-700">
                                    {ing.qty} {ing.unit} {ing.name}
                                </span>
                                <button
                                    onClick={() => handleDeleteIngredient(ing.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-3">
                            <input
                                type="text"
                                placeholder="Qty"
                                value={newIngredient.qty}
                                onChange={(e) => setNewIngredient({ ...newIngredient, qty: e.target.value })}
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="col-span-3">
                            <input
                                type="text"
                                placeholder="Unit"
                                value={newIngredient.unit}
                                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="col-span-5">
                            <input
                                type="text"
                                placeholder="Ingredient Name"
                                value={newIngredient.name}
                                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="col-span-1">
                            <button
                                onClick={handleAddIngredient}
                                className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">
                        Instructions
                    </label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Enter step-by-step instructions..."
                        rows={8}
                        className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Recipe Image */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">
                        Recipe Image
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50 relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-48 rounded-lg object-cover"
                            />
                        ) : (
                            <>
                                <div className="bg-gray-200 p-3 rounded-lg mb-4">
                                    <ImageIcon className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="text-green-600 font-medium">Upload a file</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Recipe"}
                    </button>
                </div>
            </div>
        </div>
    );
}
