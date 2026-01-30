/**
 * React Hook: useVisualLayer
 * Hook for managing and configuring visual layers
 */

"use client"

import { useMemo } from "react"
import type { AnimalType } from "@/lib/types"
import {
  getVisualLayerConfig,
  getVisualLayersByComplexity,
  adjustVisualLayerIntensity,
  type VisualLayerConfig,
} from "@/lib/organic/visual-layer-config"

/**
 * Hook: Get visual layer config for animal type
 */
export function useVisualLayer(animalType: AnimalType) {
  return useMemo(
    () => getVisualLayerConfig(animalType),
    [animalType]
  )
}

/**
 * Hook: Get visual layers by complexity
 */
export function useVisualLayerByComplexity(
  complexity: "minimal" | "balanced" | "rich"
) {
  return useMemo(
    () => getVisualLayersByComplexity(complexity),
    [complexity]
  )
}

/**
 * Hook: Adjust visual layer intensity
 */
export function useAdjustedVisualLayer(
  config: VisualLayerConfig,
  intensityFactor: number
) {
  return useMemo(
    () => adjustVisualLayerIntensity(config, intensityFactor),
    [config, intensityFactor]
  )
}

/**
 * Hook: Get multiple visual layers
 */
export function useVisualLayers(
  animalType: AnimalType,
  complexity?: "minimal" | "balanced" | "rich"
) {
  return useMemo(() => {
    if (complexity) {
      return getVisualLayersByComplexity(complexity)
    }
    return getVisualLayerConfig(animalType)
  }, [animalType, complexity])
}
