/**
 * OrganicText Component
 * Animated text with staggered character animations
 */

"use client"

import React, { useMemo } from "react"
import type { AnimalType } from "@/lib/types"
import { getStaggerDelay, getOrganicTransition } from "@/lib/organic"

interface OrganicTextProps {
  children: string
  animalType: AnimalType
  className?: string
  stagger?: boolean
  animated?: boolean
}

export function OrganicText({
  children,
  animalType,
  className = "",
  stagger = true,
  animated = true,
}: OrganicTextProps) {
  const transitions = useMemo(
    () => getOrganicTransition(animalType),
    [animalType]
  )

  const characters = children.split("")

  if (!stagger || !animated) {
    return <span className={className}>{children}</span>
  }

  return (
    <span className={className}>
      {characters.map((char, idx) => (
        <span
          key={`${idx}-${char}`}
          className="inline-block opacity-0 animate-pulse"
          style={{
            animation: `fadeInUp ${transitions.enter.duration}ms ${transitions.enter.easing} forwards`,
            animationDelay: `${getStaggerDelay(animalType, idx)}ms`,
            "--tw-animate-duration": `${transitions.enter.duration}ms`,
          } as any}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}

export default OrganicText
