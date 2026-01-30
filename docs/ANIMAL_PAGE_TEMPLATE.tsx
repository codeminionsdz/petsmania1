/**
 * Integration Example: Animal Page Template
 * Copy this pattern to your animal routes (cats/, dogs/, birds/, others/)
 */

"use client"

import React from "react"
import type { AnimalType } from "@/lib/types"
import {
  OrganicLayout,
  OrganicCard,
  OrganicTransition,
  OrganicBackground,
} from "@/components/organic"
import {
  useColorPalette,
  useOrganicAnimation,
  useHoverConfig,
} from "@/hooks/useOrganic"

/**
 * Animal Page Container
 * Wraps entire animal section with organic system
 */
export function AnimalPageTemplate({
  animalType,
  title,
  description,
  products,
}: {
  animalType: AnimalType
  title: string
  description: string
  products: any[]
}) {
  return (
    <OrganicLayout animalType={animalType} showBackground fullScreen>
      {/* Header Section */}
      <header className="relative z-10 px-8 py-16 md:px-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Animated Title */}
          <AnimatedTitle animalType={animalType} text={title} />

          {/* Description with organic fade-in */}
          <OrganicTransition animalType={animalType} effectType="float">
            <p className="text-lg md:text-xl mt-6 opacity-75">
              {description}
            </p>
          </OrganicTransition>
        </div>
      </header>

      {/* Products Grid Section */}
      <section className="relative z-10 px-8 py-12 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Featured Products</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <ProductCardWithAnimation
                key={product.id}
                product={product}
                animalType={animalType}
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-16 md:px-16">
        <CallToActionSection animalType={animalType} />
      </section>
    </OrganicLayout>
  )
}

/**
 * Product Card Component with staggered animation
 */
function ProductCardWithAnimation({
  product,
  animalType,
  index,
}: {
  product: any
  animalType: AnimalType
  index: number
}) {
  const animation = useOrganicAnimation(animalType, "float")
  const palette = useColorPalette(animalType)

  return (
    <OrganicTransition
      animalType={animalType}
      trigger={true}
      className="h-full"
    >
      <OrganicCard
        animalType={animalType}
        className="h-full bg-white shadow-lg hover:shadow-2xl"
        glowEffect
      >
        <div className="overflow-hidden rounded-t-2xl bg-gradient-to-b from-transparent to-transparent h-64 relative">
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{
              animation: `${animation.keyframes}`,
              animationDuration: `${animation.duration}ms`,
              animationDelay: `${animation.delay + index * 100}ms`,
              animationIterationCount: "infinite",
              transformOrigin: "center",
            }}
          />

          {/* Price Badge */}
          <div
            className="absolute top-4 right-4 rounded-full px-4 py-2 text-white font-bold"
            style={{
              backgroundColor: palette.accent,
            }}
          >
            ${product.price}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-gray-500 text-sm">(128 reviews)</span>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: palette.base,
              ":hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            Add to Cart
          </button>
        </div>
      </OrganicCard>
    </OrganicTransition>
  )
}

/**
 * Animated Title Component
 */
function AnimatedTitle({
  animalType,
  text,
}: {
  animalType: AnimalType
  text: string
}) {
  const palette = useColorPalette(animalType)

  return (
    <h1
      className="text-5xl md:text-6xl font-bold leading-tight"
      style={{
        color: palette.dark,
        animation: `fadeInUp 800ms ease-out forwards`,
      }}
    >
      {text}
    </h1>
  )
}

/**
 * Call to Action Section
 */
function CallToActionSection({ animalType }: { animalType: AnimalType }) {
  const palette = useColorPalette(animalType)

  return (
    <div
      className="rounded-3xl p-12 text-center text-white"
      style={{
        backgroundColor: palette.base,
      }}
    >
      <h2 className="text-4xl font-bold mb-4">Ready to spoil your {animalType}?</h2>
      <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
        Discover our premium collection of pet products, carefully selected for
        your beloved companion's comfort and happiness.
      </p>

      <button
        className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
        style={{
          backgroundColor: palette.accent,
          color: palette.dark,
        }}
      >
        Shop Now
      </button>
    </div>
  )
}

/**
 * Usage in route (e.g., app/cats/page.tsx)
 */
export function CatPage() {
  const products = [
    {
      id: 1,
      name: "Luxury Cat Bed",
      description: "Premium orthopedic cat bed with memory foam",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400",
    },
    // ... more products
  ]

  return (
    <AnimalPageTemplate
      animalType="cat"
      title="Everything for Your Feline Friend"
      description="Discover our curated collection of premium products designed specifically for cats. From toys to comfort essentials, we have everything your cat needs."
      products={products}
    />
  )
}

export function DogPage() {
  const products = [
    {
      id: 1,
      name: "Premium Dog Food",
      description: "Nutritious, high-protein dog food for active pups",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1587300411515-430ee3ab9ef4?w=400",
    },
    // ... more products
  ]

  return (
    <AnimalPageTemplate
      animalType="dog"
      title="Your Dog's Best Friend"
      description="Energetic, playful, and always ready for adventure. Our dog collection matches their spirit with quality products that keep them happy and healthy."
      products={products}
    />
  )
}

export function BirdPage() {
  const products = [
    {
      id: 1,
      name: "Elegant Bird Cage",
      description: "Spacious, well-ventilated bird cage with perches",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400",
    },
    // ... more products
  ]

  return (
    <AnimalPageTemplate
      animalType="bird"
      title="Elevate Your Bird's Life"
      description="Birds deserve space to soar. Our selection of aviaries, toys, and accessories creates the perfect environment for your feathered friend to thrive."
      products={products}
    />
  )
}
