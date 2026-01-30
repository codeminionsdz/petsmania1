/**
 * Animal Personality Definitions
 * Each animal has a unique visual and emotional character
 * These are organic, handcrafted sensibilities - not generated
 */

import type { AnimalType } from "../types"
import type { AnimalPersonality } from "./types"

/**
 * CAT PERSONALITY: Mysterious, elegant, poised
 * Movement: smooth, fluid, contemplative
 * Essence: grace, independence, subtle power
 */
const catPersonality: AnimalPersonality = {
  primaryColor: "#2C1810", // warm brown
  accentColor: "#D4A574", // soft gold
  lightColor: "#F5E6D3", // cream
  darkColor: "#1A0F08", // deep brown
  
  energyLevel: "balanced",
  rhythmPattern: "flowing",
  
  bgComplexity: "moderate",
  bgElements: ["blob", "curve", "dot"],
  
  transitionStagger: 45,
  transitionEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  transitionDuration: 600,
  
  hoverScale: 1.02,
  hoverDuration: 300,
}

/**
 * DOG PERSONALITY: Enthusiastic, loyal, energetic
 * Movement: bouncy, playful, forward-moving
 * Essence: joy, warmth, uncomplicated happiness
 */
const dogPersonality: AnimalPersonality = {
  primaryColor: "#C85A17", // warm orange
  accentColor: "#FDB750", // bright yellow
  lightColor: "#FFF5E1", // light cream
  darkColor: "#6B2D0C", // dark orange
  
  energyLevel: "vibrant",
  rhythmPattern: "bouncy",
  
  bgComplexity: "rich",
  bgElements: ["blob", "circle", "dot", "line"],
  
  transitionStagger: 30,
  transitionEase: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  transitionDuration: 500,
  
  hoverScale: 1.05,
  hoverDuration: 250,
}

/**
 * BIRD PERSONALITY: Delicate, agile, transcendent
 * Movement: fluttering, ascending, light
 * Essence: freedom, grace, air
 */
const birdPersonality: AnimalPersonality = {
  primaryColor: "#1B4965", // deep teal
  accentColor: "#90E0EF", // sky blue
  lightColor: "#E0F4FF", // pale blue
  darkColor: "#0A2340", // navy
  
  energyLevel: "calm",
  rhythmPattern: "flowing",
  
  bgComplexity: "minimal",
  bgElements: ["curve", "dot", "line"],
  
  transitionStagger: 60,
  transitionEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  transitionDuration: 700,
  
  hoverScale: 1.03,
  hoverDuration: 350,
}

/**
 * OTHER PERSONALITY: Curious, diverse, unexpected
 * Movement: unpredictable, organic, natural
 * Essence: wonder, uniqueness, nature
 */
const otherPersonality: AnimalPersonality = {
  primaryColor: "#4A5859", // slate
  accentColor: "#9A8B7B", // warm gray
  lightColor: "#F0EDE5", // off-white
  darkColor: "#2D3537", // dark slate
  
  energyLevel: "balanced",
  rhythmPattern: "steady",
  
  bgComplexity: "moderate",
  bgElements: ["blob", "curve", "dot"],
  
  transitionStagger: 50,
  transitionEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  transitionDuration: 600,
  
  hoverScale: 1.04,
  hoverDuration: 300,
}

/**
 * Get personality for an animal type
 */
export function getAnimalPersonality(animalType: AnimalType): AnimalPersonality {
  const personalities: Record<AnimalType, AnimalPersonality> = {
    cat: catPersonality,
    dog: dogPersonality,
    bird: birdPersonality,
    other: otherPersonality,
  }
  
  return personalities[animalType] || otherPersonality
}

/**
 * Get all personalities (useful for theme generation)
 */
export function getAllPersonalities(): Record<AnimalType, AnimalPersonality> {
  return {
    cat: catPersonality,
    dog: dogPersonality,
    bird: birdPersonality,
    other: otherPersonality,
  }
}

/**
 * Get color palette from personality
 */
export function getPaletteFromPersonality(animalType: AnimalType) {
  const personality = getAnimalPersonality(animalType)
  return {
    base: personality.primaryColor,
    accent: personality.accentColor,
    light: personality.lightColor,
    dark: personality.darkColor,
    overlay: `${personality.primaryColor}15`, // 15% opacity
  }
}
