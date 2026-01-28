import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "No order IDs provided" },
        { status: 400 }
      )
    }

    // First verify the user is authenticated using SSR client
    const cookieStore = await cookies()
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

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No authenticated user")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`Linking ${orderIds.length} orders to user ${user.id}`)

    // Use admin client to bypass RLS for this operation
    const adminSupabase = await getSupabaseAdminClient()

    // Update guest orders to link them to the user
    const { error: updateError, data: updatedOrders } = await adminSupabase
      .from("orders")
      .update({ user_id: user.id })
      .in("id", orderIds)
      .is("user_id", null) // Only update orders that don't have a user_id yet
      .select()

    if (updateError) {
      console.error("Error linking orders:", updateError)
      return NextResponse.json(
        { error: "Failed to link orders", details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully linked ${orderIds.length} orders`)

    return NextResponse.json({
      success: true,
      message: `Linked ${orderIds.length} order(s) to your account`,
      data: updatedOrders,
    })
  } catch (error) {
    console.error("Error in POST /api/account/orders/link:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
