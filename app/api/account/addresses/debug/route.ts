import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Create SSR client (respects RLS)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Create admin client (bypasses RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("\n=== DEBUG: ADDRESSES RLS CHECK ===")
    console.log("User ID:", user.id)

    // Query 1: Using SSR client (respects RLS)
    console.log("\n--- Query 1: SSR Client (respects RLS) ---")
    const { data: ssrData, error: ssrError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)

    console.log("SSR Query Error:", ssrError?.message)
    console.log("SSR Query Results:", ssrData?.length || 0, "addresses")
    console.log("SSR Data:", JSON.stringify(ssrData, null, 2))

    // Query 2: Using admin client (bypasses RLS)
    console.log("\n--- Query 2: Admin Client (bypasses RLS) ---")
    const { data: adminData, error: adminError } = await adminClient
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)

    console.log("Admin Query Error:", adminError?.message)
    console.log("Admin Query Results:", adminData?.length || 0, "addresses")
    console.log("Admin Data:", JSON.stringify(adminData, null, 2))

    // Query 3: Check all addresses in table (admin only)
    console.log("\n--- Query 3: All addresses in table (admin) ---")
    const { data: allAddresses, error: allError } = await adminClient
      .from("addresses")
      .select("id, user_id, first_name")

    console.log("All addresses count:", allAddresses?.length || 0)
    console.log("All addresses:", JSON.stringify(allAddresses, null, 2))

    return NextResponse.json({
      user_id: user.id,
      ssr_query: {
        error: ssrError?.message,
        count: ssrData?.length || 0,
        data: ssrData
      },
      admin_query: {
        error: adminError?.message,
        count: adminData?.length || 0,
        data: adminData
      },
      all_addresses: {
        count: allAddresses?.length || 0,
        data: allAddresses
      }
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
