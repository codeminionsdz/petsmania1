export function formatPrice(amount: number, currency = "DZD"): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Invalid date"
  
  try {
    const dateObj = new Date(date)
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }
    
    return new Intl.DateTimeFormat("fr-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", date, error)
    return "Invalid date"
  }
}

export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}
