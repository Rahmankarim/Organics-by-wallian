import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const productId = Number.parseInt(params.id)
    const product = await db.collection("products").findOne({ id: productId })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const productId = Number.parseInt(params.id)
    const updateData = await request.json()

    const updatedProduct = {
      name: updateData.name,
      price: Number(updateData.price),
      originalPrice: Number(updateData.originalPrice),
      images: updateData.images,
      rating: Number(updateData.rating),
      reviews: Number(updateData.reviews),
      badge: updateData.badge,
      category: updateData.category,
      inStock: updateData.inStock,
      stockCount: Number(updateData.stockCount),
      weight: updateData.weight,
      description: updateData.description,
      features: updateData.features,
      nutritionFacts: updateData.nutritionFacts,
      benefits: updateData.benefits,
      updatedAt: new Date(),
    }

    const result = await db.collection("products").updateOne({ id: productId }, { $set: updatedProduct })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const productId = Number.parseInt(params.id)
    const result = await db.collection("products").deleteOne({ id: productId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin product delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
