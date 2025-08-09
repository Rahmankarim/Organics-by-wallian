import { type NextRequest, NextResponse } from "next/server"
// Dynamic import - will be loaded at runtime

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const productId = Number.parseInt(params.id)
    const product = await db.collection("products").findOne({ id: productId })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await db
      .collection("products")
      .find({
        category: product.category,
        id: { $ne: productId },
      })
      .limit(3)
      .toArray()

    return NextResponse.json({ product, relatedProducts })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
