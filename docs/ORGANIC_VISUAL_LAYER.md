# Organic Visual Layer Components

Complete reference for the visual layer component system.

## Overview

The Organic Visual Layer system adds living, breathing visual effects to your pages. Effects are:

- **Procedurally generated** using SVG and noise algorithms
- **Color-adaptive** - automatically matches animal personality
- **Non-intrusive** - uses `pointer-events: none` to never block interaction
- **Performant** - hardware-accelerated CSS animations
- **Customizable** - full control over intensity, opacity, blur, speed

## Components

### OrganicVisualLayer

Single-layer visual effect for adding subtle or bold visual effects.

**File**: `components/organic/OrganicVisualLayer.tsx`

```tsx
import { OrganicVisualLayer } from "@/components/organic"

<OrganicVisualLayer
  animalType="cat"
  effectType="gradient-flow"
  intensity={0.6}
  opacity={0.5}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animalType` | `"cat" \| "dog" \| "bird" \| "other"` | Required | Which personality to use for colors |
| `effectType` | `"waves" \| "noise" \| "gradient-flow" \| "mask-blend" \| "shimmer"` | `"waves"` | Visual effect style |
| `intensity` | `number` | `0.6` | Effect strength (0-1) |
| `opacity` | `number` | `0.5` | Overall transparency (0-1) |
| `animated` | `boolean` | `true` | Enable/disable animation |
| `blur` | `number` | `0` | Blur amount in pixels |
| `speed` | `"slow" \| "normal" \| "fast"` | `"normal"` | Animation speed (waves/shimmer only) |
| `className` | `string` | `""` | Additional CSS classes |

#### Effect Types

**waves**
- Flowing water-like animated patterns
- Best for: Dynamic sections, hero areas
- Works with: `speed` prop

```tsx
<OrganicVisualLayer
  animalType="dog"
  effectType="waves"
  speed="normal"
/>
```

**noise**
- Organic grainy texture (static)
- Best for: Subtle background texture, product cards
- Pairs well with: Other effects for layering

```tsx
<OrganicVisualLayer
  animalType="bird"
  effectType="noise"
  intensity={0.4}
/>
```

**gradient-flow**
- Blending color gradients with smooth flow
- Best for: Elegant sections, transitions
- Works well: With slight blur

```tsx
<OrganicVisualLayer
  animalType="cat"
  effectType="gradient-flow"
  blur={1}
/>
```

**mask-blend**
- Radial glowing masks with soft blurs
- Best for: Premium sections, feature highlights
- Highest visual impact

```tsx
<OrganicVisualLayer
  animalType="other"
  effectType="mask-blend"
  intensity={0.5}
  blur={2}
/>
```

**shimmer**
- Elegant shimmer effect moving across surface
- Best for: Accent effects, premium feel
- Works with: `speed` prop

```tsx
<OrganicVisualLayer
  animalType="dog"
  effectType="shimmer"
  speed="fast"
/>
```

### OrganicMultiLayerVisual

Complex, multi-layered visual effects with built-in composition.

**File**: `components/organic/OrganicMultiLayerVisual.tsx`

```tsx
import { OrganicMultiLayerVisual } from "@/components/organic"

<OrganicMultiLayerVisual
  animalType="cat"
  glowIntensity={0.3}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animalType` | `"cat" \| "dog" \| "bird" \| "other"` | Required | Which personality to use |
| `layers` | `VisualLayerConfig[]` | Preset layers | Custom layer configuration |
| `glowIntensity` | `number` | `0.2` | Glow overlay strength (0-1) |
| `interactive` | `boolean` | `false` | Enable mouse tracking (future) |
| `className` | `string` | `""` | Additional CSS classes |

#### Layer Configuration

Each layer is a `VisualLayerConfig`:

```tsx
interface VisualLayerConfig {
  type: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"
  intensity?: number
  opacity?: number
  blur?: number
  speed?: "slow" | "normal" | "fast"
}
```

#### Preset Layers by Animal

Each animal type has pre-configured layers optimized for its personality:

**Cat**: Slow, elegant gradient-flow + subtle mask-blend
```tsx
<OrganicMultiLayerVisual animalType="cat" />
```

**Dog**: Fast waves + dynamic shimmer
```tsx
<OrganicMultiLayerVisual animalType="dog" />
```

**Bird**: Balanced noise + gradient-flow
```tsx
<OrganicMultiLayerVisual animalType="bird" />
```

**Other**: Mask-blend + moderate waves
```tsx
<OrganicMultiLayerVisual animalType="other" />
```

## Hooks

### useVisualLayer

Get the preset visual layer configuration for an animal type.

```tsx
import { useVisualLayer } from "@/hooks"

const layers = useVisualLayer("cat")
// Returns preset layers configured for cat personality
```

### useVisualLayerByComplexity

Get layers at different complexity levels (minimal, balanced, rich).

```tsx
import { useVisualLayerByComplexity } from "@/hooks"

const minimalLayers = useVisualLayerByComplexity("minimal")
const balancedLayers = useVisualLayerByComplexity("balanced")
const richLayers = useVisualLayerByComplexity("rich")
```

### useAdjustedVisualLayer

Multiply the intensity and opacity of a layer by a factor.

```tsx
import { useAdjustedVisualLayer, useVisualLayer } from "@/hooks"

const baseLayer = useVisualLayer("dog")[0]
const doubled = useAdjustedVisualLayer(baseLayer, 2.0)  // 2x more intense
const halved = useAdjustedVisualLayer(baseLayer, 0.5)   // 2x less intense
```

### useVisualLayers

Get visual layers with optional complexity level.

```tsx
import { useVisualLayers } from "@/hooks"

const layers = useVisualLayers("cat")              // Default preset
const richLayers = useVisualLayers("cat", "rich")  // Rich complexity
```

## Configuration API

### getVisualLayerConfig

Get preset layers for an animal type.

```tsx
import { getVisualLayerConfig } from "@/lib/organic"

const layers = getVisualLayerConfig("dog")
```

### getVisualLayersByComplexity

Get layers by complexity level.

```tsx
import { getVisualLayersByComplexity } from "@/lib/organic"

const minimal = getVisualLayersByComplexity("minimal")
const balanced = getVisualLayersByComplexity("balanced")
const rich = getVisualLayersByComplexity("rich")
```

### createVisualLayer

Create a custom layer with specific settings.

```tsx
import { createVisualLayer } from "@/lib/organic"

const custom = createVisualLayer(
  "waves",           // effect type
  0.6,               // intensity
  0.5,               // opacity
  { speed: "fast" }  // options
)
```

### combineVisualLayers

Combine multiple layer configurations.

```tsx
import { combineVisualLayers, createVisualLayer } from "@/lib/organic"

const combined = combineVisualLayers(
  [createVisualLayer("waves", 0.5, 0.4)],
  [createVisualLayer("shimmer", 0.3, 0.2)]
)
```

### adjustVisualLayerIntensity

Adjust a layer's intensity by multiplying by a factor.

```tsx
import { adjustVisualLayerIntensity } from "@/lib/organic"

const original = { type: "waves", intensity: 0.5, opacity: 0.4 }
const adjusted = adjustVisualLayerIntensity(original, 1.5)  // 50% more intense
```

## Color Palettes

Visual layers automatically adapt to animal personality colors:

| Animal | Base | Accent | Light | Dark |
|--------|------|--------|-------|------|
| **Cat** | #2C1810 | #D4A574 | #ECC8A8 | #1A0F08 |
| **Dog** | #C85A17 | #FDB750 | #FFD699 | #663009 |
| **Bird** | #1B4965 | #90E0EF | #D4F1FF | #0D2640 |
| **Other** | #4A5859 | #9A8B7B | #C9BEB3 | #232728 |

## Usage Patterns

### Pattern 1: Minimal Background
Subtle effect that doesn't distract from content.

```tsx
<div className="relative">
  <OrganicVisualLayer
    animalType="cat"
    effectType="gradient-flow"
    intensity={0.3}
    opacity={0.2}
  />
  <div className="relative z-10">Content</div>
</div>
```

### Pattern 2: Section Enhancement
Adds visual interest to a section.

```tsx
<section className="relative py-20">
  <OrganicVisualLayer
    animalType="dog"
    effectType="waves"
    intensity={0.5}
    opacity={0.4}
  />
  <div className="relative z-10">Section Content</div>
</section>
```

### Pattern 3: Hero Section
Rich, immersive visual effects.

```tsx
<div className="relative h-screen overflow-hidden">
  <OrganicMultiLayerVisual
    animalType="bird"
    glowIntensity={0.35}
  />
  <div className="relative z-10 flex items-center justify-center h-full">
    Hero Content
  </div>
</div>
```

### Pattern 4: Layered Cards
Multiple cards with individual visual effects.

```tsx
{products.map((product) => (
  <div key={product.id} className="relative rounded-lg overflow-hidden">
    <OrganicVisualLayer
      animalType={product.animalType}
      effectType="mask-blend"
      intensity={0.3}
      opacity={0.2}
    />
    <div className="relative z-10 p-6">
      {/* Card content */}
    </div>
  </div>
))}
```

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Frame Rate** | 60fps | Hardware-accelerated CSS |
| **CPU Impact** | Low | SVG generated once, cached |
| **Memory** | ~50KB per animal | Cached backgrounds |
| **Time to Interactive** | Unaffected | Non-blocking animations |
| **Blur Impact** | Moderate | Use sparingly (blur > 5px impacts performance) |

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Mobile Safari | 14+ | ✅ Full support |
| Chrome Android | Latest | ✅ Full support |

## Accessibility

### Motion Preferences

Visual layers respect `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches

<OrganicVisualLayer
  {...props}
  animated={!prefersReducedMotion}
/>
```

### Color Contrast

Visual layers are designed as background enhancements and don't impact text contrast ratios. All text remains readable.

### Keyboard Navigation

Visual layers use `pointer-events: none` and never interfere with keyboard navigation or form interaction.

## Troubleshooting

### Effect Not Visible

1. **Check z-index**: Content must be `relative z-10` or higher
2. **Check positioning**: Parent must be `relative` or `absolute`
3. **Check opacity**: Both `opacity` and `intensity` affect visibility

```tsx
// ❌ Wrong: Content and effect have same z-index
<div className="relative">
  <OrganicVisualLayer animalType="cat" />
  <div>Content</div>
</div>

// ✅ Correct: Content is above effect
<div className="relative">
  <OrganicVisualLayer animalType="cat" />
  <div className="relative z-10">Content</div>
</div>
```

### Effect Blocking Clicks

All visual layers have `pointer-events: none` by default. If clicks are being blocked:

```tsx
// ✅ Correct - Visual layer doesn't block anything
<div className="relative">
  <OrganicVisualLayer animalType="cat" />
  <button>Clickable</button>
</div>
```

### Performance Issues

1. **Reduce intensity**: Lower values use less GPU
2. **Reduce blur**: Blur > 5px significantly impacts performance
3. **Use single layer**: Multiple layered effects can compound
4. **Mobile optimization**: Reduce intensity on smaller screens

```tsx
const scale = useResponsiveOrganicScale()

<OrganicVisualLayer
  intensity={scale < 1 ? 0.3 : 0.6}
  blur={scale < 1 ? 0 : 2}
/>
```

## See Also

- [Visual Layer Integration Guide](./ORGANIC_VISUAL_LAYER_INTEGRATION.md)
- [Visual Layer Examples](./ORGANIC_VISUAL_LAYER_EXAMPLES.md)
- [All Organic Components](./ORGANIC_QUICK_START.md)
- [Animation System](./ORGANIC_ANIMATIONS.md)
- [Color Personalities](./ORGANIC_PERSONALITIES.md)
