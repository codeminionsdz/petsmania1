import { NextRequest, NextResponse } from 'next/server'
import { getProductsByHierarchy } from '@/lib/data'
import type { AnimalType } from '@/lib/types'

const VALID_ANIMALS: AnimalType[] = ['cat', 'dog', 'bird', 'other']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type: rawType } = await params
    const type = (rawType || 'cat').toLowerCase() as AnimalType

    // Validate animal type
    if (!VALID_ANIMALS.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid animal type' },
        { status: 400 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
    const sortBy = (searchParams.get('sortBy') || 'newest') as any
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined
    const inStock = searchParams.get('inStock') === 'true'
    const brandsParam = searchParams.get('brands')
    const brands = brandsParam ? brandsParam.split(',').filter(Boolean) : undefined

    // Parse hierarchical filters with safe guards
    // If categoryId is not provided, fetch products by animal only
    let categoryId: string | undefined
    const categoryIdParam = searchParams.get('categoryId')
    if (categoryIdParam && categoryIdParam.trim()) {
      categoryId = categoryIdParam
    }

    // Subcategory ID should only be used if categoryId exists
    let subcategoryId: string | undefined
    if (categoryId) {
      const subcategoryIdParam = searchParams.get('subcategoryId')
      if (subcategoryIdParam && subcategoryIdParam.trim()) {
        subcategoryId = subcategoryIdParam
      }
    }

    // Handle categories parameter (legacy support)
    // This is used for filtering by multiple categories
    const categoriesParam = searchParams.get('categories')
    const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : undefined

    // Build filter options
    const filterOptions = {
      brands,
      categories,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      page,
      pageSize,
    }

    // Fetch products with safe hierarchy-based filters
    // - If categoryId is undefined: fetch by animal only
    // - If categoryId is defined, subcategoryId undefined: fetch by animal + category
    // - If both categoryId and subcategoryId defined: fetch by animal + category + subcategory
    const result = await getProductsByHierarchy(
      type,
      categoryId,
      subcategoryId,
      filterOptions
    )

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error(`Error fetching products for animal:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
