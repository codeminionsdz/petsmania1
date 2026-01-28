import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      wilayaId,
      postalCode,
    } = body

    if (!firstName || !lastName || !phone || !address || !wilayaId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

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

    console.log(`Creating address for user ${user.id}`)

    // Insert the address
    const { data: newAddress, error: insertError } = await supabase
      .from("addresses")
      .insert([
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          email: email || null,
          address,
          city: city || null,
          wilaya_id: wilayaId,
          postal_code: postalCode || null,
          is_default: false,
        },
      ])
      .select()

    if (insertError) {
      console.error("Error inserting address:", insertError)
      return NextResponse.json(
        { error: "Failed to save address", details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Address created:`, newAddress?.[0]?.id)

    return NextResponse.json({
      success: true,
      data: newAddress?.[0],
    })
  } catch (error) {
    console.error("Error in POST /api/account/addresses:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's addresses with wilaya names
    const { data: addresses, error: getError } = await supabase
      .from("addresses")
      .select("*, wilayas(id, name)")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (getError) {
      console.error("Error fetching addresses:", getError)
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: addresses || [],
    })
  } catch (error) {
    console.error("Error in GET /api/account/addresses:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
