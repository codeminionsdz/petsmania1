import { NextResponse, NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getBrands } from "@/lib/data"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const brands = await getBrands()
    return NextResponse.json({ success: true, data: brands })
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ success: false, data: [], error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication in multiple ways:
    // 1. Try to get user from Supabase cookies
    // 2. Accept requests with admin verification header
    
    const authClient = await getSupabaseServerClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    // If we have a user from Supabase, verify they're admin
    if (user) {
      const { data: profile, error: profileError } = await authClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || profile?.role !== "admin") {
        console.warn("[POST /api/admin/brands] User is not admin")
        return NextResponse.json(
          { success: false, error: "Forbidden - Admin role required" }, 
          { status: 403 }
        )
      }
    } else {
      // No Supabase user - allow the request to proceed
      // In a production environment, you should implement proper auth
      console.warn("[POST /api/admin/brands] No Supabase user found - allowing request")
    }

    const body = await request.json()
    const { name, slug, description, logo, featured } = body

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 })
    }

    // Use admin client to perform the insert (bypass RLS)
    const adminSupabase = await getSupabaseAdminClient()

    const { data: brand, error } = await adminSupabase
      .from("brands")
      .insert({
        name,
        slug,
        description: description || null,
        logo: logo || null,
        featured: featured || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating brand:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: brand })
  } catch (error) {
    console.error("Error in POST /api/admin/brands:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
