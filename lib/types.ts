export type AnimalType = "cat" | "dog" | "bird" | "other"

export interface Animal {
  id: string
  name: AnimalType
  slug: string
  displayName: string
  emoji?: string
  description?: string
  featured: boolean
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  // Mandatory: animal
  animalId: string
  animalName?: AnimalType
  animalDisplayName?: string
  animalEmoji?: string
  // Category hierarchy
  categoryId?: string | null
  categoryName?: string | null
  categorySlug?: string | null
  subcategoryId?: string | null
  subcategoryName?: string | null
  subcategorySlug?: string | null
  // Brand (optional)
  brandId?: string | null
  brandName?: string | null
  brandSlug?: string | null
  stock: number
  sku: string
  featured: boolean
  tags: string[]
  // Backward compatibility: old animalType field still supported
  animalType?: AnimalType | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  parentId?: string | null
  parent_id?: string | null
  parentName?: string
  parentSlug?: string
  level: number
  productCount: number
  product_count?: number
  children?: Category[]
  // Animal support
  animalType?: AnimalType | null
  animal_type?: AnimalType | null
  animalTypes?: AnimalType[]
  displayOrder: number
  display_order?: number
  isActive: boolean
  is_active?: boolean
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  category_id: string
  categoryId?: string // Alias for backward compatibility
  categoryName?: string
  animalType?: AnimalType | null
  animal_type?: AnimalType | null
  displayOrder: number
  display_order?: number
  isActive: boolean
  is_active?: boolean
  productCount?: number
  product_count?: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  productCount: number
  featured: boolean
  // Animal associations
  animalTypes?: AnimalType[]
}

export interface BrandAnimal {
  id: string
  brandId: string
  animalType: AnimalType
  isActive: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  paymentMethod: string
  promoCode?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  wilaya: string
  postalCode: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses: Address[]
  createdAt: string
}

export interface Wilaya {
  id: string
  name: string
  code: string
  shippingCost: number
  deliveryDays: number
  isActive: boolean
}

export interface PromoCode {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderAmount?: number
  maxUses?: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

export interface FilterOptions {
  // Hierarchical filters
  animalType?: AnimalType
  animalTypes?: AnimalType[]
  categories?: string[]
  subcategories?: string[]
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: "price-asc" | "price-desc" | "name" | "newest" | "popular"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
