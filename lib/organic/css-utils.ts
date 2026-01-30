/**
 * Organic CSS Utilities
 * Pre-built animations and effect classes
 * Auto-inject these into your CSS at build time
 */

import { getAllPersonalities } from "@/lib/organic/personalities"
import {
  getAnimalAnimation,
  generateAnimationCSS,
} from "@/lib/organic/animations"
import type { AnimalType } from "@/lib/types"

/**
 * Generate complete organic animation CSS for all animal types
 */
export function generateOrganicAnimationCSS(): string {
  const personalities = getAllPersonalities()
  const animationTypes: Array<"float" | "pulse" | "drift" | "breathe"> = [
    "float",
    "pulse",
    "drift",
    "breathe",
  ]

  let css = ""

  for (const [animalType, _] of Object.entries(personalities)) {
    for (const animationType of animationTypes) {
      const config = getAnimalAnimation(animalType as AnimalType, animationType)
      css += generateAnimationCSS(config)
    }
  }

  return css
}

/**
 * Generate Tailwind-compatible CSS variables for organic system
 */
export function generateOrganicCSSVariables(): string {
  const personalities = getAllPersonalities()
  let css = ":root {\n"

  for (const [animalType, personality] of Object.entries(personalities)) {
    css += `
  /* ${animalType} animal */
  --animal-${animalType}-primary: ${personality.primaryColor};
  --animal-${animalType}-accent: ${personality.accentColor};
  --animal-${animalType}-light: ${personality.lightColor};
  --animal-${animalType}-dark: ${personality.darkColor};
  --animal-${animalType}-transition-duration: ${personality.transitionDuration}ms;
  --animal-${animalType}-transition-easing: ${personality.transitionEase};
  --animal-${animalType}-hover-scale: ${personality.hoverScale};
  --animal-${animalType}-hover-duration: ${personality.hoverDuration}ms;
`
  }

  css += "}\n"
  return css
}

/**
 * Get CSS class utilities for organic effects
 */
export function getOrganicUtilityClasses(): Record<string, string> {
  return {
    // Float effect
    "animate-organic-float-cat": "animation: organic-float-cat 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms infinite;",
    "animate-organic-float-dog": "animation: organic-float-dog 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0ms infinite;",
    "animate-organic-float-bird": "animation: organic-float-bird 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 500ms infinite;",
    "animate-organic-float-other": "animation: organic-float-other 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms infinite;",

    // Pulse effect
    "animate-organic-pulse-cat": "animation: organic-pulse-cat 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms infinite;",
    "animate-organic-pulse-dog": "animation: organic-pulse-dog 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0ms infinite;",
    "animate-organic-pulse-bird": "animation: organic-pulse-bird 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms infinite;",
    "animate-organic-pulse-other": "animation: organic-pulse-other 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms infinite;",

    // Hover effects
    "hover-organic-glow": "transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);",
    "hover-organic-scale": "transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);",

    // Color utilities
    "text-organic-primary": "color: var(--organic-base);",
    "text-organic-accent": "color: var(--organic-accent);",
    "bg-organic-light": "background-color: var(--organic-light);",
    "bg-organic-dark": "background-color: var(--organic-dark);",
    "border-organic-accent": "border-color: var(--organic-accent);",
  }
}

/**
 * Generate complete organic CSS output
 */
export function generateCompleteOrganicCSS(): string {
  return `
/* ====================================================
   Organic Design System - Generated CSS
   Auto-generated for all animal contexts
   ==================================================== */

${generateOrganicCSSVariables()}

${generateOrganicAnimationCSS()}

/* Utility Classes */
.organic-animate-float {
  animation-name: organic-float;
}

.organic-animate-pulse {
  animation-name: organic-pulse;
}

.organic-animate-drift {
  animation-name: organic-drift;
}

.organic-animate-breathe {
  animation-name: organic-breathe;
}

/* Fadeup animation for text */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`
}
