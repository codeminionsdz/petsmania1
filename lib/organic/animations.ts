/**
 * Organic Animation System
 * Emotion-driven animations that reflect each animal's personality
 */

import type { AnimalType } from "../types"
import type { AnimalAnimation, OrganicEffect, OrganicTransition, HoverConfig } from "./types"
import { getAnimalPersonality } from "./personalities"

/**
 * Generate keyframe animation for an animal type
 */
function generateKeyframes(
  animalType: AnimalType,
  animationType: "float" | "pulse" | "drift" | "breathe"
): string {
  const personality = getAnimalPersonality(animalType)

  switch (animationType) {
    case "float": {
      if (animalType === "bird") {
        return `
          @keyframes organic-float-${animalType} {
            0% { transform: translateY(0px) rotateZ(-2deg); }
            25% { transform: translateY(-15px) rotateZ(1deg); }
            50% { transform: translateY(-25px) rotateZ(-1deg); }
            75% { transform: translateY(-15px) rotateZ(2deg); }
            100% { transform: translateY(0px) rotateZ(-2deg); }
          }
        `
      } else if (animalType === "dog") {
        return `
          @keyframes organic-float-${animalType} {
            0% { transform: translateY(0px) scaleY(1); }
            25% { transform: translateY(-10px) scaleY(0.98); }
            50% { transform: translateY(-18px) scaleY(0.95); }
            75% { transform: translateY(-8px) scaleY(0.98); }
            100% { transform: translateY(0px) scaleY(1); }
          }
        `
      } else {
        // cat & other: smooth, fluid
        return `
          @keyframes organic-float-${animalType} {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
        `
      }
    }

    case "pulse": {
      if (animalType === "dog") {
        return `
          @keyframes organic-pulse-${animalType} {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.8; }
          }
        `
      } else if (animalType === "bird") {
        return `
          @keyframes organic-pulse-${animalType} {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.04); opacity: 0.9; }
          }
        `
      } else {
        return `
          @keyframes organic-pulse-${animalType} {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.85; }
          }
        `
      }
    }

    case "drift": {
      if (animalType === "bird") {
        return `
          @keyframes organic-drift-${animalType} {
            0% { transform: translateX(0px) rotateZ(0deg); }
            25% { transform: translateX(-20px) rotateZ(-5deg); }
            50% { transform: translateX(0px) rotateZ(0deg); }
            75% { transform: translateX(20px) rotateZ(5deg); }
            100% { transform: translateX(0px) rotateZ(0deg); }
          }
        `
      } else if (animalType === "dog") {
        return `
          @keyframes organic-drift-${animalType} {
            0% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
          }
        `
      } else {
        return `
          @keyframes organic-drift-${animalType} {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(15px); }
          }
        `
      }
    }

    case "breathe": {
      return `
        @keyframes organic-breathe-${animalType} {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(0,0,0,0));
          }
          50% { 
            transform: scale(1.02);
            filter: drop-shadow(0 8px 12px rgba(0,0,0,0.08));
          }
        }
      `
    }

    default:
      return ""
  }
}

/**
 * Get animation configuration for animal type
 */
export function getAnimalAnimation(
  animalType: AnimalType,
  animationType: "float" | "pulse" | "drift" | "breathe" = "float"
): AnimalAnimation {
  const personality = getAnimalPersonality(animalType)
  const keyframes = generateKeyframes(animalType, animationType)

  const durations: Record<typeof animationType, number> = {
    float: animalType === "bird" ? 3000 : 2500,
    pulse: animalType === "dog" ? 1500 : 2000,
    drift: animalType === "bird" ? 4000 : 3000,
    breathe: 2800,
  }

  const delays: Record<typeof animationType, number> = {
    float: animalType === "bird" ? 500 : 200,
    pulse: 0,
    drift: animalType === "dog" ? 300 : 500,
    breathe: 100,
  }

  return {
    animalType,
    keyframes,
    duration: durations[animationType],
    delay: delays[animationType],
    easing: personality.transitionEase,
    infinite: true,
  }
}

/**
 * Generate CSS for a specific animation
 */
export function generateAnimationCSS(
  animationConfig: AnimalAnimation
): string {
  return `
    ${animationConfig.keyframes}
    
    .organic-animate-${animationConfig.animalType} {
      animation: organic-${animationConfig.animalType}
        ${animationConfig.duration}ms
        ${animationConfig.easing}
        ${animationConfig.delay}ms
        infinite;
    }
  `
}

/**
 * Get organic effect configuration
 */
export function getOrganicEffect(
  animalType: AnimalType,
  effectType: "float" | "pulse" | "shimmer" | "drift" | "breathe"
): OrganicEffect {
  const personality = getAnimalPersonality(animalType)

  const effects: Record<string, OrganicEffect> = {
    float: {
      type: "float",
      intensity: animalType === "bird" ? 0.9 : 0.6,
      duration: animalType === "bird" ? 3000 : 2500,
      infinite: true,
    },
    pulse: {
      type: "pulse",
      intensity: animalType === "dog" ? 0.8 : 0.5,
      duration: animalType === "dog" ? 1500 : 2000,
      infinite: true,
    },
    shimmer: {
      type: "shimmer",
      intensity: 0.4,
      duration: 2000,
      infinite: true,
    },
    drift: {
      type: "drift",
      intensity: animalType === "bird" ? 0.7 : 0.4,
      duration: animalType === "bird" ? 4000 : 3000,
      infinite: true,
    },
    breathe: {
      type: "breathe",
      intensity: 0.5,
      duration: 2800,
      infinite: true,
    },
  }

  return effects[effectType] || effects.float
}

/**
 * Get transition configuration per animal type
 */
export function getOrganicTransition(animalType: AnimalType): OrganicTransition {
  const personality = getAnimalPersonality(animalType)

  return {
    enter: {
      duration: personality.transitionDuration,
      delay: 0,
      easing: personality.transitionEase,
    },
    exit: {
      duration: Math.floor(personality.transitionDuration * 0.6),
      delay: 0,
      easing: personality.transitionEase,
    },
  }
}

/**
 * Get hover interaction configuration
 */
export function getHoverConfig(animalType: AnimalType): HoverConfig {
  const personality = getAnimalPersonality(animalType)

  return {
    scale: personality.hoverScale,
    duration: personality.hoverDuration,
    glowIntensity: animalType === "dog" ? 0.15 : 0.1,
    particleCount: animalType === "dog" ? 8 : 4,
  }
}

/**
 * Generate staggered animation delays for list items
 */
export function getStaggerDelay(
  animalType: AnimalType,
  index: number
): number {
  const personality = getAnimalPersonality(animalType)
  return index * personality.transitionStagger
}

/**
 * Generate animation class name
 */
export function getAnimationClassName(
  animalType: AnimalType,
  effectType: string
): string {
  return `organic-animate-${effectType}-${animalType}`
}
