import { Metadata } from 'next'
import { AnimalPageContent } from '@/components/animals/animal-page-content'
import {
  getCategoriesForAnimal,
  getBrandsForAnimalHierarchy,
  getAllSubcategories,
  getFeaturedProductsForAnimal,
  getProductsByHierarchy,
} from '@/lib/data'
import type { AnimalType } from '@/lib/types'

const ANIMAL_TYPE: AnimalType = 'cat'
const ANIMAL_NAME = 'Cats'
const ANIMAL_EMOJI = '🐱'

export const metadata: Metadata = {
  title: 'Cat Products | PharmaCare',
  description: 'Browse our complete collection of premium cat food, toys, health supplements, and accessories.',
  openGraph: {
    title: 'Cat Products | PharmaCare',
    description: 'Premium pet care products for your beloved cats',
  },
}

// Helper function to add timeout to a promise
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  defaultValue: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]).catch(() => defaultValue)
}

export default async function CatsPage() {
  try {
    // Set 10-second timeout for each data fetch
    const TIMEOUT_MS = 10000
    
    const [categories, subcategories, brands, featuredProducts, initialProducts] = await Promise.all([
      withTimeout(
        getCategoriesForAnimal(ANIMAL_TYPE),
        TIMEOUT_MS,
        []
      ),
      withTimeout(
        getAllSubcategories(),
        TIMEOUT_MS,
        []
      ),
      withTimeout(
        getBrandsForAnimalHierarchy(ANIMAL_TYPE),
        TIMEOUT_MS,
        []
      ),
      withTimeout(
        getFeaturedProductsForAnimal(ANIMAL_TYPE, 4),
        TIMEOUT_MS,
        []
      ),
      withTimeout(
        getProductsByHierarchy(ANIMAL_TYPE, undefined, undefined, {
          page: 1,
          pageSize: 12,
        }),
        TIMEOUT_MS,
        { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }
      ),
    ])

    return (
      <div className="relative min-h-screen bg-white overflow-hidden">
        {/* Painterly organic cat background - direct inline style */}
        <style>{`
          @keyframes drift1 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-32px, -20px) rotate(2.4deg); } }
          @keyframes drift2 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(28px, -24px) rotate(-3deg); } }
          @keyframes drift3 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-20px, 18px) rotate(1.6deg); } }
          @keyframes drift4 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(24px, 16px) rotate(-2deg); } }
          @keyframes content-reveal {
            0% {
              opacity: 0;
              transform: translateY(80px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes title-settle {
            0% {
              opacity: 0;
              transform: scale(0.96);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .cat-paint-blob-1 { animation: drift1 16s ease-in-out infinite; }
          .cat-paint-blob-2 { animation: drift2 18s ease-in-out infinite; }
          .cat-paint-blob-3 { animation: drift3 17s ease-in-out infinite; }
          .cat-paint-blob-4 { animation: drift4 19s ease-in-out infinite; }
          .content-reveal {
            animation: content-reveal 950ms ease-out 500ms both;
          }
          .title-settle {
            animation: title-settle 600ms ease-out 620ms both;
          }
        `}</style>

        {/* Painterly blobs - warm, organic shapes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="painterly-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="65" />
            </filter>
            <radialGradient id="warm-tan-1">
              <stop offset="0%" stopColor="#F5D5B0" />
              <stop offset="100%" stopColor="#C49060" />
            </radialGradient>
            <radialGradient id="warm-brown-1">
              <stop offset="0%" stopColor="#B89968" />
              <stop offset="100%" stopColor="#5D3A1F" />
            </radialGradient>
            <radialGradient id="ochre-1">
              <stop offset="0%" stopColor="#FFE5C0" />
              <stop offset="100%" stopColor="#D4A855" />
            </radialGradient>
            <radialGradient id="terracotta-1">
              <stop offset="0%" stopColor="#E89860" />
              <stop offset="100%" stopColor="#7A3F2A" />
            </radialGradient>
          </defs>

          {/* Large warm tan blob - top right */}
          <ellipse
            className="cat-paint-blob-1"
            cx="1100"
            cy="150"
            rx="580"
            ry="520"
            fill="url(#warm-tan-1)"
            opacity="0.68"
            filter="url(#painterly-blur)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Deep warm brown blob - bottom left */}
          <ellipse
            className="cat-paint-blob-2"
            cx="180"
            cy="820"
            rx="520"
            ry="460"
            fill="url(#warm-brown-1)"
            opacity="0.62"
            filter="url(#painterly-blur)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Ochre/golden blob - center */}
          <ellipse
            className="cat-paint-blob-3"
            cx="700"
            cy="520"
            rx="500"
            ry="480"
            fill="url(#ochre-1)"
            opacity="0.58"
            filter="url(#painterly-blur)"
            style={{ mixBlendMode: 'soft-light' }}
          />

          {/* Terracotta accent - upper left */}
          <ellipse
            className="cat-paint-blob-4"
            cx="300"
            cy="200"
            rx="440"
            ry="420"
            fill="url(#terracotta-1)"
            opacity="0.65"
            filter="url(#painterly-blur)"
            style={{ mixBlendMode: 'color-dodge' }}
          />

          {/* Warm vignette for depth */}
          <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(140,100,70,0.25)" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#vignette)" />
        </svg>

        {/* Content above the background */}
        <div className="relative z-10 content-reveal">
          <AnimalPageContent
            animalType={ANIMAL_TYPE}
            animalDisplayName={ANIMAL_NAME}
            emoji={ANIMAL_EMOJI}
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            initialProducts={initialProducts}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading cat products page:', error)
    throw error
  }
}
