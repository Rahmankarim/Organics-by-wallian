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

    const order = await db.collection("orders").findOne({ orderNumber: params.id })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updateData = await request.json()
    const { status, trackingNumber, shippingProvider } = updateData

    const updateFields: any = {
      updatedAt: new Date()
    }
    if (status) updateFields.status = status
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber
    if (shippingProvider !== undefined) updateFields.shippingProvider = shippingProvider

    const result = await db.collection("orders").updateOne(
      { orderNumber: params.id }, 
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" })
  } catch (error) {
    console.error("Admin order update error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
