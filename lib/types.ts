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
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  stock: number
  sku: string
  featured: boolean
  tags: string[]
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
  parentName?: string
  parentSlug?: string
  productCount: number
  children?: Category[]
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  productCount: number
  featured: boolean
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
  categories?: string[]
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
