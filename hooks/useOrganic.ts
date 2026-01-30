/**
 * Organic Design System Hooks



// Motion variation hooks
export { 
  useMotionVariation,
  useVariedDuration,
  useVariedDelay,
  useVariedIntensity,
  usePresetMotionVariation,
  useStaggeredDelays,
  useWaveDelays,
  useOrganicDelays,
  useMotionVariations,
  useAnimationString,
} from "./useMotionVariation"

// Story transition hook
export { useStoryTransition } from "./useStoryTransition"






































































































































































































































































































































































































- [Animation System](./ORGANIC_ANIMATIONS.md) - Motion effects- [Personalities](./ORGANIC_PERSONALITIES.md) - Animal characteristics- [OrganicBackground](./ORGANIC_BACKGROUND.md) - Procedural backgrounds- [OrganicLayout](./ORGANIC_LAYOUT.md) - Root wrapper component## See AlsoRequires JavaScript enabled for SVG generation and animation.- All modern mobile browsers- Safari 14+- Firefox 88+- Chrome/Edge 90+## Browser Support- **Other**: Grays (#4A5859) and earth tones (#9A8B7B)- **Bird**: Teals (#1B4965) and light blues (#90E0EF)- **Dog**: Oranges (#C85A17) and yellows (#FDB750)- **Cat**: Warm browns (#2C1810) and golds (#D4A574)Visual layers automatically adapt to animal personality colors:## Color Palettes- **Blur optimization**: Use `blur` prop sparingly; keep values < 5px- **Pointer-safe**: All components use `pointer-events: none`- **Caching**: SVGs cached in memory per animal type- **Hardware-accelerated**: CSS animations use `transform` and `opacity`- **SVG-based**: Generated client-side, not network requests## Performance Notes```}  )    />      opacity={isMobile ? 0.2 : 0.5}      intensity={isMobile ? 0.3 : 0.6}  // Less intense on mobile      effectType="gradient-flow"      animalType="dog"    <OrganicVisualLayer  return (    }, [])    return () => window.removeEventListener("resize", handler)    window.addEventListener("resize", handler)    const handler = () => setIsMobile(window.innerWidth < 768)    setIsMobile(window.innerWidth < 768)  useEffect(() => {    const [isMobile, setIsMobile] = useState(false)export function ResponsiveVisual() {```tsxAdjust intensity based on viewport.### Responsive Visual Layers```const combined = combineVisualLayers([customWave, customGradient])const customGradient = createVisualLayer("gradient-flow", 0.4, 0.3)const customWave = createVisualLayer("waves", 0.7, 0.5, { speed: "fast" })import { createVisualLayer, combineVisualLayers } from "@/lib/organic"```tsxUse the configuration utilities to build custom combinations.### Create Custom Visual Layers## Customization```}  )    </OrganicTransition>      </div>        </div>          <p>Content appears with living background</p>          <h2>Animated Section</h2>        <div className="relative z-10">                />          opacity={0.4}          speed="slow"          effectType="waves"          animalType="cat"        <OrganicVisualLayer      <div className="relative py-20">    <OrganicTransition isVisible={true}>  return (export function AnimatedSection() {import { OrganicTransition, OrganicVisualLayer } from "@/components/organic"```tsxCombine visual layers with page transitions.### Pattern 4: Animated Section Entrance```}  )    </OrganicLayout>      </main>        {children}      <main className="relative z-10">      {/* Page content */}            />        opacity={0.3}        intensity={0.2}        effectType="shimmer"        animalType="bird"      <OrganicVisualLayer      {/* Additional visual layer on top of base layout */}    <OrganicLayout animalType="bird">  return (export default function Layout({ children }: { children: React.ReactNode }) {import { OrganicLayout, OrganicVisualLayer } from "@/components/organic"```tsxLayer visual effects over entire page layout.### Pattern 3: Page Overlay```}  )    </section>      </div>        </div>          <p className="text-xl mt-4">Experience the organic</p>          <h1 className="text-5xl font-bold">Welcome</h1>        <div className="text-center text-white">      <div className="relative z-10 flex items-center justify-center h-full">      {/* Content */}            />        glowIntensity={0.4}        animalType="dog"      <OrganicMultiLayerVisual      {/* Rich background effects */}    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">  return (export function HeroSection() {```tsxCreate an immersive hero with rich layered effects.### Pattern 2: Hero Section```}  )    </div>      </div>        <p>Description</p>        <h3>Product Name</h3>      <div className="relative z-10 p-6">      {/* Content with z-index */}            />        blur={1}        opacity={0.3}        intensity={0.3}        effectType="gradient-flow"        animalType="cat"      <OrganicVisualLayer      {/* Subtle living background */}    <div className="relative bg-white rounded-lg overflow-hidden">  return (export function ProductCard() {```tsxAdd a gentle visual layer that never distracts.### Pattern 1: Subtle Background## Usage Patterns```}  return <OrganicMultiLayerVisual animalType="cat" layers={layers} />  const layers = useVisualLayers("cat", simple ? "minimal" : "balanced")export function AdaptiveBackground({ simple }: { simple?: boolean }) {import { useVisualLayers } from "@/hooks"```tsxGet visual layers with optional complexity override.### useVisualLayers```}  return <OrganicVisualLayer {...adjustedLayer} animalType="dog" />    const adjustedLayer = useAdjustedVisualLayer(baseLayer, 1.5) // 50% more intense  const baseLayer = useVisualLayer("dog")[0]export function DynamicBackground() {import { useAdjustedVisualLayer, useVisualLayer } from "@/hooks"```tsxAdjust visual layer intensity by a factor.### useAdjustedVisualLayer```}  return <OrganicMultiLayerVisual animalType="cat" layers={layers} />  const layers = useVisualLayerByComplexity("rich")export function RichBackground() {}  return <OrganicMultiLayerVisual animalType="cat" layers={layers} />  const layers = useVisualLayerByComplexity("minimal")export function MinimalBackground() {import { useVisualLayerByComplexity } from "@/hooks"```tsxGet visual layers at different complexity levels.### useVisualLayerByComplexity```}  return <OrganicMultiLayerVisual animalType="cat" layers={layers} />    const layers = useVisualLayer("cat")export function Component() {import { useVisualLayer } from "@/hooks"```tsxGet visual layer configuration for an animal type.### useVisualLayer## Hooks```}  className?: string  interactive?: boolean   // for mouse tracking (future)  glowIntensity?: number  // 0-1, default: 0.2  }>    speed?: "slow" | "normal" | "fast"    blur?: number    opacity?: number    intensity?: number    type: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"  layers?: Array<{  animalType: "cat" | "dog" | "bird" | "other"interface MultiLayerVisualProps {```tsx#### Props```}  )    </div>      </div>        <h1>Premium Experience</h1>      <div className="relative z-10 flex items-center justify-center h-full">      {/* Content */}            />        glowIntensity={0.3}        animalType="cat"      <OrganicMultiLayerVisual      {/* Rich layered background */}    <div className="relative h-screen overflow-hidden">  return (export function HeroSection() {import { OrganicMultiLayerVisual } from "@/components/organic"```tsxComplex, multi-layered visual effects for rich backgrounds.### OrganicMultiLayerVisual```/>  speed="fast"  effectType="shimmer"  animalType="dog"<OrganicVisualLayer ```tsx**`shimmer`** - Elegant shimmer effect```/>  blur={2}  effectType="mask-blend"  animalType="other"<OrganicVisualLayer ```tsx**`mask-blend`** - Glowing radial masks```/>  blur={1}  effectType="gradient-flow"  animalType="cat"<OrganicVisualLayer ```tsx**`gradient-flow`** - Blending color layers```/>  intensity={0.4}  effectType="noise"  animalType="bird"<OrganicVisualLayer ```tsx**`noise`** - Organic grainy texture```/>  speed="normal"  effectType="waves"  animalType="dog"<OrganicVisualLayer ```tsx**`waves`** - Flowing water-like patterns#### Effect Types```}  className?: string           // additional CSS classes  speed?: "slow" | "normal" | "fast"  // animation speed  blur?: number                // px, default: 0  animated?: boolean           // default: true  opacity?: number             // 0-1, default: 0.5  intensity?: number           // 0-1, default: 0.6  effectType?: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"  animalType: "cat" | "dog" | "bird" | "other"interface OrganicVisualLayerProps {```tsx#### Props```}  )    </div>      </div>        <h1>Welcome</h1>      <div className="relative z-10">      {/* Your content here */}            />        animated={true}        opacity={0.5}        intensity={0.6}        effectType="gradient-flow"        animalType="cat"      <OrganicVisualLayer      {/* Living background effect */}    <div className="relative min-h-screen bg-white">  return (export function MyPage() {import { OrganicVisualLayer } from "@/components/organic"```tsxSingle-layer visual effect component. Perfect for adding subtle life to backgrounds.### OrganicVisualLayer## Components- **Customizable**: Full control over intensity, opacity, blur, and speed- **Performance-optimized**: Hardware-accelerated CSS animations- **Background-safe**: Runs with `pointer-events: none` (no interaction blocking)- **Color-adaptive**: Automatically matches animal personalityThe visual layer system provides organic, procedurally-generated effects that feel alive and slightly random, without distraction. Each effect is:## OverviewCreate living, breathing visual effects that adapt to your animal context. Perfect for backgrounds, overlays, and decorative elements. * React hooks for accessing organic system features
 */

"use client"

import { useMemo, useCallback, useEffect, useState } from "react"
import type { AnimalType } from "@/lib/types"
import {
  getAnimalPersonality,
  getCachedBackground,
  getPaletteFromPersonality,
  getOrganicTransition,
  getHoverConfig,
  getAnimalAnimation,
  getOrganicEffect,
  getAnimationClassName,
  initializeOrganicSystem,
} from "@/lib/organic"

/**
 * Hook: Get animal personality
 */
export function useAnimalPersonality(animalType: AnimalType) {
  return useMemo(() => getAnimalPersonality(animalType), [animalType])
}

/**
 * Hook: Get color palette for animal
 */
export function useColorPalette(animalType: AnimalType) {
  return useMemo(() => getPaletteFromPersonality(animalType), [animalType])
}

/**
 * Hook: Get organic background
 */
export function useOrganicBackground(animalType: AnimalType) {
  return useMemo(() => getCachedBackground(animalType), [animalType])
}

/**
 * Hook: Get transition config
 */
export function useOrganicTransition(animalType: AnimalType) {
  return useMemo(() => getOrganicTransition(animalType), [animalType])
}

/**
 * Hook: Get hover config
 */
export function useHoverConfig(animalType: AnimalType) {
  return useMemo(() => getHoverConfig(animalType), [animalType])
}

/**
 * Hook: Get animation
 */
export function useOrganicAnimation(
  animalType: AnimalType,
  effectType: "float" | "pulse" | "drift" | "breathe" = "float"
) {
  return useMemo(
    () => getAnimalAnimation(animalType, effectType),
    [animalType, effectType]
  )
}

/**
 * Hook: Get animation class name
 */
export function useAnimationClass(
  animalType: AnimalType,
  effectType: string
) {
  return useMemo(
    () => getAnimationClassName(animalType, effectType),
    [animalType, effectType]
  )
}

/**
 * Hook: Initialize organic system CSS variables
 */
export function useOrganicSystem(animalType: AnimalType) {
  const cssVariables = useMemo(
    () => initializeOrganicSystem(animalType),
    [animalType]
  )

  useEffect(() => {
    const root = document.documentElement
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [cssVariables])

  return cssVariables
}

/**
 * Hook: Manage visibility with organic transitions
 */
export function useOrganicVisibility(
  animalType: AnimalType,
  initialState = false
) {
  const [isVisible, setIsVisible] = useState(initialState)
  const transitions = useOrganicTransition(animalType)

  const toggle = useCallback(() => setIsVisible((prev) => !prev), [])
  const show = useCallback(() => setIsVisible(true), [])
  const hide = useCallback(() => setIsVisible(false), [])

  return {
    isVisible,
    toggle,
    show,
    hide,
    transition: transitions,
  }
}

/**
 * Hook: Trigger animation sequence
 */
export function useAnimationSequence(
  animalType: AnimalType,
  animations: Array<"float" | "pulse" | "drift" | "breathe">,
  autoplay = false
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay)

  const currentAnimation = useMemo(
    () => getAnimalAnimation(animalType, animations[currentIndex]),
    [animalType, animations, currentIndex]
  )

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % animations.length)
  }, [animations.length])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + animations.length) % animations.length)
  }, [animations.length])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])

  useEffect(() => {
    if (!isPlaying) return

    const duration = currentAnimation.duration + currentAnimation.delay
    const timer = setTimeout(next, duration)
    return () => clearTimeout(timer)
  }, [isPlaying, currentAnimation.duration, currentAnimation.delay, next])

  return {
    currentIndex,
    currentAnimation,
    isPlaying,
    next,
    prev,
    play,
    pause,
  }
}

/**
 * Hook: Mouse position tracking for hover effects
 */
export function useMouseTracking() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return position
}

/**
 * Hook: Responsive organic scale
 */
export function useResponsiveOrganicScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setScale(0.8)
      else if (width < 1024) setScale(0.9)
      else setScale(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return scale
}

/**
 * Hook: Get visual layer config for animal
 */
export { useVisualLayer, useVisualLayerByComplexity, useAdjustedVisualLayer, useVisualLayers } from "./useVisualLayer"
