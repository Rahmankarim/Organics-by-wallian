export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { type NextRequest, NextResponse } from "next/server"
import dbConnect, { Product } from '@/lib/mongoose'

// Normalize image path helper: strip leading /public and ensure leading slash; preserve absolute URLs
function normalizeImagePath(img: string | undefined) {
  if (!img) return '/placeholder.svg'
  // Skip base64 data URIs - they cause 404 errors
  if (img.startsWith('data:image')) return '/placeholder.svg'
  if (/^https?:\/\//.test(img)) return img
  const stripped = img.replace(/^\/public/, '')
  return stripped.startsWith('/') ? stripped : `/${stripped}`
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "12")
    const search = url.searchParams.get("search")
    const category = url.searchParams.get("category")
    const minPrice = url.searchParams.get("minPrice")
    const maxPrice = url.searchParams.get("maxPrice")
    const inStock = url.searchParams.get("inStock")
    const featured = url.searchParams.get("featured")

    const query: any = { isActive: { $ne: false } } // Only show active products

    // Featured filter - for homepage, just get products with high ratings or specific badges
    if (featured === "true") {
      query.$or = [
        { rating: { $gte: 4.5 } },
        { badge: { $in: ["Bestseller", "Premium", "Organic", "Limited Edition"] } }
      ]
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice)
    }

    // Stock filter
    if (inStock === "true") {
      query.inStock = true
    }

    const skip = (page - 1) * limit

    const [productsRaw, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(query),
    ])

    // Helper to normalize a single product object for frontend
    const normalizeProduct = (p: any) => {
      const images = Array.isArray(p.images)
        ? p.images.map((img: string) => (typeof img === 'string' ? normalizeImagePath(img) : '/placeholder.svg'))
        : []

      const reviewCount = p.reviewCount ?? p.reviews ?? 0

      const id = p.id ?? (p._id ? String(p._id) : undefined)

      // Map alternate/nested fields to the shape the frontend expects
      const shortDescription = p.shortDescription ?? (p.description ? String(p.description).slice(0, 140) : '')
      const weight = p.weight ?? (p.variants && p.variants[0] && p.variants[0].value) ?? ''

      // Normalize nutrition facts: prefer `nutritionFacts`, fallback to `nutritionPer100g`
      let nutritionFacts = p.nutritionFacts
      if (!nutritionFacts && p.nutritionPer100g) {
        const np = p.nutritionPer100g
        nutritionFacts = {
          calories: String(np.calories ?? np.calories_kcal ?? ''),
          protein: String(np.protein ?? ''),
          fat: String(np.fat ?? ''),
          carbs: String(np.carbs ?? ''),
          fiber: String(np.fiber ?? ''),
          vitaminE: String(np.vitaminE ?? ''),
          serving: String(np.serving ?? ''),
        }
      }

      return {
        id,
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice ?? p.price,
        images,
        rating: p.rating ?? 0,
        reviewCount,
        reviews: reviewCount,
        badge: p.badge ?? (p.tags && p.tags.includes('bestseller') ? 'Bestseller' : undefined),
        category: p.category,
        shortDescription,
        inStock: p.inStock ?? (p.stockCount ? p.stockCount > 0 : true),
        stockCount: p.stockCount ?? 0,
        weight,
        features: p.features ?? [],
        benefits: p.benefits ?? [],
        nutritionFacts: nutritionFacts ?? {},
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    }

    const products = (productsRaw || []).map((p: any) => normalizeProduct(p))

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
