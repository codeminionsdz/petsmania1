/**
 * React Hook: useMotionVariation
 * Creates natural, varied motion for animations
 */

"use client"

import { useMemo } from "react"
import type { AnimalType } from "@/lib/types"
import {
  generateMotionVariation,
  generateVariedDuration,
  generateVariedDelay,
  generateVariedIntensity,
  getMotionVariation,
  createStaggeredDelays,
  createWaveDelays,
  createOrganicDelays,
  type MotionVariation,
} from "@/lib/organic/motion-variations"

/**
 * Hook: Generate motion variation for an element
 */
export function useMotionVariation(
  animalType: AnimalType,
  animationType: string,
  elementId?: string | number
) {
  return useMemo(() => {
    const baseVariation = getMotionVariation(animalType, animationType)
    return generateMotionVariation(baseVariation, elementId)
  }, [animalType, animationType, elementId])
}

/**
 * Hook: Generate varied duration
 */
export function useVariedDuration(
  baseDuration: number,
  variation: number = 0.15,
  elementId?: string | number
) {
  return useMemo(
    () => generateVariedDuration(baseDuration, variation, elementId as any),
    [baseDuration, variation, elementId]
  )
}

/**
 * Hook: Generate varied delay
 */
export function useVariedDelay(
  baseDelay: number,
  variation: number = 0.2,
  elementId?: string | number
) {
  return useMemo(
    () => generateVariedDelay(baseDelay, variation, elementId as any),
    [baseDelay, variation, elementId]
  )
}

/**
 * Hook: Generate varied intensity
 */
export function useVariedIntensity(
  baseIntensity: number,
  variation: number = 0.25,
  elementId?: string | number
) {
  return useMemo(
    () => generateVariedIntensity(baseIntensity, variation, elementId as any),
    [baseIntensity, variation, elementId]
  )
}

/**
 * Hook: Get preset motion variation
 */
export function usePresetMotionVariation(
  animalType: AnimalType,
  animationType: string
): MotionVariation {
  return useMemo(
    () => getMotionVariation(animalType, animationType),
    [animalType, animationType]
  )
}

/**
 * Hook: Create staggered delays with variation
 */
export function useStaggeredDelays(count: number, baseStagger: number = 50) {
  return useMemo(() => createStaggeredDelays(count, baseStagger), [count, baseStagger])
}

/**
 * Hook: Create wave delays
 */
export function useWaveDelays(count: number, wavelength: number = 100) {
  return useMemo(() => createWaveDelays(count, wavelength), [count, wavelength])
}

/**
 * Hook: Create organic delays
 */
export function useOrganicDelays(count: number, maxDelay: number = 500) {
  return useMemo(() => createOrganicDelays(count, maxDelay), [count, maxDelay])
}

/**
 * Hook: Multiple motion variations (for list items)
 */
export function useMotionVariations(
  animalType: AnimalType,
  animationType: string,
  count: number
) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const baseVariation = getMotionVariation(animalType, animationType)
      return generateMotionVariation(baseVariation, `${animalType}-${animationType}-${index}`)
    })
  }, [animalType, animationType, count])
}

/**
 * Hook: Generate CSS animation string
 */
export function useAnimationString(
  animationName: string,
  variation: MotionVariation
): string {
  return useMemo(() => {
    return `${animationName} ${variation.duration}ms ${variation.easing} ${variation.delay}ms infinite`
  }, [animationName, variation])
}
