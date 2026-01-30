# Visual Layer Integration Guide

Getting started with organic visual layers in your pages.

## 60-Second Setup

### Step 1: Import Component
```tsx
import { OrganicVisualLayer } from "@/components/organic"
```

### Step 2: Add to Your Page
```tsx
<div className="relative min-h-screen">
  <OrganicVisualLayer animalType="cat" effectType="waves" />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

Done! Your page now has a living, organic background.

## Integration Patterns

### Pattern A: Full Page Background

```tsx
// pages/cats/index.tsx
import { OrganicLayout } from "@/components/organic"
import { OrganicVisualLayer } from "@/components/organic"

export default function CatsPage() {
  return (
    <OrganicLayout animalType="cat">
      {/* Global visual layer */}
      <OrganicVisualLayer
        animalType="cat"
        effectType="gradient-flow"
        intensity={0.4}
        opacity={0.3}
      />
      
      <main className="relative z-10">
        {/* Page sections */}
        <CategoriesSection />
        <FeaturedProducts />
        <TestimonialsSection />
      </main>
    </OrganicLayout>
  )
}
```

### Pattern B: Section-by-Section

```tsx
// Add visual layers to individual sections
export function ProductsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Section background effect */}
      <OrganicVisualLayer
        animalType="dog"
        effectType="shimmer"
        intensity={0.5}
        opacity={0.3}
      />
      
      <div className="relative z-10 container">
        {/* Section content */}
      </div>
    </section>
  )
}
```

### Pattern C: Component-Level

```tsx
// Add visual layers to individual components
export function FeatureCard({ title, description, animalType }) {
  return (
    <div className="relative rounded-lg overflow-hidden bg-white">
      <OrganicVisualLayer
        animalType={animalType}
        effectType="mask-blend"
        intensity={0.3}
        opacity={0.2}
      />
      
      <div className="relative z-10 p-6">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}
```

## Common Configurations

### Background-Only (Minimal)
```tsx
<OrganicVisualLayer
  animalType="cat"
  effectType="gradient-flow"
  intensity={0.2}
  opacity={0.15}
/>
```
**Use for**: Product cards, subtle sections, minimal designs

### Standard (Balanced)
```tsx
<OrganicVisualLayer
  animalType="dog"
  effectType="waves"
  intensity={0.5}
  opacity={0.4}
/>
```
**Use for**: Regular sections, hero areas, featured content

### Rich (Maximum Effect)
```tsx
<OrganicMultiLayerVisual
  animalType="bird"
  glowIntensity={0.3}
/>
```
**Use for**: Hero sections, landing pages, premium content

## Choosing Effect Types

| Effect | Best For | Speed | Intensity |
|--------|----------|-------|-----------|
| **waves** | Dynamic sections | slow/normal/fast | 0.4-0.7 |
| **noise** | Texture layers | N/A | 0.2-0.4 |
| **gradient-flow** | Smooth transitions | N/A | 0.3-0.6 |
| **mask-blend** | Glowing effects | N/A | 0.3-0.5 |
| **shimmer** | Elegant accents | normal/fast | 0.2-0.4 |

## Mobile Optimization

### Reduce Intensity on Mobile

```tsx
const isMobile = useResponsiveOrganicScale() < 1

<OrganicVisualLayer
  animalType="cat"
  effectType="waves"
  intensity={isMobile ? 0.3 : 0.6}
  opacity={isMobile ? 0.2 : 0.5}
/>
```

### Simplify Layers on Mobile

```tsx
const isMobile = useResponsiveOrganicScale() < 1

<OrganicMultiLayerVisual
  animalType="dog"
  layers={isMobile ? [] : defaultLayers}
/>
```

## Performance Tips

1. **Use one visual layer per section** - Don't stack too many effects
2. **Minimize blur values** - Keep blur < 5px, prefer 0-2px
3. **Choose appropriate intensity** - Higher intensity = more CPU
4. **Test on real devices** - Use Chrome DevTools throttling
5. **Disable on low-end devices** - Check device capabilities

### Conditional Rendering for Performance

```tsx
const isHighEndDevice = () => {
  // Detect high-end device
  return /iPhone|Android/.test(navigator.userAgent) === false
}

{isHighEndDevice() && (
  <OrganicVisualLayer
    animalType="cat"
    effectType="waves"
    intensity={0.6}
  />
)}
```

## Accessibility Considerations

### Motion Preferences

```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches

<OrganicVisualLayer
  animalType="cat"
  effectType="waves"
  animated={!prefersReducedMotion}
/>
```

### Color Contrast

Visual layers are designed to complement content without reducing contrast. Test with:
- WAVE browser extension
- Lighthouse accessibility audit
- Manual testing with accessibility tools

## Troubleshooting

### Visual Layer Not Showing

```tsx
// ❌ Wrong - parent might clip content
<div className="h-10 overflow-hidden">
  <OrganicVisualLayer animalType="cat" />
</div>

// ✅ Correct - parent is large enough
<div className="relative h-screen overflow-hidden">
  <OrganicVisualLayer animalType="cat" />
</div>
```

### Content Being Blocked

```tsx
// ❌ Wrong - visual layer is clickable
<OrganicVisualLayer animalType="cat" />
<button>Click me</button>  // Can't click!

// ✅ Correct - visual layer has pointer-events: none
<OrganicVisualLayer animalType="cat" />  // Already has this!
<button>Click me</button>  // Works!
```

### Performance Issues

```tsx
// ❌ Wrong - too many layers, high intensity
<OrganicVisualLayer intensity={0.9} blur={10} />
<OrganicVisualLayer intensity={0.8} blur={8} />
<OrganicVisualLayer intensity={0.7} blur={6} />

// ✅ Correct - single well-tuned layer
<OrganicVisualLayer intensity={0.5} blur={2} />
```

## Advanced: Custom Layers

```tsx
import { createVisualLayer, combineVisualLayers } from "@/lib/organic"

// Create custom layers
const customLayers = combineVisualLayers(
  [createVisualLayer("waves", 0.6, 0.5, { speed: "fast" })],
  [createVisualLayer("shimmer", 0.3, 0.2)]
)

<OrganicMultiLayerVisual
  animalType="cat"
  layers={customLayers}
/>
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Next Steps

1. **Start with one visual layer** on your homepage
2. **Collect user feedback** on the visual effects
3. **Roll out gradually** to other pages
4. **Customize colors** by editing `lib/organic/personalities.ts` if needed
5. **Monitor performance** with Lighthouse and DevTools

## Quick Links

- [Visual Layer Component Reference](./ORGANIC_VISUAL_LAYER.md)
- [Visual Layer Examples](./ORGANIC_VISUAL_LAYER_EXAMPLES.md)
- [All Organic Components](./ORGANIC_QUICK_START.md)
- [Configuration & Customization](./ORGANIC_PERSONALITIES.md)
