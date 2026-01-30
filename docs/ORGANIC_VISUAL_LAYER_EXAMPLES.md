# Visual Layer Examples

Production-ready examples using the Organic Visual Layer system.

## Example 1: Product Card with Subtle Background

```tsx
import { OrganicVisualLayer } from "@/components/organic"

export function ProductCard({ name, price, animalType }: Props) {
  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-80">
      {/* Subtle living background */}
      <OrganicVisualLayer
        animalType={animalType}
        effectType="gradient-flow"
        intensity={0.4}
        opacity={0.3}
        blur={1}
      />
      
      {/* Card content */}
      <div className="relative z-10 p-6">
        <img src="/product.jpg" alt={name} className="w-full rounded mb-4" />
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">Premium quality for discerning pet owners</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${price}</span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Example 2: Hero Section with Rich Effects

```tsx
import { OrganicMultiLayerVisual } from "@/components/organic"

export function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-slate-950">
      {/* Rich multi-layer background */}
      <OrganicMultiLayerVisual
        animalType="dog"
        glowIntensity={0.35}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
      
      {/* Content */}
      <div className="relative z-20 flex items-center justify-center h-full px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            Premium Pet Experience
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Handcrafted products designed with love for your beloved companions
          </p>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition">
            Explore Now
          </button>
        </div>
      </div>
    </section>
  )
}
```

## Example 3: Category Section with Waves

```tsx
import { OrganicVisualLayer } from "@/components/organic"
import { useVisualLayerByComplexity } from "@/hooks"

export function CategoriesSection() {
  const layers = useVisualLayerByComplexity("balanced")
  
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      <OrganicVisualLayer
        animalType="bird"
        effectType="waves"
        intensity={0.5}
        opacity={0.4}
        speed="slow"
      />
      
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Shop by Pet Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {["Cats", "Dogs", "Birds", "Others"].map((category) => (
            <CategoryCard key={category} name={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

## Example 4: Feature Card with Shimmer

```tsx
import { OrganicVisualLayer } from "@/components/organic"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  animalType: "cat" | "dog" | "bird" | "other"
}

export function FeatureCard({
  icon,
  title,
  description,
  animalType,
}: FeatureCardProps) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-8 overflow-hidden">
      {/* Shimmer effect */}
      <OrganicVisualLayer
        animalType={animalType}
        effectType="shimmer"
        intensity={0.3}
        opacity={0.2}
        speed="normal"
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
```

## Example 5: Page Layout with Global Visual Layer

```tsx
import { OrganicLayout, OrganicVisualLayer } from "@/components/organic"

export function PageWithGlobalVisuals() {
  const animalType = "cat" // From URL param or context
  
  return (
    <OrganicLayout animalType={animalType}>
      {/* Global page-level visual layer */}
      <OrganicVisualLayer
        animalType={animalType}
        effectType="mask-blend"
        intensity={0.2}
        opacity={0.15}
        blur={2}
        className="fixed inset-0 z-0"
      />
      
      {/* Page sections */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <ProductsSection />
        <Footer />
      </div>
    </OrganicLayout>
  )
}
```

## Example 6: Responsive Visual Layers

```tsx
import { OrganicVisualLayer } from "@/components/organic"
import { useResponsiveOrganicScale } from "@/hooks"

export function ResponsiveSection() {
  const scale = useResponsiveOrganicScale()
  
  // Adjust intensity based on screen size
  const intensity = scale === 1 ? 0.6 : scale === 0.9 ? 0.4 : 0.2
  
  return (
    <section className="relative py-12">
      <OrganicVisualLayer
        animalType="dog"
        effectType="gradient-flow"
        intensity={intensity}
        opacity={0.4}
        blur={scale < 1 ? 0 : 1}  // No blur on mobile
      />
      
      <div className="relative z-10 container mx-auto">
        <h2>Responsive Content</h2>
        <p>Visual effects adapt to screen size</p>
      </div>
    </section>
  )
}
```

## Example 7: Custom Multi-Layer Combination

```tsx
import { OrganicMultiLayerVisual } from "@/components/organic"

export function CustomLayeredSection() {
  const customLayers = [
    {
      type: "noise" as const,
      intensity: 0.4,
      opacity: 0.3,
      blur: 1,
    },
    {
      type: "waves" as const,
      intensity: 0.5,
      opacity: 0.35,
      speed: "slow" as const,
    },
    {
      type: "shimmer" as const,
      intensity: 0.3,
      opacity: 0.2,
      speed: "fast" as const,
    },
  ]
  
  return (
    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 py-20">
      <OrganicMultiLayerVisual
        animalType="bird"
        layers={customLayers}
        glowIntensity={0.25}
      />
      
      <div className="relative z-10 text-white text-center">
        <h2>Custom Layered Effect</h2>
        <p>Three visual layers combined</p>
      </div>
    </div>
  )
}
```

## Example 8: Loading State with Animation

```tsx
import { OrganicVisualLayer, OrganicTransition } from "@/components/organic"
import { useState } from "react"

export function DataLoadingSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setData({ loaded: true })
      setIsLoading(false)
    }, 2000)
  }, [])
  
  return (
    <div className="relative py-12">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Loading visual effect */}
          <OrganicVisualLayer
            animalType="cat"
            effectType="waves"
            intensity={0.7}
            opacity={0.6}
            speed="fast"
          />
          
          <div className="relative z-10">
            <div className="animate-spin text-4xl">✨</div>
            <p className="mt-4 text-gray-600">Loading premium content...</p>
          </div>
        </div>
      )}
      
      {/* Content fades in after loading */}
      <OrganicTransition isVisible={!isLoading}>
        <div className="relative z-10">
          <h2>Content Loaded</h2>
          {data && <p>Your data is ready</p>}
        </div>
      </OrganicTransition>
    </div>
  )
}
```

## Example 9: Backdrop Filter Effect

```tsx
import { OrganicVisualLayer } from "@/components/organic"

export function BlurredBackdropCard() {
  return (
    <div className="relative">
      {/* Background image or content */}
      <img src="/hero.jpg" alt="Hero" className="w-full h-96 object-cover" />
      
      {/* Blurred visual layer overlay */}
      <div className="absolute inset-0 backdrop-blur-md">
        <OrganicVisualLayer
          animalType="dog"
          effectType="mask-blend"
          intensity={0.5}
          opacity={0.8}
          blur={3}
        />
      </div>
      
      {/* Content on top */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Premium Quality</h2>
          <p className="text-xl">Experience the difference</p>
        </div>
      </div>
    </div>
  )
}
```

## Example 10: Animated Page Transition

```tsx
import { OrganicTransition, OrganicVisualLayer } from "@/components/organic"

export function PageSection({ visible, animalType }: Props) {
  return (
    <OrganicTransition isVisible={visible}>
      <div className="relative py-20 overflow-hidden">
        {/* Section-specific visual layer */}
        <OrganicVisualLayer
          animalType={animalType}
          effectType="gradient-flow"
          intensity={0.5}
          opacity={0.4}
        />
        
        {/* Content appears with transition */}
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to {animalType}</h2>
          <p className="text-lg text-gray-600">
            Experience organic, living visuals that adapt to your content
          </p>
        </div>
      </div>
    </OrganicTransition>
  )
}
```

## Quick Copy-Paste Reference

### Minimal Visual (Background only)
```tsx
<OrganicVisualLayer
  animalType="cat"
  effectType="gradient-flow"
  intensity={0.3}
  opacity={0.2}
/>
```

### Standard Visual
```tsx
<OrganicVisualLayer
  animalType="dog"
  effectType="waves"
  intensity={0.5}
  opacity={0.4}
/>
```

### Rich Visual (Hero section)
```tsx
<OrganicMultiLayerVisual
  animalType="bird"
  glowIntensity={0.3}
/>
```

### Animated Visual (High motion)
```tsx
<OrganicVisualLayer
  animalType="other"
  effectType="shimmer"
  speed="fast"
  intensity={0.6}
  opacity={0.5}
/>
```
