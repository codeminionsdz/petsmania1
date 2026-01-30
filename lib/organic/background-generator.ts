/**
 * Organic Background Generator
 * Creates procedural, non-geometric backgrounds unique to each animal context
 * Uses simplex-like noise and organic curves (without external libraries)
 */

import type { AnimalType } from "../types"
import type { OrganicBackground, BackgroundElement } from "./types"
import { getAnimalPersonality } from "./personalities"

/**
 * Seeded random number generator (consistent results)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Pseudo-noise function for organic variation
 */
function organicNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return n - Math.floor(n)
}

/**
 * Smooth step function for organic curves
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * Perlin-like noise (simplified)
 */
function perlinNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi

  const n00 = organicNoise(xi, yi, seed)
  const n10 = organicNoise(xi + 1, yi, seed)
  const n01 = organicNoise(xi, yi + 1, seed)
  const n11 = organicNoise(xi + 1, yi + 1, seed)

  const u = smoothstep(xf)
  const v = smoothstep(yf)

  const nx0 = n00 * (1 - u) + n10 * u
  const nx1 = n01 * (1 - u) + n11 * u
  return nx0 * (1 - v) + nx1 * v
}

/**
 * Generate blob SVG path using organic curves
 */
function generateBlobPath(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  lobes: number = 4
): string {
  const points: string[] = []
  const angleStep = (Math.PI * 2) / (lobes * 4)
  
  for (let i = 0; i < lobes * 4; i++) {
    const angle = i * angleStep
    const variation = perlinNoise(
      Math.cos(angle) * 2,
      Math.sin(angle) * 2,
      seed
    )
    const r = radius * (0.6 + variation * 0.4)
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    
    if (i === 0) {
      points.push(`M ${x} ${y}`)
    } else {
      points.push(`L ${x} ${y}`)
    }
  }
  
  points.push("Z")
  return points.join(" ")
}

/**
 * Generate organic curve path
 */
function generateCurvePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number
): string {
  const segments = 20
  const points: string[] = [`M ${startX} ${startY}`]
  const controlOffset = 30

  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const x = startX + (endX - startX) * t
    const y = startY + (endY - startY) * t
    
    const offsetX = (perlinNoise(t * 5, 0, seed) - 0.5) * controlOffset
    const offsetY = (perlinNoise(0, t * 5, seed) - 0.5) * controlOffset
    
    points.push(`L ${x + offsetX} ${y + offsetY}`)
  }

  return points.join(" ")
}

/**
 * Generate background elements for an animal type
 */
function generateBackgroundElements(
  animalType: AnimalType,
  seed: number
): BackgroundElement[] {
  const personality = getAnimalPersonality(animalType)
  const elements: BackgroundElement[] = []
  
  const elementCounts: Record<string, number> = {
    blob: animalType === "dog" ? 3 : animalType === "cat" ? 2 : 1,
    circle: animalType === "dog" ? 4 : 2,
    dot: 8,
    line: animalType === "dog" ? 2 : 1,
    curve: 2,
  }

  let elementIndex = 0
  for (const [type, count] of Object.entries(elementCounts)) {
    for (let i = 0; i < count; i++) {
      const x = seededRandom(seed + elementIndex * 0.1) * 100
      const y = seededRandom(seed + elementIndex * 0.2) * 100
      const size = seededRandom(seed + elementIndex * 0.3) * 0.6 + 0.1
      const opacity = seededRandom(seed + elementIndex * 0.4) * 0.4 + 0.1
      const rotation = seededRandom(seed + elementIndex * 0.5) * 360

      elements.push({
        type: type as any,
        x,
        y,
        size,
        opacity,
        rotation,
      })
      
      elementIndex++
    }
  }

  return elements
}

/**
 * Generate SVG background
 */
export function generateOrganicBackground(
  animalType: AnimalType,
  seed: number = Date.now()
): OrganicBackground {
  const personality = getAnimalPersonality(animalType)
  const width = 1200
  const height = 800
  const elements = generateBackgroundElements(animalType, seed)

  const svgParts: string[] = [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`,
    `<defs>`,
    `<filter id="noise-${animalType}">`,
    `<feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" seed="${seed}" />`,
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />`,
    `</filter>`,
    `</defs>`,
    `<rect width="${width}" height="${height}" fill="${personality.lightColor}" />`,
  ]

  // Generate blobs
  for (let i = 0; i < 3; i++) {
    const element = elements[i % elements.length]
    const blobPath = generateBlobPath(
      (element.x / 100) * width,
      (element.y / 100) * height,
      element.size * 200,
      seed + i
    )
    
    const color = i % 2 === 0 ? personality.primaryColor : personality.accentColor
    svgParts.push(
      `<path d="${blobPath}" fill="${color}" opacity="${0.08 + (i * 0.02)}" filter="url(#noise-${animalType})" />`
    )
  }

  // Generate flowing curves
  if (animalType !== "bird") {
    for (let i = 0; i < 2; i++) {
      const startX = seededRandom(seed + i * 10) * width
      const startY = seededRandom(seed + i * 10 + 1) * height
      const endX = seededRandom(seed + i * 10 + 2) * width
      const endY = seededRandom(seed + i * 10 + 3) * height

      const curvePath = generateCurvePath(startX, startY, endX, endY, seed + i)
      svgParts.push(
        `<path d="${curvePath}" stroke="${personality.accentColor}" stroke-width="2" fill="none" opacity="0.05" />`
      )
    }
  }

  // Generate subtle dots
  for (let i = 0; i < 12; i++) {
    const x = seededRandom(seed + i * 100) * width
    const y = seededRandom(seed + i * 100 + 1) * height
    const r = seededRandom(seed + i * 100 + 2) * 3 + 1
    const opacity = seededRandom(seed + i * 100 + 3) * 0.15

    svgParts.push(
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${personality.primaryColor}" opacity="${opacity}" />`
    )
  }

  svgParts.push(`</svg>`)

  return {
    animalType,
    svg: svgParts.join("\n"),
    cssVariables: {
      "--animal-primary": personality.primaryColor,
      "--animal-accent": personality.accentColor,
      "--animal-light": personality.lightColor,
      "--animal-dark": personality.darkColor,
    },
    seed,
  }
}

/**
 * Generate a background as data URI
 */
export function getBackgroundDataUri(
  animalType: AnimalType,
  seed?: number
): string {
  const bg = generateOrganicBackground(animalType, seed)
  const encoded = encodeURIComponent(bg.svg)
  return `data:image/svg+xml,${encoded}`
}

/**
 * Cache backgrounds per animal type
 */
const bgCache = new Map<string, OrganicBackground>()

/**
 * Get or generate cached background
 */
export function getCachedBackground(animalType: AnimalType): OrganicBackground {
  const cacheKey = animalType
  
  if (!bgCache.has(cacheKey)) {
    const seed = animalType.charCodeAt(0) * 1000 + animalType.length
    bgCache.set(cacheKey, generateOrganicBackground(animalType, seed))
  }
  
  return bgCache.get(cacheKey)!
}

/**
 * Invalidate cache (useful for regenerating backgrounds)
 */
export function invalidateBackgroundCache(animalType?: AnimalType): void {
  if (animalType) {
    bgCache.delete(animalType)
  } else {
    bgCache.clear()
  }
}
