import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { AnimalType } from '@/lib/types'

interface AnimalBreadcrumbProps {
  animalType: AnimalType
  animalDisplayName?: string
  categoryName?: string
  categorySlug?: string
  productName?: string
}

const ANIMAL_EMOJIS: Record<AnimalType, string> = {
  cat: '🐱',
  dog: '🐕',
  bird: '🐦',
  other: '🐾',
}

const ANIMAL_ROUTES: Record<AnimalType, string> = {
  cat: '/cats',
  dog: '/dogs',
  bird: '/birds',
  other: '/categories/other',
}

const ANIMAL_DISPLAY_NAMES: Record<AnimalType, string> = {
  cat: 'Cats',
  dog: 'Dogs',
  bird: 'Birds',
  other: 'Other Pets',
}

export function AnimalBreadcrumb({
  animalType,
  animalDisplayName = ANIMAL_DISPLAY_NAMES[animalType],
  categoryName,
  categorySlug,
  productName,
}: AnimalBreadcrumbProps) {
  const emoji = ANIMAL_EMOJIS[animalType]
  const route = ANIMAL_ROUTES[animalType]

  return (
    <nav className="bg-secondary py-3">
      <div className="container mx-auto px-4">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          <li>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <li>
            <Link
              href={route}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>{emoji}</span>
              <span>{animalDisplayName}</span>
            </Link>
          </li>
          {categoryName && categorySlug && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li>
                <Link
                  href={`${route}?category=${categorySlug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}
          {productName && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <li className="text-foreground font-medium">{productName}</li>
            </>
          )}
        </ol>
      </div>
    </nav>
  )
}
