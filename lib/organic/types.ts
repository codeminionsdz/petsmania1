/**
 * Organic Design System Types
 * Defines the visual personality, animations, and effects for each animal context
 */

import type { AnimalType } from "../types"

/**
 * Personality traits that define visual behavior for each animal
 */
export interface AnimalPersonality {
  // Visual characteristics
  primaryColor: string
  accentColor: string
  lightColor: string
  darkColor: string
  
  // Emotional motion
  energyLevel: "calm" | "balanced" | "playful" | "vibrant"
  rhythmPattern: "steady" | "flowing" | "bouncy" | "erratic"
  
  // Background generation
  bgComplexity: "minimal" | "moderate" | "rich"
  bgElements: string[]
  
  // Transition style
  transitionStagger: number // ms between staggered animations
  transitionEase: "ease-in-out" | "cubic-bezier"
  transitionDuration: number // ms
  
  // Interaction feedback
  hoverScale: number
  hoverDuration: number
}

/**
 * Generated background definition
 */
export interface OrganicBackground {
  animalType: AnimalType
  svg: string
  cssVariables: Record<string, string>
  seed?: number
}

/**
 * Animation configuration per animal type
 */
export interface AnimalAnimation {
  animalType: AnimalType
  keyframes: string
  duration: number
  delay: number
  easing: string
  infinite?: boolean
}

/**
 * Color palette adaptable to context
 */
export interface ColorPalette {
  base: string
  accent: string
  light: string
  dark: string
  overlay: string
}

/**
 * Organic effect configuration
 */
export interface OrganicEffect {
  type: "float" | "pulse" | "shimmer" | "drift" | "breathe"
  intensity: number // 0-1
  duration: number // ms
  delay?: number
  infinite?: boolean
}

/**
 * Background element definition
 */
export interface BackgroundElement {
  type: "blob" | "circle" | "line" | "dot" | "curve"
  x: number // 0-100 (percentage)
  y: number // 0-100 (percentage)
  size: number // 0-1 (relative to viewport)
  opacity: number // 0-1
  rotation: number // 0-360
  animation?: {
    type: string
    duration: number
  }
}

/**
 * Transition definition for page changes
 */
export interface OrganicTransition {
  enter: {
    duration: number
    delay: number
    easing: string
  }
  exit: {
    duration: number
    delay: number
    easing: string
  }
}

/**
 * Hover interaction configuration
 */
export interface HoverConfig {
  scale: number
  duration: number
  glowIntensity?: number
  particleCount?: number
}
