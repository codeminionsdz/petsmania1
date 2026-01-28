import { NextResponse } from "next/server"
import { getCategoriesWithHierarchy } from "@/lib/data"

export async function GET() {
  try {
    const categories = await getCategoriesWithHierarchy()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json([], { status: 500 })
  }
}
