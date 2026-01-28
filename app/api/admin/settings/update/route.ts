import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 }
      )
    }

    // For admin settings, bypass auth since admin uses localStorage password
    console.log(`Updating setting: ${key} = ${value}`)

    // Use admin client directly
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update setting using admin client (bypasses RLS)
    const { data: updatedSetting, error: updateError } = await adminClient
      .from("site_settings")
      .update({
        value: String(value),
      })
      .eq("key", key)
      .select()

    if (updateError) {
      console.error("Error updating setting:", updateError)
      return NextResponse.json(
        { error: updateError.message || "Failed to update setting" },
        { status: 500 }
      )
    }

    if (!updatedSetting || updatedSetting.length === 0) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      )
    }

    console.log(`✅ Setting updated: ${key} = ${value}`)

    return NextResponse.json({
      success: true,
      data: updatedSetting[0],
    })
  } catch (error) {
    console.error("Error in PUT /api/admin/settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
