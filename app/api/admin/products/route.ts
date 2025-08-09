import { type NextRequest, NextResponse } from "next/server"
import type { IProduct } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search")
    const category = url.searchParams.get("category")
    const status = url.searchParams.get("status")

    const query: any = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (status === "in-stock") {
      query.inStock = true
    } else if (status === "out-of-stock") {
      query.inStock = false
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.collection("products").find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray(),
      db.collection("products").countDocuments(query),
    ])

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
    console.error("Admin products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')
    
    const body = await request.json()
    const client = await clientPromise
    const db = client.db("organic_orchard")

    // Get the next ID
    const lastProduct = await db.collection("products").findOne({}, { sort: { id: -1 } })
    const nextId = lastProduct ? lastProduct.id + 1 : 1

    // Prepare product data with minimal required fields
    const productData = {
      id: nextId,
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description,
      shortDescription: body.shortDescription || body.description?.substring(0, 150) + '...',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : Number(body.price),
      category: body.category,
      subcategory: body.subcategory,
      weight: body.weight,
      badge: body.badge || "New",
      inStock: body.inStock !== false,
      stockCount: Number(body.stockCount) || 0,
      rating: Number(body.rating) || 5,
      reviewCount: Number(body.reviewCount) || 0,
      images: body.images || [body.image || "/placeholder.jpg"],
      features: body.features || [],
      benefits: body.benefits || [],
      tags: body.tags || [],
      variants: body.variants || [],
      nutritionFacts: body.nutritionFacts || {
        calories: '0',
        protein: '0g',
        fat: '0g',
        carbs: '0g',
        fiber: '0g',
        vitaminE: '0mg',
        serving: '100g'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      nutritionFacts: body.nutritionFacts || {
        calories: "0 per 100g",
        protein: "0g",
        fat: "0g",
        carbs: "0g",
        fiber: "0g",
        vitaminE: "0mg",
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert the product
    const result = await db.collection("products").insertOne(productData)

    return NextResponse.json({
      message: "Product created successfully",
      product: { ...productData, _id: result.insertedId }
    })

  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
