import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Create or update user profile after registration
 * This endpoint uses admin client to bypass RLS policies
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from their session FIRST (using server client)
    const serverSupabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Now use admin client for profile creation (to bypass RLS)
    const supabase = await getSupabaseAdminClient()

    const body = await request.json()
    const { email, phone, first_name, last_name } = body

    console.log(`[CREATE-PROFILE] Creating/updating profile for user ${user.id}`)
    console.log(`[CREATE-PROFILE] Phone: ${phone}, Email: ${email}`)

    // Insert or update user profile using admin client
    const { error, data } = await supabase
      .from("profiles")
      .upsert(
        [
          {
            id: user.id,
            email: email,
            phone: phone,
            first_name: first_name,
            last_name: last_name,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "id" }
      )

    if (error) {
      console.error("[CREATE-PROFILE] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[CREATE-PROFILE] Profile created/updated successfully`)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[CREATE-PROFILE] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
