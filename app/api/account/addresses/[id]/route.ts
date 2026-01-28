import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("\n🔵 PUT HANDLER CALLED")
  console.log("Raw Params:", JSON.stringify(params))
  console.log("Params type:", typeof params)
  console.log("Params.id:", params?.id)
  
  try {
    const body = await request.json()
    console.log("PUT request body:", { firstName: body.firstName, lastName: body.lastName, phone: body.phone, address: body.address, wilayaId: body.wilayaId })
    
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

    // Try to get ID from params
    let addressId = params?.id
    
    // If params.id is undefined, try to get it from request URL
    if (!addressId || addressId === 'undefined') {
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
      addressId = pathSegments[pathSegments.length - 1]
      console.log("Retrieved addressId from URL:", addressId)
    }

    console.log("Final addressId:", addressId)

    if (!firstName || !lastName || !phone || !address || !wilayaId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firstName, lastName, phone, address, wilayaId" },
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
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`\n=== UPDATING ADDRESS ===`)
    console.log(`Searched Address ID: ${addressId}`)
    console.log(`User ID: ${user.id}`)

    // First, try to get all addresses for the user to debug
    const { data: userAddresses, error: listError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)

    console.log("All user's addresses:", JSON.stringify(userAddresses, null, 2))
    console.log("Available address IDs:", userAddresses?.map(a => a.id) || [])

    // Verify the address belongs to the user
    console.log(`Querying for address ID: ${addressId}`)
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .single()

    console.log("Address query error:", checkError?.message)
    console.log("Found address:", JSON.stringify(existingAddress, null, 2))

    if (checkError || !existingAddress) {
      console.error("❌ Address not found - returning 404")
      console.error("Searched for ID:", addressId)
      console.error("User addresses available:", userAddresses?.map(a => a.id))
      return NextResponse.json(
        { 
          success: false, 
          error: "Address not found",
          details: {
            searchedId: addressId,
            userId: user.id,
            availableAddresses: userAddresses?.map(a => ({id: a.id, user_id: a.user_id})) || [],
            queryError: checkError?.message,
          }
        },
        { status: 404 }
      )
    }

    if (existingAddress?.user_id !== user.id) {
      console.error("User not authorized for this address")
      console.error("Address user_id:", existingAddress?.user_id, "Current user:", user.id)
      return NextResponse.json(
        { 
          success: false, 
          error: "Not authorized to update this address" 
        },
        { status: 403 }
      )
    }

    // Update the address
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        email: email || null,
        address,
        city: city || null,
        wilaya_id: wilayaId,
        postal_code: postalCode || null,
      })
      .eq("id", addressId)
      .select()

    if (updateError) {
      console.error("Error updating address:", updateError)
      return NextResponse.json(
        { success: false, error: updateError.message || "Failed to update address" },
        { status: 500 }
      )
    }

    console.log(`✅ Address updated:`, addressId)

    return NextResponse.json({
      success: true,
      data: updatedAddress?.[0],
    })
  } catch (error) {
    console.error("Error in PUT /api/account/addresses/[id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("\n🔴 DELETE HANDLER CALLED")
  console.log("Raw Params:", JSON.stringify(params))
  
  let addressId = params?.id
  
  // If params.id is undefined, try to get it from request URL
  if (!addressId || addressId === 'undefined') {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    addressId = pathSegments[pathSegments.length - 1]
    console.log("Retrieved addressId from URL:", addressId)
  }

  console.log("Final addressId for deletion:", addressId)
  
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

    console.log(`Deleting address ${addressId} for user ${user.id}`)

    // Verify the address belongs to the user
    const { data: existingAddress } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", addressId)
      .single()

    console.log("Existing address:", existingAddress)
    console.log("Address user_id:", existingAddress?.user_id)
    console.log("Current user:", user.id)
    console.log("Ownership match:", existingAddress?.user_id === user.id)

    if (!existingAddress || existingAddress.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this address" },
        { status: 403 }
      )
    }

    // Delete the address
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)

    if (deleteError) {
      console.error("Error deleting address:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete address", details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Address deleted:`, addressId)

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/account/addresses/[id]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
