import { type NextRequest, NextResponse } from "next/server"

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
    const limit = Number.parseInt(url.searchParams.get("limit") || "12")
    const search = url.searchParams.get("search")
    const category = url.searchParams.get("category")
    const minPrice = url.searchParams.get("minPrice")
    const maxPrice = url.searchParams.get("maxPrice")
    const inStock = url.searchParams.get("inStock")

    const query: any = { isActive: { $ne: false } } // Only show active products

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
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
