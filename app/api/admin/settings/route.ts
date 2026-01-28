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

    // Get all settings (public data)
    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("key, value, data_type, description")

    if (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      )
    }

    // Convert to key-value object for easy access
    const settingsObject: Record<string, any> = {}
    settings?.forEach((setting) => {
      // Parse value based on data_type
      let parsedValue = setting.value
      if (setting.data_type === "number") {
        parsedValue = Number(setting.value)
      } else if (setting.data_type === "boolean") {
        parsedValue = setting.value === "true" || setting.value === true
      }
      settingsObject[setting.key] = parsedValue
    })

    return NextResponse.json({
      success: true,
      data: settingsObject,
      raw: settings,
    })
  } catch (error) {
    console.error("Error in GET /api/admin/settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
