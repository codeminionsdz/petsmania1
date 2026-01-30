/**
 * Visual Layer Configuration & Effects
 * Predefined visual layer combinations for different contexts
 */

import type { AnimalType } from "@/lib/types"

export interface VisualLayerConfig {
  effectType: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"
  intensity: number
  opacity: number
  blur?: number
  speed?: "slow" | "normal" | "fast"
}

/**
 * Preset visual layer configurations per animal type
 */
export const visualLayerPresets: Record<AnimalType, VisualLayerConfig[]> = {
  cat: [
    {
      effectType: "gradient-flow",
      intensity: 0.5,
      opacity: 0.4,
      blur: 1,
      speed: "slow",
    },
    {
      effectType: "mask-blend",
      intensity: 0.3,
      opacity: 0.3,
      blur: 2,
    },
  ],
  dog: [
    {
      effectType: "waves",
      intensity: 0.7,
      opacity: 0.5,
      speed: "normal",
    },
    {
      effectType: "shimmer",
      intensity: 0.4,
      opacity: 0.3,
      speed: "fast",
    },
  ],
  bird: [
    {
      effectType: "noise",
      intensity: 0.4,
      opacity: 0.3,
      blur: 1,
    },
    {
      effectType: "gradient-flow",
      intensity: 0.5,
      opacity: 0.4,
      speed: "slow",
    },
  ],
  other: [
    {
      effectType: "mask-blend",
      intensity: 0.5,
      opacity: 0.4,
      blur: 2,
    },
    {
      effectType: "waves",
      intensity: 0.4,
      opacity: 0.35,
      speed: "normal",
    },
  ],
}

/**
 * Minimal visual layer (subtle, background only)
 */
export const minimalVisualConfig: VisualLayerConfig[] = [
  {
    effectType: "gradient-flow",
    intensity: 0.3,
    opacity: 0.2,
    blur: 2,
  },
]

/**
 * Rich visual layer (complex, layered effects)
 */
export const richVisualConfig: VisualLayerConfig[] = [
  {
    effectType: "waves",
    intensity: 0.6,
    opacity: 0.4,
  },
  {
    effectType: "mask-blend",
    intensity: 0.4,
    opacity: 0.3,
    blur: 1,
  },
  {
    effectType: "shimmer",
    intensity: 0.3,
    opacity: 0.25,
  },
]

/**
 * Animated visual layer (high motion)
 */
export const animatedVisualConfig: VisualLayerConfig[] = [
  {
    effectType: "waves",
    intensity: 0.7,
    opacity: 0.5,
    speed: "normal",
  },
  {
    effectType: "shimmer",
    intensity: 0.5,
    opacity: 0.4,
    speed: "fast",
  },
]

/**
 * Get visual layer configuration for animal type
 */
export function getVisualLayerConfig(animalType: AnimalType): VisualLayerConfig[] {
  return visualLayerPresets[animalType] || visualLayerPresets.other
}

/**
 * Get visual layers based on complexity level
 */
export function getVisualLayersByComplexity(
  complexity: "minimal" | "balanced" | "rich"
): VisualLayerConfig[] {
  switch (complexity) {
    case "minimal":
      return minimalVisualConfig
    case "balanced":
      return visualLayerPresets.other // Use "other" as balanced default
    case "rich":
      return richVisualConfig
    default:
      return visualLayerPresets.other
  }
}

/**
 * Combine visual layer configurations
 */
export function combineVisualLayers(
  ...configs: VisualLayerConfig[][]
): VisualLayerConfig[] {
  return configs.flat()
}

/**
 * Adjust visual layer intensity
 */
export function adjustVisualLayerIntensity(
  config: VisualLayerConfig,
  factor: number
): VisualLayerConfig {
  return {
    ...config,
    intensity: Math.min(1, config.intensity * factor),
    opacity: Math.min(1, config.opacity * factor),
  }
}

/**
 * Create custom visual layer
 */
export function createVisualLayer(
  effectType: VisualLayerConfig["effectType"],
  intensity: number = 0.5,
  opacity: number = 0.4,
  options?: { blur?: number; speed?: "slow" | "normal" | "fast" }
): VisualLayerConfig {
  return {
    effectType,
    intensity: Math.min(1, Math.max(0, intensity)),
    opacity: Math.min(1, Math.max(0, opacity)),
    ...options,
  }
}

/**
 * Visual layer effect descriptions (for UI/docs)
 */
export const visualLayerDescriptions: Record<string, string> = {
  waves:
    "Flowing wave patterns that move smoothly. Great for ocean/water-like movement.",
  noise:
    "Organic noise texture that feels natural and grainy. Perfect for background texture.",
  "gradient-flow":
    "Flowing gradient layers that blend together. Creates elegant transitions.",
  "mask-blend":
    "Radial blended masks that create glowing, floating effects. Very organic.",
  shimmer:
    "Shimmering sparkle effect that moves across the surface. Adds elegance.",
}
