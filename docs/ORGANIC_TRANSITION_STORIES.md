# Organic Transition Stories

This document describes the "short story" approach to transitions: `Entry`, `Reveal`, `Settle` — designed to feel narrative and handcrafted, not mechanical.

## Philosophy

- Entry: Introduce the element gently into the scene with soft masking and a slow approach.
- Reveal: Expose the content with an expressive, flowing motion that hints at personality.
- Settle: Let the element breathe, micro-movements and a final calm that readies it for interaction.

Avoids: plain fades or slides. Instead, combine subtle masks, micro-parallax, soft blur, and personality-tuned timings.

## Component

Use `OrganicStoryTransition` from `components/organic/OrganicStoryTransition.tsx`.

Props:
- `animalType` — `cat|dog|bird|other` (controls motion variations)
- `entryDuration`, `revealDuration`, `settleDuration` — durations in ms
- `onComplete` — callback when story finishes

## Usage

```tsx
import { OrganicStoryTransition } from "@/components/organic"

export function Hero() {
  return (
    <OrganicStoryTransition animalType="cat">
      <div className="relative z-10 px-6 py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <h1>Handcrafted Essentials</h1>
      </div>
    </OrganicStoryTransition>
  )
}
```

## Implementation Notes

- `useStoryTransition` orchestrates phases. It is deterministic and cancels timers on unmount.
- The component uses `useMotionVariation` to subtly vary durations and easing per instance.
- Entry applies a radial soft mask and blur for atmosphere.
- Reveal uses a gentle mask-position animation to feel like a curtain sweeping.
- Settle runs a short breathe/drift so content feels alive.

## Tuning

- For more playful reveals, reduce `entryDuration`, increase `revealDuration`, and use the `dog` personality.
- For calm, premium reveals, use `cat` or `other`, lengthen `entryDuration`, and keep `settleDuration` longer.

## Accessibility

Honor `prefers-reduced-motion` by disabling the animations — wrap the component with a conditional.

```tsx
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

{!prefersReduced ? (
  <OrganicStoryTransition animalType="cat">...</OrganicStoryTransition>
) : (
  <div>Content without motion</div>
)}
```
