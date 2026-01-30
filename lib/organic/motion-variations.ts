/**
 * Motion Variations System
 * Creates subtle randomized motion that feels natural, not robotic
 * Uses seeded randomness for consistency while allowing variation
 */

import { organicNoise, smoothstep } from "./background-generator"

export interface MotionVariation {
  duration: number // Base duration in ms
  durationVariation: number // ±% variation
  delay: number // Base delay in ms
  delayVariation: number // ±% variation
  easing: string // Easing function name
  intensity: number // 0-1 movement intensity
  intensityVariation: number // ±% variation
}

export interface AnimationKeyframe {
  offset: number // 0-1
  transform?: string
  opacity?: number
}

/**
 * Seeded random number generator for consistent variation
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Generate consistent but varied duration for an element
 */
export function generateVariedDuration(
  baseDuration: number,
  variation: number = 0.15,
  seed: number = Math.random()
): number {
  const factor = seededRandom(seed)
  const variationAmount = baseDuration * variation * (factor - 0.5) * 2
  return Math.max(baseDuration * 0.5, baseDuration + variationAmount)
}

/**
 * Generate consistent but varied delay for an element
 */
export function generateVariedDelay(
  baseDelay: number,
  variation: number = 0.2,
  seed: number = Math.random()
): number {
  const factor = seededRandom(seed)
  const variationAmount = baseDelay * variation * (factor - 0.5) * 2
  return Math.max(0, baseDelay + variationAmount)
}

/**
 * Generate consistent but varied intensity
 */
export function generateVariedIntensity(
  baseIntensity: number,
  variation: number = 0.25,
  seed: number = Math.random()
): number {
  const factor = seededRandom(seed)
  const variationAmount = baseIntensity * variation * (factor - 0.5) * 2
  return Math.max(0, Math.min(1, baseIntensity + variationAmount))
}

/**
 * Generate motion variation set for an element
 */
export function generateMotionVariation(
  baseVariation: MotionVariation,
  elementSeed: string | number = Math.random()
): MotionVariation {
  // Convert string seed to number
  let numSeed = typeof elementSeed === "string"
    ? elementSeed.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    : elementSeed

  return {
    duration: generateVariedDuration(
      baseVariation.duration,
      baseVariation.durationVariation,
      numSeed + 1
    ),
    durationVariation: baseVariation.durationVariation,
    delay: generateVariedDelay(
      baseVariation.delay,
      baseVariation.delayVariation,
      numSeed + 2
    ),
    delayVariation: baseVariation.delayVariation,
    easing: baseVariation.easing,
    intensity: generateVariedIntensity(
      baseVariation.intensity,
      baseVariation.intensityVariation,
      numSeed + 3
    ),
    intensityVariation: baseVariation.intensityVariation,
  }
}

/**
 * Preset motion variations per animal type
 */
export const motionVariationPresets = {
  cat: {
    float: {
      duration: 6000,
      durationVariation: 0.2,
      delay: 0,
      delayVariation: 0.3,
      easing: "sineInOut",
      intensity: 0.6,
      intensityVariation: 0.25,
    },
    pulse: {
      duration: 3000,
      durationVariation: 0.15,
      delay: 0,
      delayVariation: 0.4,
      easing: "organic",
      intensity: 0.4,
      intensityVariation: 0.2,
    },
    drift: {
      duration: 8000,
      durationVariation: 0.25,
      delay: 0,
      delayVariation: 0.35,
      easing: "sineInOut",
      intensity: 0.5,
      intensityVariation: 0.3,
    },
  } as Record<string, MotionVariation>,

  dog: {
    float: {
      duration: 4000,
      durationVariation: 0.18,
      delay: 0,
      delayVariation: 0.25,
      easing: "cubicOut",
      intensity: 0.8,
      intensityVariation: 0.2,
    },
    pulse: {
      duration: 2500,
      durationVariation: 0.12,
      delay: 0,
      delayVariation: 0.3,
      easing: "cubicInOut",
      intensity: 0.6,
      intensityVariation: 0.15,
    },
    drift: {
      duration: 5500,
      durationVariation: 0.2,
      delay: 0,
      delayVariation: 0.28,
      easing: "cubicOut",
      intensity: 0.7,
      intensityVariation: 0.25,
    },
  } as Record<string, MotionVariation>,

  bird: {
    float: {
      duration: 5000,
      durationVariation: 0.22,
      delay: 0,
      delayVariation: 0.32,
      easing: "sineOut",
      intensity: 0.7,
      intensityVariation: 0.28,
    },
    pulse: {
      duration: 3500,
      durationVariation: 0.16,
      delay: 0,
      delayVariation: 0.35,
      easing: "sineInOut",
      intensity: 0.5,
      intensityVariation: 0.22,
    },
    drift: {
      duration: 7000,
      durationVariation: 0.24,
      delay: 0,
      delayVariation: 0.36,
      easing: "sineInOut",
      intensity: 0.6,
      intensityVariation: 0.3,
    },
  } as Record<string, MotionVariation>,

  other: {
    float: {
      duration: 5500,
      durationVariation: 0.2,
      delay: 0,
      delayVariation: 0.3,
      easing: "organic",
      intensity: 0.65,
      intensityVariation: 0.25,
    },
    pulse: {
      duration: 3200,
      durationVariation: 0.14,
      delay: 0,
      delayVariation: 0.32,
      easing: "organic",
      intensity: 0.55,
      intensityVariation: 0.2,
    },
    drift: {
      duration: 6500,
      durationVariation: 0.22,
      delay: 0,
      delayVariation: 0.33,
      easing: "sineInOut",
      intensity: 0.65,
      intensityVariation: 0.28,
    },
  } as Record<string, MotionVariation>,
}

/**
 * Get motion variation for animal and animation type
 */
export function getMotionVariation(
  animalType: string,
  animationType: string
): MotionVariation {
  const animal = motionVariationPresets[animalType] || motionVariationPresets.other
  return animal[animationType] || animal.float
}

/**
 * Create staggered delays with variation
 */
export function createStaggeredDelays(
  count: number,
  baseStagger: number = 50,
  variation: number = 0.3
): number[] {
  return Array.from({ length: count }, (_, index) => {
    const baseSeed = index
    const staggaredDelay = index * baseStagger
    const variationAmount = baseStagger * variation * (seededRandom(baseSeed) - 0.5) * 2

    return Math.max(0, staggaredDelay + variationAmount)
  })
}

/**
 * Create natural wave delay pattern
 */
export function createWaveDelays(
  count: number,
  wavelength: number = 100
): number[] {
  return Array.from({ length: count }, (_, index) => {
    const normalized = index / count
    const wave = Math.sin(normalized * Math.PI * 2)
    return (wave + 1) * wavelength // Maps wave to 0-2*wavelength
  })
}

/**
 * Create organic (noise-based) delay distribution
 */
export function createOrganicDelays(
  count: number,
  maxDelay: number = 500
): number[] {
  return Array.from({ length: count }, (_, index) => {
    const normalized = index / count
    const noise = organicNoise(normalized * 3, Math.random())
    const smoothed = smoothstep(0, 1, (noise + 1) / 2)
    return smoothed * maxDelay
  })
}

/**
 * Calculate natural acceleration curve for distance
 */
export function calculateAccelerationCurve(
  progress: number,
  peakTime: number = 0.5
): number {
  // Accelerate to peak, then decelerate
  if (progress < peakTime) {
    return (progress / peakTime) * (progress / peakTime) // Acceleration
  } else {
    const remaining = 1 - progress
    const remainingPeak = 1 - peakTime
    return 1 - (remaining / remainingPeak) * (remaining / remainingPeak) // Deceleration
  }
}

/**
 * Create natural rotation variation
 */
export function createRotationVariation(
  baseRotation: number,
  variation: number = 0.2,
  seed: number = Math.random()
): number {
  const factor = seededRandom(seed)
  const variationAmount = baseRotation * variation * (factor - 0.5) * 2
  return baseRotation + variationAmount
}

/**
 * Create natural scale variation
 */
export function createScaleVariation(
  baseScale: number,
  variation: number = 0.15,
  seed: number = Math.random()
): number {
  const factor = seededRandom(seed)
  const variationAmount = baseScale * variation * (factor - 0.5) * 2
  return Math.max(0.5, Math.min(2, baseScale + variationAmount))
}

/**
 * Motion variation profiles (presets)
 */
export const motionProfiles = {
  subtle: {
    durationVariation: 0.08,
    delayVariation: 0.12,
    intensityVariation: 0.1,
  },
  balanced: {
    durationVariation: 0.15,
    delayVariation: 0.2,
    intensityVariation: 0.2,
  },
  playful: {
    durationVariation: 0.25,
    delayVariation: 0.35,
    intensityVariation: 0.35,
  },
  wild: {
    durationVariation: 0.4,
    delayVariation: 0.5,
    intensityVariation: 0.5,
  },
}

/**
 * Apply motion profile to variation
 */
export function applyMotionProfile(
  variation: MotionVariation,
  profile: keyof typeof motionProfiles
): MotionVariation {
  const p = motionProfiles[profile]
  return {
    ...variation,
    durationVariation: p.durationVariation,
    delayVariation: p.delayVariation,
    intensityVariation: p.intensityVariation,
  }
}
