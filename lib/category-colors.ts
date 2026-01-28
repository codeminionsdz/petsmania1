// Auto-generate category colors based on category slug
// Uses a hash function to consistently assign colors to categories

// Vibrant medical-themed color palette (with enough colors for all categories)
const LIGHT_COLOR_PALETTES = [
  // 1. Teal & Cyan
  { bg: 'bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700' },
  // 2. Purple & Pink
  { bg: 'bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-700' },
  // 3. Emerald & Green
  { bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700' },
  // 4. Orange & Amber
  { bg: 'bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700' },
  // 5. Pink & Rose
  { bg: 'bg-gradient-to-br from-pink-500 via-rose-600 to-red-700' },
  // 6. Blue & Indigo
  { bg: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700' },
  // 7. Lime & Green
  { bg: 'bg-gradient-to-br from-lime-500 via-green-600 to-emerald-700' },
  // 8. Sky & Blue
  { bg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-700' },
  // 9. Fuchsia & Purple
  { bg: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700' },
  // 10. Amber & Orange
  { bg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700' },
  // 11. Cyan & Teal
  { bg: 'bg-gradient-to-br from-cyan-500 via-teal-600 to-emerald-700' },
  // 12. Violet & Purple
  { bg: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700' },
  // 13. Red & Rose
  { bg: 'bg-gradient-to-br from-red-500 via-pink-600 to-rose-700' },
  // 14. Green & Teal
  { bg: 'bg-gradient-to-br from-green-500 via-teal-600 to-blue-700' },
  // 15. Indigo & Blue
  { bg: 'bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-700' },
  // 16. Yellow & Orange
  { bg: 'bg-gradient-to-br from-yellow-500 via-orange-600 to-red-700' },
  // 17. Rose & Pink
  { bg: 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700' },
  // 18. Slate & Gray
  { bg: 'bg-gradient-to-br from-slate-500 via-slate-600 to-gray-700' },
  // 19. Teal Light
  { bg: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700' },
  // 20. Purple Light
  { bg: 'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700' },
  // 21. Orange Warm
  { bg: 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-700' },
  // 22. Green Fresh
  { bg: 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700' },
  // 23. Blue Deep
  { bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700' },
  // 24. Pink Vibrant
  { bg: 'bg-gradient-to-br from-pink-600 via-rose-600 to-red-700' },
];

/**
 * Simple hash function to convert string to number
 * Always returns the same number for the same string
 * Ensures it never returns 0 to avoid issues with index calculation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure hash is always positive and at least 1
  const absHash = Math.abs(hash);
  return absHash === 0 ? 1 : absHash;
}

/**
 * Get gradient colors for a category based on its slug
 * Automatically assigns consistent colors for each category
 */
export function getCategoryGradient(categorySlug: string): string {
  // Use hash to pick a color palette
  const hash = hashString(categorySlug);
  const paletteIndex = hash % LIGHT_COLOR_PALETTES.length;
  const palette = LIGHT_COLOR_PALETTES[paletteIndex];
  
  return palette.bg;
}

/**
 * Get individual colors for more granular control
 */
export function getCategoryColors(categorySlug: string) {
  const hash = hashString(categorySlug);
  const paletteIndex = hash % LIGHT_COLOR_PALETTES.length;
  return LIGHT_COLOR_PALETTES[paletteIndex];
}
