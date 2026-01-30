"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type StoryPhase = "idle" | "entry" | "reveal" | "settle" | "settled"

interface UseStoryTransitionOptions {
  entryDuration?: number
  revealDuration?: number
  settleDuration?: number
}

/**
 * Hook to run short-story transitions: Entry -> Reveal -> Settle -> Settled
 * Returns current phase and controls to start/finish
 */
export function useStoryTransition({ entryDuration = 420, revealDuration = 380, settleDuration = 600 }: UseStoryTransitionOptions = {}) {
  const [phase, setPhase] = useState<StoryPhase>("idle")
  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [])

  const start = useCallback(() => {
    setPhase("entry")
    // schedule reveal
    const t1 = window.setTimeout(() => setPhase("reveal"), entryDuration)
    // schedule settle
    const t2 = window.setTimeout(() => setPhase("settle"), entryDuration + revealDuration)
    // schedule final
    const t3 = window.setTimeout(() => setPhase("settled"), entryDuration + revealDuration + settleDuration)

    timers.current.push(t1, t2, t3)
  }, [entryDuration, revealDuration, settleDuration])

  const finish = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setPhase("settled")
  }, [])

  return { phase, start, finish }
}

export default useStoryTransition
