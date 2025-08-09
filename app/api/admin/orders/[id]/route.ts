import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const order = await db.collection("orders").findOne({ id: params.id })

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
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const updateData = await request.json()
    const { status, trackingNumber } = updateData

    const updateFields: any = {}
    if (status) updateFields.status = status
    if (trackingNumber) updateFields.trackingNumber = trackingNumber

    const result = await db.collection("orders").updateOne({ id: params.id }, { $set: updateFields })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin order update error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
