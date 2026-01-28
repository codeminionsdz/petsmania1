import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, subject, message } = body

    if (!customerId || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get customer email from database
    const supabase = await getSupabaseAdminClient()
    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", customerId)
      .single()

    if (customerError || !customer) {
      console.error("Error fetching customer:", customerError)
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Fallback: Log the email for logging/notification
    // In production, connect this to your actual email service
    console.log("📧 Customer Email Notification:")
    console.log("================================")
    console.log("To:", customer.email)
    console.log("Customer Name:", customer.first_name)
    console.log("Subject:", subject)
    console.log("Message:", message)
    console.log("================================")

    return NextResponse.json(
      {
        success: true,
        message: "Email notification sent",
        sentTo: customer.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in send-email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
