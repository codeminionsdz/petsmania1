/**
 * Organic Design System - Main Export
 * Unified API for organic visuals, animations, and interactions
 */

// Re-export types
export type {
  AnimalPersonality,
  OrganicBackground,
  AnimalAnimation,
  ColorPalette,
  OrganicEffect,
  BackgroundElement,
  OrganicTransition,
  HoverConfig,
} from "./types"

// Re-export personalities
export {
  getAnimalPersonality,
  getAllPersonalities,
  getPaletteFromPersonality,
} from "./personalities"

// Re-export background generation
export {
  generateOrganicBackground,
  getBackgroundDataUri,
  getCachedBackground,
  invalidateBackgroundCache,
} from "./background-generator"

// Re-export animations
export {
  getAnimalAnimation,
  generateAnimationCSS,
  getOrganicEffect,
  getOrganicTransition,
  getHoverConfig,
  getStaggerDelay,
  getAnimationClassName,
} from "./animations"

/**
 * Unified API for accessing the complete organic system
 */
export function getOrganicSystemForAnimal(animalType: any) {
  const { getAnimalPersonality } = require("./personalities")
  const { getCachedBackground } = require("./background-generator")
  const { getOrganicTransition, getHoverConfig, getAnimationClassName } = require("./animations")

  return {
    personality: getAnimalPersonality(animalType),
    background: getCachedBackground(animalType),
    transitions: getOrganicTransition(animalType),
    hover: getHoverConfig(animalType),
    animationClass: (effect: string) => getAnimationClassName(animalType, effect),
  }
}

/**
 * Initialize organic design system with CSS variables
 * Call this in your root layout or component
 */
export function initializeOrganicSystem(animalType: any): Record<string, string> {
  const { getPaletteFromPersonality } = require("./personalities")
  const palette = getPaletteFromPersonality(animalType)

  return {
    "--organic-base": palette.base,
    "--organic-accent": palette.accent,
    "--organic-light": palette.light,
    "--organic-dark": palette.dark,
    "--organic-overlay": palette.overlay,
  }
}
