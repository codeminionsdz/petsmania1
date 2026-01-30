import type { AnimalType } from '@/lib/types'

/**
 * Get animal route from product's animal type
 */
export function getAnimalRoute(animalType: AnimalType | null | undefined): string {
  switch (animalType) {
    case 'cat':
      return '/cats'
    case 'dog':
      return '/dogs'
    case 'bird':
      return '/birds'
    case 'other':
      return '/categories/other'
    default:
      return '/products'
  }
}

/**
 * Get animal display name
 */
export function getAnimalDisplayName(animalType: AnimalType | null | undefined): string {
  switch (animalType) {
    case 'cat':
      return 'Cats'
    case 'dog':
      return 'Dogs'
    case 'bird':
      return 'Birds'
    case 'other':
      return 'Other Pets'
    default:
      return 'All Products'
  }
}

/**
 * Get animal emoji
 */
export function getAnimalEmoji(animalType: AnimalType | null | undefined): string {
  switch (animalType) {
    case 'cat':
      return '🐱'
    case 'dog':
      return '🐕'
    case 'bird':
      return '🐦'
    case 'other':
      return '🐾'
    default:
      return '🛍️'
  }
}

/**
 * Parse animal type from route
 * /cats -> 'cat'
 * /dogs -> 'dog'
 * /birds -> 'bird'
 */
export function getAnimalTypeFromRoute(route: string): AnimalType | null {
  const path = route.toLowerCase().split('/')[1]
  
  switch (path) {
    case 'cat':
    case 'cats':
      return 'cat'
    case 'dog':
    case 'dogs':
      return 'dog'
    case 'bird':
    case 'birds':
      return 'bird'
    case 'other':
      return 'other'
    default:
      return null
  }
}
