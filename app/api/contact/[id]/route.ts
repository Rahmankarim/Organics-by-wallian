import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, priority, adminNotes } = body

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("organic_orchard")

    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const result = await db.collection("contact_messages").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Message updated successfully" })

  } catch (error) {
    console.error("Contact message update error:", error)
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("organic_orchard")

    const result = await db.collection("contact_messages").deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Message deleted successfully" })

  } catch (error) {
    console.error("Contact message delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    )
  }
}
