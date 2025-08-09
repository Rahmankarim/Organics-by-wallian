import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IContactMessage } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, category, message } = body

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("organic_orchard")

    // Create contact message object
    const contactMessage: Omit<IContactMessage, '_id'> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: 'new',
      priority: category === 'complaint' ? 'high' : 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to database
    const result = await db.collection("contact_messages").insertOne(contactMessage)

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
      id: result.insertedId
    })

  } catch (error) {
    console.error("Contact form submission error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    // Build query
    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }

    // Get messages with pagination
    const messages = await db
      .collection("contact_messages")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await db.collection("contact_messages").countDocuments(query)

    // Get statistics
    const stats = await db.collection("contact_messages").aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const statusCounts = {
      new: 0,
      read: 0,
      replied: 0,
      resolved: 0
    }

    stats.forEach(stat => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count
      }
    })

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusCounts
    })

  } catch (error) {
    console.error("Contact messages fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
