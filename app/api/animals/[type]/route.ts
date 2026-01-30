import { NextRequest, NextResponse } from 'next/server'
import { getAnimalBySlug } from '@/lib/data'
import type { AnimalType } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = (params.type || 'cat').toLowerCase() as AnimalType

    const animal = await getAnimalBySlug(type)

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(animal, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error(`Error fetching animal ${params.type}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch animal' },
      { status: 500 }
    )
  }
}
