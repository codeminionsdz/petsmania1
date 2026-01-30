/**
 * Centralized animal color system for consistent theming across the platform
 * Each animal has:
 * - Primary background gradient (used on cards, headers)
 * - Border color
 * - Text color
 * - Transition/overlay color (used for page transitions and loading states)
 */

export const ANIMAL_COLORS = {
  cat: {
    name: "Chats",
    emoji: "🐱",
    // Soft pink theme
    gradient: "from-rose-100 to-pink-100 dark:from-rose-950/20 dark:to-pink-950/20",
    border: "border-rose-200 dark:border-rose-800/30",
    text: "text-rose-900 dark:text-rose-100",
    accent: "rose",
    // Page transition and loading state color
    transitionOverlay: "rgba(244, 63, 94, 0.25)", // Rose with 25% opacity
    loadingSpinner: "from-rose-400 to-pink-400",
    loadingBg: "bg-rose-50 dark:bg-rose-950/10",
  },
  dog: {
    name: "Chiens",
    emoji: "🐕",
    // Warm orange/yellow theme
    gradient: "from-amber-100 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20",
    border: "border-amber-200 dark:border-amber-800/30",
    text: "text-amber-900 dark:text-amber-100",
    accent: "amber",
    // Page transition and loading state color
    transitionOverlay: "rgba(245, 158, 11, 0.25)", // Amber with 25% opacity
    loadingSpinner: "from-amber-400 to-orange-400",
    loadingBg: "bg-amber-50 dark:bg-amber-950/10",
  },
  bird: {
    name: "Oiseaux",
    emoji: "🐦",
    // Light sky blue theme
    gradient: "from-sky-100 to-blue-100 dark:from-sky-950/20 dark:to-blue-950/20",
    border: "border-sky-200 dark:border-sky-800/30",
    text: "text-sky-900 dark:text-sky-100",
    accent: "sky",
    // Page transition and loading state color
    transitionOverlay: "rgba(56, 189, 248, 0.25)", // Sky with 25% opacity
    loadingSpinner: "from-sky-400 to-blue-400",
    loadingBg: "bg-sky-50 dark:bg-sky-950/10",
  },
  other: {
    name: "Autres",
    emoji: "🐾",
    // Neutral purple/green theme
    gradient: "from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20",
    border: "border-violet-200 dark:border-violet-800/30",
    text: "text-violet-900 dark:text-violet-100",
    accent: "violet",
    // Page transition and loading state color
    transitionOverlay: "rgba(168, 85, 247, 0.25)", // Violet with 25% opacity
    loadingSpinner: "from-violet-400 to-purple-400",
    loadingBg: "bg-violet-50 dark:bg-violet-950/10",
  },
} as const;

export type AnimalType = keyof typeof ANIMAL_COLORS;

/**
 * Get color configuration for a specific animal
 */
export function getAnimalColors(animal: AnimalType) {
  return ANIMAL_COLORS[animal];
}

/**
 * Get transition overlay color for page transitions and loading states
 */
export function getTransitionColor(animal: AnimalType): string {
  return ANIMAL_COLORS[animal].transitionOverlay;
}

/**
 * Get loading spinner gradient for a specific animal
 */
export function getLoadingSpinnerGradient(animal: AnimalType): string {
  return ANIMAL_COLORS[animal].loadingSpinner;
}

/**
 * Get loading background color for a specific animal
 */
export function getLoadingBackground(animal: AnimalType): string {
  return ANIMAL_COLORS[animal].loadingBg;
}
