import { NextResponse } from "next/server"
import { getCategoriesWithHierarchy, getCategoriesByAnimal } from "@/lib/data"
import { AnimalType } from "@/lib/types"

export async function GET(request: Request) {
  try {
    console.log("[GET /api/categories] Request received")
    
    // Check if animal parameter is provided
    const { searchParams } = new URL(request.url)
    const animal = searchParams.get("animal") as AnimalType | null

    console.log("[GET /api/categories] Animal parameter:", animal)

    let categories
    if (animal) {
      // Get animal-specific categories only
      console.log("[GET /api/categories] Fetching categories for animal:", animal)
      categories = await getCategoriesByAnimal(animal)
    } else {
      // Get all categories with hierarchy
      console.log("[GET /api/categories] Fetching all categories with hierarchy")
      categories = await getCategoriesWithHierarchy()
    }

    console.log("[GET /api/categories] Returning", categories.length, "categories")
    return NextResponse.json(categories)
  } catch (error) {
    console.error("[GET /api/categories] Error fetching categories:", error)
    return NextResponse.json([], { status: 500 })
  }
}
