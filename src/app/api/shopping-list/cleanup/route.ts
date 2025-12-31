import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Apply the constraint (if it doesn't exist, this might fail or we can use raw SQL if RPC is enabled, 
        // but standard supabase client doesn't support raw SQL easily without RPC.
        // However, we can use the 'postgres' library if available, or we can try to use a workaround.)

        // Actually, Supabase JS client cannot run DDL (ALTER TABLE) directly unless we have a specific RPC function for it.
        // But we can try to clean up "orphaned" items first.

        // Fetch all shopping list items with a meal_plan_id
        const { data: items } = await supabase
            .from("shopping_list_items")
            .select("id, meal_plan_id")
            .not("meal_plan_id", "is", null);

        if (!items) return NextResponse.json({ message: "No items to check" });

        // Fetch all valid meal plan IDs
        const { data: plans } = await supabase
            .from("meal_plans")
            .select("id");

        const validPlanIds = new Set(plans?.map(p => p.id));

        // Find orphans
        const orphans = items.filter(i => !validPlanIds.has(i.meal_plan_id));

        if (orphans.length > 0) {
            const { error } = await supabase
                .from("shopping_list_items")
                .delete()
                .in("id", orphans.map(i => i.id));

            if (error) throw error;
            return NextResponse.json({ success: true, message: `Deleted ${orphans.length} orphaned items.` });
        }

        return NextResponse.json({ success: true, message: "No orphaned items found." });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
