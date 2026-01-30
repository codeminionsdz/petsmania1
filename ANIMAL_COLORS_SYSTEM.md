# Animal-Specific Transition Colors

## Overview
Each animal type has a unique color palette used consistently across the platform for page transitions, loading states, and visual feedback. This creates a cohesive, premium user experience with instant visual association.

## Color Assignments

### Cats 🐱 - Soft Pink
- **Primary Color**: Rose (`rgba(244, 63, 94, 0.25)`)
- **Hex**: `#F43F5E`
- **Usage**: 
  - Page transition overlay when selecting cats
  - Loading spinner color
  - Loading state background
  - Brand color for cat-related content
- **Tailwind Classes**: `text-rose-900`, `border-rose-200`, `from-rose-100 to-pink-100`

### Dogs 🐕 - Warm Orange/Yellow
- **Primary Color**: Amber (`rgba(245, 158, 11, 0.25)`)
- **Hex**: `#F59E0B`
- **Usage**: 
  - Page transition overlay when selecting dogs
  - Loading spinner color
  - Loading state background
  - Brand color for dog-related content
- **Tailwind Classes**: `text-amber-900`, `border-amber-200`, `from-amber-100 to-orange-100`

### Birds 🐦 - Light Sky Blue
- **Primary Color**: Sky (`rgba(56, 189, 248, 0.25)`)
- **Hex**: `#38BDF8`
- **Usage**: 
  - Page transition overlay when selecting birds
  - Loading spinner color
  - Loading state background
  - Brand color for bird-related content
- **Tailwind Classes**: `text-sky-900`, `border-sky-200`, `from-sky-100 to-blue-100`

### Others 🐾 - Neutral Purple
- **Primary Color**: Violet (`rgba(168, 85, 247, 0.25)`)
- **Hex**: `#A855F7`
- **Usage**: 
  - Page transition overlay when selecting other animals
  - Loading spinner color
  - Loading state background
  - Brand color for other animals content
- **Tailwind Classes**: `text-violet-900`, `border-violet-200`, `from-violet-100 to-purple-100`

## Implementation

### Centralized Color Configuration
All colors are defined in [lib/animal-colors.ts](lib/animal-colors.ts) for easy maintenance and consistency.

```typescript
import { ANIMAL_COLORS, getAnimalColors, getTransitionColor } from '@/lib/animal-colors'

// Get all colors for an animal
const catColors = getAnimalColors('cat')

// Get specific color for transitions
const catTransitionColor = getTransitionColor('cat')

// Get loading spinner gradient
const catSpinnerGradient = getLoadingSpinnerGradient('cat')

// Get loading background
const catLoadingBg = getLoadingBackground('cat')
```

### Page Transitions
When a user clicks an animal card on the home page:
1. **Fade-out**: Current view fades and scales down (0.4s)
2. **Color Overlay**: Animal-specific color appears (0.2s)
3. **Navigation**: Router navigates to the animal's page (after 400ms)

### Loading States
When filtering products or loading content on animal pages:
1. **Overlay appears** with the animal's transition color
2. **Spinner animates** in the animal's color
3. **Visual continuity** maintains the theme throughout the loading period

## Components Using These Colors

### Home Page
- **animal-categories-section.tsx**: Uses transition colors when clicking animal cards

### Animal Pages
- **animal-page-content.tsx**: Uses animal color for loading overlay and spinner

### Loading Components
- **loading.tsx**: `LoadingSpinner` accepts optional animal type to color the spinner

## Usage Examples

### In Home Page Component
```tsx
import { ANIMAL_COLORS } from '@/lib/animal-colors'

const overlayColor = ANIMAL_COLORS.cat.transitionOverlay
// Usage: style={{ backgroundColor: overlayColor }}
```

### In Animal Page Component
```tsx
import { getAnimalColors } from '@/lib/animal-colors'

const colors = getAnimalColors('dog')
// Access: colors.transitionOverlay, colors.loadingSpinner, colors.loadingBg
```

### In Loading Component
```tsx
import { LoadingSpinner } from '@/components/layout/loading'

<LoadingSpinner animal="bird" /> // Bird-colored spinner
```

## Design Principles

1. **Consistency**: Same color always represents the same animal
2. **Contrast**: Each color is distinct and recognizable at a glance
3. **Accessibility**: All colors meet WCAG contrast ratios for readability
4. **Premium Feel**: Soft, semi-transparent overlays (25% opacity) create elegance
5. **Usability**: Users can instantly identify which animal section they're in

## Modifying Colors

To adjust a color, edit [lib/animal-colors.ts](lib/animal-colors.ts):

```typescript
cat: {
  // ... other properties
  transitionOverlay: "rgba(244, 63, 94, 0.25)", // Modify RGBA values here
  loadingSpinner: "from-rose-400 to-pink-400", // Modify gradient classes
  loadingBg: "bg-rose-50 dark:bg-rose-950/10", // Modify background classes
}
```

All components automatically inherit the updated colors through the centralized system.

## Testing the Colors

1. **Home Page**: Click each animal card to see the unique transition color
2. **Animal Pages**: Trigger a filter action to see the loading overlay in the animal's color
3. **Loading States**: Check that spinners match the animal's theme
4. **Dark Mode**: Verify colors are visible in both light and dark modes
