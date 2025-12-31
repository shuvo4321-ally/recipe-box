import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    // Delete EVERYTHING from shopping list
    const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to delete all rows since we need a where clause usually, or just use a dummy condition

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Wiped shopping list" });
}
