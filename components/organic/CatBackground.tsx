"use client"

import React, { useId, useMemo } from "react"

interface Shape {
  id: string
  left: string
  top: string
  width: string
  height: string
  rotation: number
  colorA: string
  colorB: string
  duration: number
  delay: number
  blur: number
  opacity: number
}

/**
 * CatBackground
 * Full-screen organic background using CSS gradients + blur
 * Visible, but content readable (we rely on z-index on page content)
 */
export function CatBackground({ className = "" }: { className?: string }) {
  const id = useId()

  // Palette tuned for cats (warm, mysterious)
  const palette = useMemo(() => ({
    a: "#2C1810",
    b: "#D4A574",
    c: "#ECC8A8",
    d: "#22110D",
  }), [])

  // Generate a set of blurred gradient shapes
  const shapes = useMemo<Shape[]>(() => {
    // Predefined layout with some randomness
    const seed = Math.abs(hashString(id)) || 1
    const rng = (n = 1) => seededRandom(seed * 100 + n)

    return [0, 1, 2, 3].map((i) => {
      const left = Math.round(rng(i + 1) * 100)
      const top = Math.round(rng(i + 11) * 100)
      const w = 40 + Math.round(rng(i + 21) * 60)
      const h = 30 + Math.round(rng(i + 31) * 70)
      const rot = Math.round((rng(i + 41) - 0.5) * 60)
      const duration = 30000 + Math.round(rng(i + 51) * 20000)
      const delay = Math.round(rng(i + 61) * 8000)
      const blur = 40 + Math.round(rng(i + 71) * 60)
      const opacity = 0.18 + rng(i + 81) * 0.25

      return {
        id: `${id}-shape-${i}`,
        left: `${left}%`,
        top: `${top}%`,
        width: `${w}vw`,
        height: `${h}vh`,
        rotation: rot,
        colorA: i % 2 === 0 ? palette.b : palette.c,
        colorB: palette.a,
        duration,
        delay,
        blur,
        opacity,
      }
    })
  }, [id, palette])

  // Keyframes for slow drift
  const keyframes = `
    @keyframes cat-bg-drift-${id} {
      0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
      25% { transform: translate3d(-4%, -2%, 0) rotate(-1deg) scale(1.02); }
      50% { transform: translate3d(2%, -3%, 0) rotate(0.6deg) scale(0.98); }
      75% { transform: translate3d(-2%, 2%, 0) rotate(-0.4deg) scale(1.01); }
      100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
    }
  `

  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      style={{ mixBlendMode: "screen" }}
    >
      <style>{keyframes}</style>

      {/* Base subtle gradient to keep content readable */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(20,12,10,0.04), rgba(34,17,13,0.06))",
        }}
      />

      {shapes.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.width,
            height: s.height,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
            borderRadius: "40%",
            background: `radial-gradient(circle at 30% 30%, ${s.colorA}, ${s.colorB})`,
            filter: `blur(${s.blur}px)`,
            opacity: s.opacity,
            mixBlendMode: "overlay",
            animation: `cat-bg-drift-${id} ${s.duration}ms ease-in-out ${s.delay}ms infinite alternate`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Soft overlay vignette to ensure readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.06) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

export default CatBackground

/**
 * Small seeded helpers (kept local to avoid new lib imports)
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function hashString(str: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
