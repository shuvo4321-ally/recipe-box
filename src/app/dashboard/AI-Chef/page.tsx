"use client";

import { useState } from "react";
import { generateChefResponse, ChefResponse } from "@/services/aiChefService";
import { Send, ChefHat, Loader2, ExternalLink } from "lucide-react";

export default function AIChefPage() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState<ChefResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const suggestions = [
        "Healthy 30-minute dinner ideas",
        "What's a good substitute for buttermilk?",
        "How to perfectly sear a steak",
        "Creative leftover chicken recipes",
    ];

    const handleSearch = async (term: string) => {
        if (!term.trim()) return;

        setLoading(true);
        setError("");
        setResponse(null);

        // Update input if clicked from suggestion
        if (term !== query) {
            setQuery(term);
        }

        try {
            const result = await generateChefResponse(term);
            setResponse(result);
        } catch (err) {
            setError("Sorry, I couldn't get a response at the moment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch(query);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <ChefHat className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Your Culinary Assistant
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Type your cooking question below, or get inspired by our suggestions.
                    </p>
                </div>

                {/* Input Section */}
                <div className="relative max-w-3xl mx-auto w-full">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What can I cook with chicken breast and broccoli?"
                            className="block w-full rounded-2xl border-0 py-4 pl-6 pr-16 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-lg sm:leading-6 bg-white transition-shadow hover:shadow-md"
                            disabled={loading}
                        />
                        <div className="absolute right-2">
                            <button
                                onClick={() => handleSearch(query)}
                                disabled={loading || !query.trim()}
                                className={`p-2 rounded-xl flex items-center justify-center transition-colors ${loading || !query.trim()
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                    }`}
                            >
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Send className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                {!response && !loading && (
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearch(suggestion)}
                                className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors border border-green-100"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {/* Response Section */}
                {response && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-green max-w-none mb-6">
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {response.text}
                            </div>
                        </div>

                        {/* Sources Section */}
                        {response.sources && response.sources.length > 0 && (
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    Sources
                                </h3>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {response.sources.map((source, index) => (
                                        <a
                                            key={index}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                                        >
                                            <div className="bg-white p-1.5 rounded-md shadow-sm group-hover:shadow text-gray-500">
                                                <ExternalLink className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium truncate">
                                                {source.title}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-600 mt-4 bg-red-50 p-4 rounded-lg">
                        {error}
                    </div>
                )}

            </div>
        </div>
    );
}
