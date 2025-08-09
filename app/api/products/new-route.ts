import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Product, Category, Analytics } from '@/lib/mongoose'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')
    const rating = searchParams.get('rating')
    const tags = searchParams.get('tags')

    // Build query
    const query: any = {}
    
    if (category) query.category = category
    if (subcategory) query.subcategory = subcategory
    if (inStock === 'true') query.inStock = true
    if (rating) query.rating = { $gte: parseFloat(rating) }
    if (tags) query.tags = { $in: tags.split(',') }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    // Text search
    if (search) {
      query.$text = { $search: search }
    }

    // Calculate skip
    const skip = (page - 1) * limit

    // Sort options
    const sortOptions: any = {}
    if (search) {
      sortOptions.score = { $meta: 'textScore' }
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    // Execute query
    const [products, totalProducts, categories] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean()
    ])

    const totalPages = Math.ceil(totalProducts / limit)

    // Track search analytics
    if (search) {
      await Analytics.create({
        type: 'search',
        sessionId: request.headers.get('x-session-id') || 'anonymous',
        data: {
          query: search,
          resultsCount: totalProducts,
          filters: { category, subcategory, minPrice, maxPrice, inStock, rating }
        }
      })
    }

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      categories,
      filters: {
        priceRange: await Product.aggregate([
          { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
        ]),
        availableCategories: await Product.distinct('category'),
        availableSubcategories: await Product.distinct('subcategory'),
        availableTags: await Product.distinct('tags')
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Check admin authorization
  const authError = await requireRole(['admin', 'super_admin'])(request)
  if (authError) return authError

  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      subcategory,
      tags,
      variants,
      weight,
      features,
      nutritionFacts,
      benefits,
      stockCount,
      metaTitle,
      metaDescription
    } = body

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Get next product ID
    const lastProduct = await Product.findOne().sort({ id: -1 })
    const nextId = lastProduct ? lastProduct.id + 1 : 1

    const product = await Product.create({
      id: nextId,
      name,
      slug: `${slug}-${nextId}`,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      subcategory,
      tags: tags || [],
      variants: variants || [],
      weight,
      features: features || [],
      nutritionFacts,
      benefits: benefits || [],
      stockCount,
      inStock: stockCount > 0,
      metaTitle,
      metaDescription
    })

    return NextResponse.json(
      { product, message: 'Product created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
