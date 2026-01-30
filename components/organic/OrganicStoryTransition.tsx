"use client"

import React, { useEffect, useMemo } from "react"
import { useId } from "react"
import type { ReactNode } from "react"
import type { AnimalType } from "@/lib/types"
import { useStoryTransition } from "@/hooks/useStoryTransition"
import { useMotionVariation } from "@/hooks/useMotionVariation"
import { createCSSEasing } from "@/lib/organic/easing-functions"

interface OrganicStoryTransitionProps {
  children: ReactNode
  animalType: AnimalType
  /** Entry, Reveal, Settle durations (ms) - optional overrides */
  entryDuration?: number
  revealDuration?: number
  settleDuration?: number
  onComplete?: () => void
  className?: string
}

/**
 * Short-story transitions:
 * - Entry: frames the element into the world (soft mask, slow rise, color wash)
 * - Reveal: exposes content (accent flow, micro-parallax)
 * - Settle: small breathing and micro-movements to settle into final state
 */
export function OrganicStoryTransition({
  children,
  animalType,
  entryDuration = 420,
  revealDuration = 380,
  settleDuration = 600,
  onComplete,
  className = "",
}: OrganicStoryTransitionProps) {
  const id = useId()
  const { phase, start, finish } = useStoryTransition({ entryDuration, revealDuration, settleDuration })
  const variation = useMotionVariation(animalType, phase === "entry" ? "drift" : phase === "reveal" ? "float" : "breathe", id)
  const easing = createCSSEasing(variation.easing)

  useEffect(() => {
    start()
  }, [])

  useEffect(() => {
    if (phase === "settled" && onComplete) onComplete()
  }, [phase])

  const maskId = `story-mask-${id}`
  const style = useMemo(() => {
    // Map phase to CSS variables used in keyframes
    const base = {
      // subtle opacities
      '--story-accent-opacity': phase === 'entry' ? '0.12' : phase === 'reveal' ? '0.18' : '0.08',
      '--story-translate-y': phase === 'entry' ? '18px' : phase === 'reveal' ? '6px' : '2px',
      '--story-scale': phase === 'entry' ? '0.996' : phase === 'reveal' ? '1.002' : '1.0',
    } as React.CSSProperties

    return base
  }, [phase])

  const animationName = `story-anim-${id}`

  const keyframes = `
    @keyframes ${animationName}-entry-${id} {
      0% { opacity: 0; transform: translateY(24px) scale(0.992); filter: blur(6px); }
      60% { opacity: 1; transform: translateY(8px) scale(0.998); filter: blur(2px); }
      100% { opacity: 1; transform: translateY(0px) scale(1); filter: blur(0px); }
    }

    @keyframes ${animationName}-reveal-${id} {
      0% { mask-position: 0% 50%; transform: translateY(6px) scale(1.002); opacity: 0.96; }
      50% { mask-position: 50% 50%; transform: translateY(2px) scale(1.001); opacity: 0.99; }
      100% { mask-position: 100% 50%; transform: translateY(0px) scale(1); opacity: 1; }
    }

    @keyframes ${animationName}-settle-${id} {
      0% { transform: translateY(0px) scale(1); }
      40% { transform: translateY(-${variation.intensity * 2}px) scale(${1 + variation.intensity * 0.002}); }
      100% { transform: translateY(0px) scale(1); }
    }

    .${animationName}-entry {
      animation: ${animationName}-entry-${id} ${variation.duration}ms ${easing} 0ms both;
    }

    .${animationName}-reveal {
      animation: ${animationName}-reveal-${id} ${variation.duration}ms ${easing} ${variation.delay}ms both;
    }

    .${animationName}-settle {
      animation: ${animationName}-settle-${id} ${variation.duration}ms ${easing} ${variation.delay}ms both;
      animation-iteration-count: 1;
    }
  `

  return (
    <>
      <style>{keyframes}</style>

      <div className={`relative overflow-visible ${className}`} style={style} data-story-phase={phase}>
        {/* Soft vignette and mask for entry */}
        {phase === 'entry' && (
          <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen', opacity: 0.5 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id={maskId} cx="50%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${maskId})`} />
            </svg>
          </div>
        )}

        <div className={`${animationName}-${phase === 'entry' ? 'entry' : phase === 'reveal' ? 'reveal' : 'settle'}`}>
          {children}
        </div>
      </div>
    </>
  )
}

export default OrganicStoryTransition
