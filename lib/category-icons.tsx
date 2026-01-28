import {
  Sparkles,
  Scissors,
  Heart,
  Hand,
  ShowerHead,
  Baby,
  Leaf,
  Sun,
  Stethoscope,
  Footprints,
  type LucideIcon,
} from "lucide-react"

// Fallback icon
const DefaultCategoryIcon: LucideIcon = Sparkles

export const categoryIcons: Record<string, LucideIcon> = {
  visage: Sparkles,
  cheveux: Scissors,
  corps: Heart,
  "mains-et-pieds": Hand,
  hygiene: ShowerHead,
  "maman-et-bebe": Baby,
  "sante-et-bien-etre": Leaf,
  solaires: Sun,
  "materiel-medical": Stethoscope,
  orthopedie: Footprints,
}

/**
 * Get icon for category - returns default icon if not found
 */
export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIcons[slug] || DefaultCategoryIcon
}
