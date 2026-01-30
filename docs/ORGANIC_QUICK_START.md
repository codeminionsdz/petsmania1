# Quick Start: Organic Design System

## 60-Second Setup

### 1. Import in Root Layout
```tsx
// app/layout.tsx
import { OrganicLayout } from "@/components/organic"
import { useOrganicSystem } from "@/hooks/useOrganic"

export default function RootLayout({ children, animalType }) {
  return (
    <html>
      <body>
        <OrganicLayout animalType={animalType} showBackground>
          {children}
        </OrganicLayout>
      </body>
    </html>
  )
}
```

### 2. Use in Components
```tsx
import { OrganicCard } from "@/components/organic"

export function Product({ product, animalType }) {
  return (
    <OrganicCard animalType={animalType}>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </OrganicCard>
  )
}
```

### 3. Add Animations
```tsx
import { useOrganicAnimation } from "@/hooks/useOrganic"

export function AnimatedTitle({ animalType, text }) {
  const animation = useOrganicAnimation(animalType)
  
  return (
    <h1 style={{ animation: `${animation.keyframes}` }}>
      {text}
    </h1>
  )
}
```

---

## Common Tasks

### Get Colors for Styling
```tsx
import { useColorPalette } from "@/hooks/useOrganic"

const { base, accent, light, dark } = useColorPalette("dog")
```

### Create Animated List
```tsx
import { getStaggerDelay } from "@/lib/organic"

{items.map((item, idx) => (
  <div key={item.id} style={{ 
    animation: `fadeIn 600ms ease-out ${getStaggerDelay("cat", idx)}ms forwards`
  }}>
    {item.name}
  </div>
))}
```

### Build Hover Effects
```tsx
import { useHoverConfig } from "@/hooks/useOrganic"

const hover = useHoverConfig("bird")
// hover.scale, hover.duration, hover.glowIntensity
```

### Generate Unique Backgrounds
```tsx
import { generateOrganicBackground } from "@/lib/organic"

const bg1 = generateOrganicBackground("dog", Date.now())
const bg2 = generateOrganicBackground("dog", Date.now() + 1000)
```

---

## What You Get

| Feature | What It Does |
|---------|-------------|
| **Personalities** | 4 distinct visual characters (cat, dog, bird, other) |
| **Backgrounds** | Procedural organic SVG backgrounds per animal |
| **Animations** | float, pulse, drift, breathe effects with personality |
| **Colors** | Pre-selected palettes that work together |
| **Transitions** | Smooth page changes matching animal energy |
| **Components** | Ready-to-use React components |
| **Hooks** | Access everything from your own components |
| **Performance** | Cached, CSS-based, 60fps animations |

---

## File Reference

**Core System:**
- `lib/organic/index.ts` - Main export point
- `lib/organic/personalities.ts` - Animal characters
- `lib/organic/background-generator.ts` - Background creation
- `lib/organic/animations.ts` - Motion definitions

**React:**
- `components/organic/` - All UI components
- `hooks/useOrganic.ts` - All custom hooks

**Utilities:**
- `lib/organic/css-utils.ts` - CSS generation
- `lib/organic/types.ts` - TypeScript definitions

**Docs:**
- `docs/ORGANIC_DESIGN_SYSTEM.md` - Full guide
- `docs/ORGANIC_USAGE_EXAMPLES.ts` - Code examples

---

## No-Config Usage

Everything is **ready to use immediately**. Just import and go.

```tsx
// That's it. Really.
import { OrganicLayout, OrganicCard } from "@/components/organic"
import { useColorPalette } from "@/hooks/useOrganic"
```

---

**Questions?** Check the examples or read the full guide.
