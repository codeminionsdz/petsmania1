import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting file conversion...")
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

    // For images, convert to compressed Base64 Data URL
    if (file.type.startsWith("image/")) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      
      // Limit Data URL size - if too large, still save it but warn
      const dataUrl = `data:${file.type};base64,${base64}`
      const sizeInMB = dataUrl.length / (1024 * 1024)
      
      console.log(`Image Data URL created, size: ${sizeInMB.toFixed(2)}MB`)

      // If image is too large (>2MB), we need to handle it differently
      if (sizeInMB > 2) {
        console.warn("Image is large, size:", sizeInMB.toFixed(2), "MB")
        // For now, still return it - frontend should handle compression
      }

      return NextResponse.json(
        { url: dataUrl },
        { status: 200 }
      )
    }

    // For other file types
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json(
      { url: dataUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
