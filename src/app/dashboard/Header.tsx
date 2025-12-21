"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut, User, UtensilsCrossed } from "lucide-react";

export default function Header({ userEmail }: { userEmail?: string }) {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-8 w-8 text-green-500" />
                        <span className="text-xl font-bold text-green-500">RecipeBox</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        <Link href="/dashboard" className="text-gray-900 font-medium hover:text-green-600">
                            Home
                        </Link>
                        <Link href="/dashboard/meal-planner" className="text-gray-900 font-medium hover:text-green-600">
                            Meal Planning
                        </Link>
                        <Link href="/dashboard/shopping-list" className="text-gray-900 font-medium hover:text-green-600">
                            Shopping List
                        </Link>
                        <Link href="/dashboard/AI-Chef" className="text-gray-900 font-medium hover:text-green-600">
                            AI Chef
                        </Link>
                    </nav>

                    {/* User & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-amber-700" />
                            </div>
                            <span className="hidden sm:block font-medium">{userEmail || "User"}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
