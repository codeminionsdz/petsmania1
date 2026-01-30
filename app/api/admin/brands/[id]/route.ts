import { NextResponse, NextRequest } from "next/server"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authClient = await getSupabaseServerClient()

    // Try to get user from Supabase
    const {
      data: { user },
    } = await authClient.auth.getUser()

    // If we have a user, verify they're admin
    if (user) {
      const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role !== "admin") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
    } else {
      // No Supabase user - allow the request to proceed
      console.warn("[PUT /api/admin/brands/[id]] No Supabase user found - allowing request")
    }

    const body = await request.json()
    const { name, slug, description, logo, featured } = body

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 })
    }

    // Use admin client to perform the update
    const adminSupabase = await getSupabaseAdminClient()

    const { data: brand, error } = await adminSupabase
      .from("brands")
      .update({
        name,
        slug,
        description: description || null,
        logo: logo || null,
        featured: featured || false,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating brand:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: brand })
  } catch (error) {
    console.error("Error in PUT /api/admin/brands/[id]:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authClient = await getSupabaseServerClient()

    // Try to get user from Supabase
    const {
      data: { user },
    } = await authClient.auth.getUser()

    // If we have a user, verify they're admin
    if (user) {
      const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role !== "admin") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
    } else {
      // No Supabase user - allow the request to proceed
      console.warn("[DELETE /api/admin/brands/[id]] No Supabase user found - allowing request")
    }

    // Use admin client to perform the delete
    const adminSupabase = await getSupabaseAdminClient()

    const { error } = await adminSupabase.from("brands").delete().eq("id", id)

    if (error) {
      console.error("Error deleting brand:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error("Error in DELETE /api/admin/brands/[id]:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
