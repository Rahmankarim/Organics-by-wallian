import mongoose from 'mongoose'
import {
  IProduct,
  IUser,
  IPendingUser,
  ICartItem,
  IOrder,
  ICoupon,
  IReview,
  IWishlist,
  IBlogPost,
  IAnalytics,
  INewsletter,
  ICategory,
  ProductVariant,
  NutritionFacts,
  UserPreferences,
  Address,
  OrderItem
} from './models'

// Database connection
const MONGODB_URI = process.env.MONGODB_URI

// Only check for MONGODB_URI at runtime, not during build
function checkMongoURI() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }
  return MONGODB_URI
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function dbConnect() {
  // Don't attempt connection during build if no MongoDB URI
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    throw new Error('MongoDB URI not configured for production')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const mongoUri = checkMongoURI() // Check URI only when actually connecting
    
    // Enhanced MongoDB connection options for Vercel serverless
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      // SSL/TLS configuration for MongoDB Atlas
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      // Additional connection settings
      retryWrites: true,
      w: 'majority',
      // Connection pool settings for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
    }

  // Remove 'w' property if present and ensure options match ConnectOptions
  const { w, ...restOpts } = opts as any;
  cached.promise = mongoose.connect(mongoUri, restOpts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Schemas
const ProductVariantSchema = new mongoose.Schema<ProductVariant>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['size', 'weight', 'pack'], required: true },
  value: { type: String, required: true },
  price: { type: Number, required: true },
  stockCount: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true }
})

const NutritionFactsSchema = new mongoose.Schema<NutritionFacts>({
  calories: { type: String, required: true },
  protein: { type: String, required: true },
  fat: { type: String, required: true },
  carbs: { type: String, required: true },
  fiber: { type: String, required: true },
  vitaminE: { type: String, required: true },
  serving: { type: String, required: true }
})

const ProductSchema = new mongoose.Schema<IProduct>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  subcategory: { type: String },
  tags: [{ type: String }],
  variants: [ProductVariantSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  badge: { type: String },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, required: true, default: 0 },
  weight: { type: String, required: true },
  features: [{ type: String }],
  nutritionFacts: { type: NutritionFactsSchema, required: true },
  benefits: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String }
}, {
  timestamps: true
})

ProductSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' })
ProductSchema.index({ category: 1, subcategory: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ rating: -1 })

const AddressSchema = new mongoose.Schema<Address>({
  type: { type: String, enum: ['home', 'office', 'other'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  address: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
})

const UserPreferencesSchema = new mongoose.Schema<UserPreferences>({
  newsletter: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'PKR' },
  dietaryRestrictions: [{ type: String }]
})

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['customer', 'admin', 'super_admin'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String }, // legacy, can be removed later
  emailVerificationCode: { type: String }, // 6-digit code
  emailVerificationCodeExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  addresses: [AddressSchema],
  preferences: { type: UserPreferencesSchema, default: {} },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  lastLogin: { type: Date }
}, {
  timestamps: true
})

// UserSchema.index({ email: 1 }) // Removed - email already has unique: true

const PendingUserSchema = new mongoose.Schema<IPendingUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true }, // This will be hashed
  verificationCode: { type: String, required: true }, // This will be hashed
  verificationCodeExpires: { type: Date, required: true, expires: 0 } // Auto-delete when expired
}, {
  timestamps: true
})

const CartItemSchema = new mongoose.Schema<ICartItem>({
  userId: { type: String, required: true },
  productId: { type: String, required: true }, // Changed from Number to String to store ObjectId
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now }
})

CartItemSchema.index({ userId: 1 })

const OrderItemSchema = new mongoose.Schema<OrderItem>({
  productId: { type: String, required: true }, // Changed from Number to String to store ObjectId
  variantId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  sku: { type: String }
})

const OrderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, required: true },
  paymentIntentId: { type: String },
  shippingAddress: { type: AddressSchema, required: true },
  billingAddress: { type: AddressSchema },
  trackingNumber: { type: String },
  shippingProvider: { type: String },
  estimatedDelivery: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
})

OrderSchema.index({ userId: 1 })
// OrderSchema.index({ orderNumber: 1 }) // Removed - orderNumber already has unique: true
OrderSchema.index({ status: 1 })

const CouponSchema = new mongoose.Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minimumOrder: { type: Number },
  maxDiscount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableProducts: [{ type: Number }],
  applicableCategories: [{ type: String }]
}, {
  timestamps: true
})

const ReviewSchema = new mongoose.Schema<IReview>({
  userId: { type: String, required: true },
  productId: { type: String, required: true }, // Changed from Number to String to store ObjectId
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 }
}, {
  timestamps: true
})

ReviewSchema.index({ productId: 1 })
ReviewSchema.index({ userId: 1 })

const WishlistSchema = new mongoose.Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  products: [{
    productId: { type: String, required: true }, // Changed from Number to String to store ObjectId
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

const BlogPostSchema = new mongoose.Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  featuredImage: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  readTime: { type: Number, required: true }
}, {
  timestamps: true
})

// BlogPostSchema.index({ slug: 1 }) // Removed - slug already has unique: true
BlogPostSchema.index({ category: 1 })
BlogPostSchema.index({ isPublished: 1 })

const AnalyticsSchema = new mongoose.Schema<IAnalytics>({
  type: {
    type: String,
    enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'],
    required: true
  },
  userId: { type: String },
  sessionId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
})

const NewsletterSchema = new mongoose.Schema<INewsletter>({
  email: { type: String, required: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date }
})

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parentId: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metaTitle: { type: String },
  metaDescription: { type: String }
}, {
  timestamps: true
})

// Models - only create if not in build environment
let Product: any, User: any, PendingUser: any, CartItem: any, Order: any, Coupon: any, Review: any, 
    Wishlist: any, BlogPost: any, Analytics: any, Newsletter: any, Category: any

// Function to initialize models safely
function initModels() {
  if (!Product) {
    Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
    User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
    PendingUser = mongoose.models.PendingUser || mongoose.model<IPendingUser>('PendingUser', PendingUserSchema)
    CartItem = mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema)
    Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
    Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
    Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
    Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema)
    BlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema)
    Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)
    Newsletter = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema)
    Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
  }
}

// Only initialize models at runtime, not during build
if (process.env.NODE_ENV !== 'production' || process.env.MONGODB_URI) {
  initModels()
}

export { Product, User, PendingUser, CartItem, Order, Coupon, Review, Wishlist, BlogPost, Analytics, Newsletter, Category }

export default dbConnect
