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

const ANIMAL_TYPE: AnimalType = 'bird'
const ANIMAL_NAME = 'Birds'
const ANIMAL_EMOJI = '🐦'

export const metadata: Metadata = {
  title: 'Bird Products | PharmaCare',
  description: 'Browse our complete collection of premium bird food, toys, health supplements, and accessories.',
  openGraph: {
    title: 'Bird Products | PharmaCare',
    description: 'Premium pet care products for your beloved birds',
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

export default async function BirdsPage() {
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
        {/* Painterly organic bird background - calm, airy, sky-inspired */}
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
          .bird-paint-blob-1 { animation: drift1 20s ease-in-out infinite; }
          .bird-paint-blob-2 { animation: drift2 24s ease-in-out infinite; }
          .bird-paint-blob-3 { animation: drift3 22s ease-in-out infinite; }
          .bird-paint-blob-4 { animation: drift4 26s ease-in-out infinite; }
          .content-reveal {
            animation: content-reveal 950ms ease-out 500ms both;
          }
          .title-settle {
            animation: title-settle 600ms ease-out 620ms both;
          }
        `}</style>

        {/* Painterly blobs - light, airy, sky-inspired shapes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="painterly-blur-bird" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="65" />
            </filter>
            <radialGradient id="sky-blue-1">
              <stop offset="0%" stopColor="#D4E8F7" />
              <stop offset="100%" stopColor="#A8D4F1" />
            </radialGradient>
            <radialGradient id="pale-gold-1">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="100%" stopColor="#F5E6C8" />
            </radialGradient>
            <radialGradient id="soft-cloud-1">
              <stop offset="0%" stopColor="#E8F4FB" />
              <stop offset="100%" stopColor="#D0E8F6" />
            </radialGradient>
            <radialGradient id="sky-accent-1">
              <stop offset="0%" stopColor="#F0F8FC" />
              <stop offset="100%" stopColor="#C5DCEA" />
            </radialGradient>
          </defs>

          {/* Soft sky blue blob - top right */}
          <ellipse
            className="bird-paint-blob-1"
            cx="1100"
            cy="150"
            rx="580"
            ry="520"
            fill="url(#sky-blue-1)"
            opacity="0.52"
            filter="url(#painterly-blur-bird)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Pale gold blob - bottom left */}
          <ellipse
            className="bird-paint-blob-2"
            cx="180"
            cy="820"
            rx="520"
            ry="460"
            fill="url(#pale-gold-1)"
            opacity="0.48"
            filter="url(#painterly-blur-bird)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Soft cloud white/blue blob - center */}
          <ellipse
            className="bird-paint-blob-3"
            cx="700"
            cy="520"
            rx="500"
            ry="480"
            fill="url(#soft-cloud-1)"
            opacity="0.44"
            filter="url(#painterly-blur-bird)"
            style={{ mixBlendMode: 'soft-light' }}
          />

          {/* Sky accent - upper left */}
          <ellipse
            className="bird-paint-blob-4"
            cx="300"
            cy="200"
            rx="440"
            ry="420"
            fill="url(#sky-accent-1)"
            opacity="0.50"
            filter="url(#painterly-blur-bird)"
            style={{ mixBlendMode: 'color-dodge' }}
          />

          {/* Light, subtle vignette for breathable depth */}
          <defs>
            <radialGradient id="vignette-bird" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(100,140,180,0.12)" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#vignette-bird)" />
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
    console.error('Error loading bird products page:', error)
    throw error
  }
}
