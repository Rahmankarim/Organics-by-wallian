import { type NextRequest, NextResponse } from "next/server"
import dbConnect, { Product } from '@/lib/mongoose'

function normalizeImagePath(img: string | undefined) {
  if (!img) return '/placeholder.svg'
  if (/^https?:\/\//.test(img)) return img
  const stripped = img.replace(/^\/public/, '')
  return stripped.startsWith('/') ? stripped : `/${stripped}`
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    }

    let product: any = null

    if (/^\d+$/.test(id)) {
      product = await Product.findOne({ id: Number(id), isActive: { $ne: false } }).lean()
    }

    if (!product) {
      product = await Product.findOne({ $or: [{ _id: id }, { slug: id }], isActive: { $ne: false } }).lean()
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const images = Array.isArray(product.images)
      ? product.images.map((img: string) => (typeof img === 'string' ? normalizeImagePath(img) : '/placeholder.svg'))
      : []

    const reviewCount = product.reviewCount ?? product.reviews ?? 0

    // reuse normalization shape from list endpoint but inline here
    const shortDescription = product.shortDescription ?? (product.description ? String(product.description).slice(0, 140) : '')
    const weight = product.weight ?? (product.variants && product.variants[0] && product.variants[0].value) ?? ''

    let nutritionFacts = product.nutritionFacts
    if (!nutritionFacts && product.nutritionPer100g) {
      const np = product.nutritionPer100g
      nutritionFacts = {
        calories: String(np.calories ?? ''),
        protein: String(np.protein ?? ''),
        fat: String(np.fat ?? ''),
        carbs: String(np.carbs ?? ''),
        fiber: String(np.fiber ?? ''),
        vitaminE: String(np.vitaminE ?? ''),
        serving: String(np.serving ?? ''),
      }
    }

    const normalized = {
      id: product.id ?? (product._id ? String(product._id) : undefined),
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice ?? product.price,
      images,
      rating: product.rating ?? 0,
      reviewCount,
      reviews: reviewCount,
      badge: product.badge ?? (product.tags && product.tags.includes('bestseller') ? 'Bestseller' : undefined),
      category: product.category,
      shortDescription,
      inStock: product.inStock ?? (product.stockCount ? product.stockCount > 0 : true),
      stockCount: product.stockCount ?? 0,
      weight,
      features: product.features ?? [],
      benefits: product.benefits ?? [],
      nutritionFacts: nutritionFacts ?? {},
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      description: product.description,
    }

    const relatedProductsRaw = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: { $ne: false } }).limit(4).lean()

    const relatedProducts = (relatedProductsRaw || []).map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images.map((img: string) => (typeof img === 'string' ? normalizeImagePath(img) : '/placeholder.svg')) : [],
      reviewCount: p.reviewCount ?? p.reviews ?? 0,
      reviews: p.reviewCount ?? p.reviews ?? 0,
    }))

    return NextResponse.json({ product: normalized, relatedProducts })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
