import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || !subtotal) {
      return NextResponse.json({ success: false, error: "Code and subtotal are required" }, { status: 400 })
    }

    // Create Supabase client
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
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Check if promo code exists and is valid
    const { data: promoCode, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !promoCode) {
      return NextResponse.json({ success: false, error: "Invalid promo code" }, { status: 400 })
    }

    // Check if code has expired
    const now = new Date()
    const validFrom = new Date(promoCode.valid_from)
    const validUntil = new Date(promoCode.valid_until)

    if (now < validFrom || now > validUntil) {
      return NextResponse.json({ success: false, error: "Promo code has expired" }, { status: 400 })
    }

    // Check if max uses reached
    if (promoCode.used_count >= promoCode.max_uses) {
      return NextResponse.json({ success: false, error: "Promo code has reached maximum uses" }, { status: 400 })
    }

    // Check minimum order amount
    if (subtotal < promoCode.min_order_amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount is ${promoCode.min_order_amount.toLocaleString()} DA`,
        },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (promoCode.discount_type === "percentage") {
      discountAmount = Math.round(subtotal * (promoCode.discount_value / 100))
    } else if (promoCode.discount_type === "fixed") {
      discountAmount = promoCode.discount_value
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promoCode.code,
        discountType: promoCode.discount_type,
        discountValue: promoCode.discount_value,
        discountAmount,
      },
    })
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
