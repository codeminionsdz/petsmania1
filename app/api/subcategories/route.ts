import { getAllSubcategories } from "@/lib/data"

export async function GET() {
  try {
    console.log("[GET /api/subcategories] Fetching all subcategories")
    
    const subcategories = await getAllSubcategories()
    
    console.log("[GET /api/subcategories] Found", subcategories.length, "subcategories")
    
    if (subcategories.length > 0) {
      console.log("[GET /api/subcategories] Sample subcategories:", 
        subcategories.slice(0, 3).map(s => ({
          id: s.id,
          name: s.name,
          category_id: s.category_id,
          categoryId: s.categoryId,
          animal_type: s.animal_type
        }))
      )
    }
    
    if (subcategories.length === 0) {
      console.warn("[GET /api/subcategories] No subcategories found in database")
    }
    
    return Response.json(subcategories)
  } catch (error) {
    console.error("[GET /api/subcategories] Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch subcategories" },
      { status: 500 }
    )
  }
}
