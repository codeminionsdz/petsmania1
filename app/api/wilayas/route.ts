import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
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

    // Get all active wilayas
    const { data: wilayasData, error } = await supabase
      .from("wilayas")
      .select("id, name, code, shipping_cost, delivery_days, is_active")
      .eq("is_active", true)
      .order("name")

    if (error) {
      console.error("Error fetching wilayas:", error)
      return NextResponse.json(
        { error: "Failed to fetch wilayas" },
        { status: 500 }
      )
    }

    // Map to correct format
    const wilayas = wilayasData?.map((w: any) => ({
      id: w.id,
      name: w.name,
      code: w.code,
      shippingCost: w.shipping_cost,
      deliveryDays: w.delivery_days,
      isActive: w.is_active,
    })) || []

    return NextResponse.json({
      success: true,
      data: wilayas,
    })
  } catch (error) {
    console.error("Error in GET /api/wilayas:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
