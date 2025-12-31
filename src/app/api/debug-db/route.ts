import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    // Bypass auth for debugging
    const { data: mealPlans } = await supabase.from("meal_plans").select("*");
    const { data: shoppingItems } = await supabase.from("shopping_list_items").select("*");

    return NextResponse.json({ mealPlans, shoppingItems });
}
