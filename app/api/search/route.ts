import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    console.log('[GET /api/search] ========== START SEARCH ==========')
    console.log('[GET /api/search] Query:', query)

    if (!query || query.trim().length === 0) {
      console.log('[GET /api/search] Empty query')
      return NextResponse.json(
        { error: 'Search query is required', products: [] },
        { status: 400 }
      )
    }

    console.log('[GET /api/search] Getting Supabase client...')
    const supabase = await getSupabaseServerClient()
    console.log('[GET /api/search] Supabase client ready')

    console.log('[GET /api/search] Executing search for:', query)

    // Simple search by name - using the most basic approach
    const { data, error, status, statusText } = await supabase
      .from('products')
      .select('id, name, slug, short_description, price, original_price, discount, product_images(url, alt, position)', { count: 'exact' })
      .ilike('name', `%${query}%`)
      .limit(50)

    console.log('[GET /api/search] Query returned:')
    console.log('  - Status:', status)
    console.log('  - Status Text:', statusText)
    console.log('  - Error:', error)
    console.log('  - Data count:', data?.length)

    if (error) {
      console.error('[GET /api/search] ❌ Supabase ERROR:')
      console.error('  - Code:', error.code)
      console.error('  - Message:', error.message)
      console.error('  - Hint:', error.hint)
      console.error('  - Full error:', JSON.stringify(error, null, 2))

      return NextResponse.json(
        {
          error: 'Failed to search products',
          message: error.message,
          code: error.code,
          products: [],
        },
        { status: 500 }
      )
    }

    console.log('[GET /api/search] ✅ Success - found', data?.length, 'products')
    if (data && data.length > 0) {
      console.log('[GET /api/search] Sample results:', data.slice(0, 2))
    }

    return NextResponse.json({
      query,
      products: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('[GET /api/search] ❌ CATCH ERROR:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''

    console.error('[GET /api/search] Error message:', errorMessage)
    console.error('[GET /api/search] Error stack:', errorStack)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMessage,
        products: [],
      },
      { status: 500 }
    )
  } finally {
    console.log('[GET /api/search] ========== END SEARCH ==========\n')
  }
}



