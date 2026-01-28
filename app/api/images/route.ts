import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting image conversion...")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("No file provided")
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Convert file to Data URL
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`Data URL created, length: ${dataUrl.length}`)

    return NextResponse.json(
      { 
        url: dataUrl,
        size: dataUrl.length 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Image conversion error:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve stored image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("id")

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID required" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", imageId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error("Image retrieval error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
