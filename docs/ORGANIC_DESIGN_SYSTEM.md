# Organic Design System Guide

## Overview

This is a **living, organic interface system** designed for a high-end pet e-commerce platform. Every animal context has its own visual personality, motion vocabulary, and emotional character.

### Core Principles

✨ **Organic Visuals** - Non-geometric, naturally flowing backgrounds
🎭 **Emotional Transitions** - Motion reflects animal personality, not technical requirements
🎨 **Visual Personality** - Each animal (cat, dog, bird, other) has distinct traits
⚡ **Performance First** - CSS-based animations, cached backgrounds, 60fps guaranteed

---

## Architecture

### 1. **Personality System** (`lib/organic/personalities.ts`)

Each animal type has a **handcrafted personality** that defines:

#### **Color Palettes**
- **Primary Color**: Main visual identity
- **Accent Color**: Interactive highlights
- **Light Color**: Background tone
- **Dark Color**: Text/shadows

#### **Motion Characteristics**
- **Energy Level**: calm | balanced | playful | vibrant
- **Rhythm Pattern**: steady | flowing | bouncy | erratic
- **Transition Duration**: How fast changes animate (500-700ms)
- **Stagger Timing**: Delay between sequential animations (30-60ms)

#### **Current Personalities**

```
🐱 CAT
├─ Primary: #2C1810 (warm brown)
├─ Accent: #D4A574 (soft gold)
├─ Energy: balanced
├─ Rhythm: flowing
└─ Feel: mysterious, elegant, poised

🐕 DOG
├─ Primary: #C85A17 (warm orange)
├─ Accent: #FDB750 (bright yellow)
├─ Energy: vibrant
├─ Rhythm: bouncy
└─ Feel: enthusiastic, loyal, energetic

🦅 BIRD
├─ Primary: #1B4965 (deep teal)
├─ Accent: #90E0EF (sky blue)
├─ Energy: calm
├─ Rhythm: flowing
└─ Feel: delicate, agile, transcendent

🦎 OTHER
├─ Primary: #4A5859 (slate)
├─ Accent: #9A8B7B (warm gray)
├─ Energy: balanced
├─ Rhythm: steady
└─ Feel: curious, diverse, unique
```

### 2. **Background Generator** (`lib/organic/background-generator.ts`)

Procedural SVG backgrounds using **organic noise functions**:

- **Perlin-like Noise**: Smooth, natural variation
- **Organic Blob Shapes**: Non-geometric forms
- **Flowing Curves**: Natural, liquid-like paths
- **Seeded Generation**: Consistent results, cacheable

**Features:**
- No external dependencies (pure algorithms)
- Deterministic based on animal type
- Cached for performance
- Responsive to viewport

### 3. **Animation System** (`lib/organic/animations.ts`)

Context-aware animations that match personality:

**Available Effects:**
- **Float**: Gentle upward motion (bird-like)
- **Pulse**: Rhythmic expansion/contraction
- **Drift**: Horizontal flowing movement
- **Breathe**: Subtle shadow/scale breathing

Each effect behaves differently per animal:
```
Dog Float: Bouncy, energetic, with scale variation
Cat Float: Smooth, fluid, minimal bounce
Bird Float: Ascending with rotation, feather-like
Other Float: Balanced, natural rhythm
```

---

## Component Library

### **OrganicLayout**
Root wrapper that applies complete design system to a page.

```tsx
<OrganicLayout animalType="dog" showBackground fullScreen>
  {/* Your content */}
</OrganicLayout>
```

**Props:**
- `animalType`: Which personality to use (cat|dog|bird|other)
- `showBackground`: Toggle organic background (default: true)
- `fullScreen`: Full viewport height (default: true)
- `className`: Additional CSS classes

### **OrganicBackground**
Renders procedural background independently.

```tsx
<OrganicBackground 
  animalType="cat" 
  opacity={0.8}
  animated
  blur={2}
/>
```

### **OrganicCard**
Interactive card with personality-aware hover effects.

```tsx
<OrganicCard 
  animalType="dog"
  interactive
  glowEffect
  onClick={handleClick}
>
  {/* Card content */}
</OrganicCard>
```

**Features:**
- Smart hover scaling per animal
- Glow effect following mouse
- Smooth transitions
- Click handling

### **OrganicTransition**
Wrapper for emotion-driven page/element transitions.

```tsx
<OrganicTransition 
  animalType="bird"
  effectType="float"
  trigger={true}
>
  {/* Elements that fade in with float effect */}
</OrganicTransition>
```

### **OrganicText**
Staggered text animation with per-character delays.

```tsx
<OrganicText 
  animalType="dog"
  stagger
  animated
>
  Welcome to our organic world
</OrganicText>
```

---

## React Hooks

### `useAnimalPersonality(animalType)`
Get personality object for an animal.

### `useColorPalette(animalType)`
Get color palette (base, accent, light, dark, overlay).

### `useOrganicBackground(animalType)`
Get cached background SVG and CSS variables.

### `useOrganicTransition(animalType)`
Get transition timings and easing.

### `useHoverConfig(animalType)`
Get hover interaction settings (scale, duration, glow).

### `useOrganicAnimation(animalType, effectType)`
Get specific animation configuration.

### `useOrganicSystem(animalType)`
Initialize CSS variables globally (call in root layout).

### `useOrganicVisibility(animalType, initialState)`
Manage component visibility with transitions.

**Returns:**
```ts
{
  isVisible: boolean
  toggle: () => void
  show: () => void
  hide: () => void
  transition: OrganicTransition
}
```

### `useAnimationSequence(animalType, animations, autoplay)`
Play through multiple animations in sequence.

### `useMouseTracking()`
Get current mouse position for hover effects.

### `useResponsiveOrganicScale()`
Get responsive scaling factor (0.8-1.0).

---

## Utilities & CSS

### Generate Complete CSS
```ts
import { generateCompleteOrganicCSS } from "@/lib/organic/css-utils"

const css = generateCompleteOrganicCSS()
```

Generates all animations, variables, and utility classes.

### Get Personality Data
```ts
import { getAnimalPersonality, getAllPersonalities } from "@/lib/organic"

const catPersonality = getAnimalPersonality("cat")
const allPersonalities = getAllPersonalities()
```

### Generate Backgrounds
```ts
import { generateOrganicBackground, getBackgroundDataUri } from "@/lib/organic"

const bg = generateOrganicBackground("dog")
const dataUri = getBackgroundDataUri("bird")
```

### CSS Variables
Automatically set on root element:
```css
--organic-base: /* primary color */
--organic-accent: /* accent color */
--organic-light: /* light background */
--organic-dark: /* dark text */
--organic-overlay: /* semi-transparent overlay */
```

---

## Implementation Examples

### Basic Animal Page
```tsx
import { OrganicLayout } from "@/components/organic"

export default function DogPage() {
  return (
    <OrganicLayout animalType="dog">
      <div className="p-12">
        <h1>Dog Products</h1>
        {/* Your products */}
      </div>
    </OrganicLayout>
  )
}
```

### Product Grid with Animation
```tsx
import { OrganicCard, OrganicTransition } from "@/components/organic"
import { useOrganicAnimation } from "@/hooks/useOrganic"

export function ProductGrid({ products, animalType }) {
  const animation = useOrganicAnimation(animalType, "float")

  return (
    <div className="grid grid-cols-3 gap-8">
      {products.map((product, idx) => (
        <OrganicTransition key={product.id} animalType={animalType}>
          <OrganicCard animalType={animalType}>
            <img src={product.image} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </OrganicCard>
        </OrganicTransition>
      ))}
    </div>
  )
}
```

### Custom Animated Component
```tsx
import { useColorPalette, useOrganicAnimation } from "@/hooks/useOrganic"
import { generateAnimationCSS } from "@/lib/organic"

export function CustomAnimated({ animalType, children }) {
  const palette = useColorPalette(animalType)
  const animation = useOrganicAnimation(animalType, "pulse")
  const css = generateAnimationCSS(animation)

  return (
    <>
      <style>{css}</style>
      <div
        className={`organic-animate-${animation.animalType}`}
        style={{ color: palette.accent }}
      >
        {children}
      </div>
    </>
  )
}
```

---

## Performance Considerations

### ✅ Optimized
- **Cached Backgrounds**: Generated once per animal type
- **CSS Animations**: Hardware-accelerated, no JavaScript
- **Memoized Hooks**: Prevent unnecessary recalculations
- **No External Libraries**: Pure CSS and SVG

### ⚡ Best Practices
1. Use `OrganicLayout` at page level, not multiple times
2. Memoize animal type in parent components
3. Lazy-load background SVGs on slow connections
4. Use `willChange` CSS for animated elements
5. Limit simultaneous animations to 2-3 per page

---

## Customization

### Add New Animal Type
1. Add to `AnimalType` in `lib/types.ts`
2. Create personality in `lib/organic/personalities.ts`
3. Animations adapt automatically

### Modify Personality
```ts
// Edit lib/organic/personalities.ts
const myAnimalPersonality: AnimalPersonality = {
  primaryColor: "#FF6B6B",
  accentColor: "#FFE66D",
  lightColor: "#FFF8E7",
  darkColor: "#2D3436",
  energyLevel: "vibrant",
  rhythmPattern: "bouncy",
  bgComplexity: "rich",
  bgElements: ["blob", "circle", "dot"],
  transitionStagger: 35,
  transitionEase: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  transitionDuration: 550,
  hoverScale: 1.06,
  hoverDuration: 280,
}
```

### Override Colors
```tsx
<OrganicLayout animalType="cat">
  <style>{`
    :root {
      --organic-accent: #FF6B6B;
    }
  `}</style>
  {/* Content */}
</OrganicLayout>
```

---

## Testing & Debugging

### Check CSS Variables
```tsx
export function DebugOrganic({ animalType }) {
  const { useOrganicSystem } = require("@/hooks/useOrganic")
  const vars = useOrganicSystem(animalType)
  
  return (
    <div className="p-4 font-mono text-sm">
      {Object.entries(vars).map(([key, value]) => (
        <div key={key}>{key}: {value}</div>
      ))}
    </div>
  )
}
```

### View Generated Background
```tsx
import { getBackgroundDataUri } from "@/lib/organic"

export function DebugBackground({ animalType }) {
  const uri = getBackgroundDataUri(animalType)
  return <img src={uri} alt="Generated background" className="w-full h-64" />
}
```

---

## Migration Guide

If you have existing styles:

1. **Replace color constants** with `useColorPalette()`
2. **Replace animations** with `useOrganicAnimation()`
3. **Wrap pages** with `<OrganicLayout>`
4. **Use components** instead of custom divs
5. **Test hover states** - they're now automatic

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11: No support (CSS animations required)

---

## File Structure

```
lib/organic/
├── types.ts                  # Type definitions
├── personalities.ts          # Animal personalities & colors
├── background-generator.ts   # Procedural backgrounds
├── animations.ts             # Animation configurations
├── css-utils.ts              # CSS generation utilities
└── index.ts                  # Main export

components/organic/
├── OrganicBackground.tsx     # Background component
├── OrganicCard.tsx           # Interactive card
├── OrganicLayout.tsx         # Root layout wrapper
├── OrganicText.tsx           # Staggered text
├── OrganicTransition.tsx     # Transition wrapper
└── index.ts                  # Component export

hooks/
└── useOrganic.ts             # All React hooks

docs/
└── ORGANIC_USAGE_EXAMPLES.ts # Example implementations
```

---

## Next Steps

1. **Import OrganicLayout** in your root app layout
2. **Wrap animal pages** with the system
3. **Replace product cards** with OrganicCard
4. **Add OrganicBackground** to hero sections
5. **Use hooks** for custom animations
6. **Test on different animal pages** to see personality shine

The system is **ready to use immediately**. Every component works standalone or together.

---

**Remember:** This isn't just a design system—it's a *personality system*. Let your animals breathe.
