import mongoose from 'mongoose'

// Enhanced Product Interface with variants and SEO
export interface IProduct {
  _id?: string
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  subcategory?: string
  tags: string[]
  variants: ProductVariant[]
  rating: number
  reviewCount: number
  badge?: string
  inStock: boolean
  stockCount: number
  weight: string
  features: string[]
  nutritionFacts: NutritionFacts
  benefits: string[]
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  name: string
  type: 'size' | 'weight' | 'pack'
  value: string
  price: number
  stockCount: number
  sku: string
}

export interface NutritionFacts {
  calories: string
  protein: string
  fat: string
  carbs: string
  fiber: string
  vitaminE: string
  serving: string
}

// Enhanced User Interface with roles and preferences
export interface IUser {
  _id?: string
  email: string
  password?: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'customer' | 'admin' | 'super_admin'
  isEmailVerified: boolean
  emailVerificationToken?: string
  emailVerificationCode?: string
  emailVerificationCodeExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  addresses: Address[]
  preferences: UserPreferences
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  newsletter: boolean
  smsNotifications: boolean
  language: string
  currency: string
  dietaryRestrictions: string[]
}

export interface Address {
  _id?: string
  type: 'home' | 'office' | 'other'
  firstName: string
  lastName: string
  company?: string
  address: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

// Enhanced Cart Interface
export interface ICartItem {
  _id?: string
  userId: string
  productId: number
  variantId?: string
  quantity: number
  price: number
  addedAt: Date
}

// Enhanced Order Interface with payment and shipping details
export interface IOrder {
  _id?: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  paymentIntentId?: string
  shippingAddress: Address
  billingAddress?: Address
  trackingNumber?: string
  shippingProvider?: string
  estimatedDelivery?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: number
  variantId?: string
  name: string
  price: number
  quantity: number
  image: string
  sku?: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

// Coupon/Discount System
export interface ICoupon {
  _id?: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumOrder?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: Date
  validTo: Date
  isActive: boolean
  applicableProducts?: number[]
  applicableCategories?: string[]
  createdAt: Date
}

// Review System
export interface IReview {
  _id?: string
  userId: string
  productId: number
  rating: number
  title: string
  content: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: Date
}

// Wishlist
export interface IWishlist {
  _id?: string
  userId: string
  products: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  productId: number
  addedAt: Date
}

// Enhanced Blog Post
export interface IBlogPost {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: string
  category: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
  publishedAt?: Date
  readTime: number
  createdAt: Date
  updatedAt: Date
}

// Analytics and Tracking
export interface IAnalytics {
  _id?: string
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search'
  userId?: string
  sessionId: string
  data: Record<string, any>
  timestamp: Date
}

// Newsletter Subscription
export interface INewsletter {
  _id?: string
  email: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
}

// Category Management
export interface ICategory {
  _id?: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
}

// Contact Messages
export interface IContactMessage {
  _id?: string
  name: string
  email: string
  phone?: string
  subject: string
  category: string
  message: string
  status: 'new' | 'read' | 'replied' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}
