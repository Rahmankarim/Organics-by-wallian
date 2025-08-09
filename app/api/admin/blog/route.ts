import { type NextRequest, NextResponse } from "next/server"
// Dynamic import - will be loaded at runtime
import type { IBlogPost } from "@/lib/models"

// Admin route to manage blog posts
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
    const { action, blogPost } = await request.json()
    const client = await clientPromise
    const db = client.db("organic_orchard")

    switch (action) {
      case "create":
        const result = await db.collection("blog").insertOne(blogPost)
        return NextResponse.json({ success: true, id: result.insertedId })

      case "update":
        const { _id, ...updateData } = blogPost
        await db.collection("blog").updateOne(
          { _id: _id },
          { $set: { ...updateData, updatedAt: new Date() } }
        )
        return NextResponse.json({ success: true })

      case "delete":
        await db.collection("blog").deleteOne({ _id: blogPost._id })
        return NextResponse.json({ success: true })

      case "refresh":
        // Clear all and re-seed with sample data
        await db.collection("blog").deleteMany({})
        const sampleBlogPosts: IBlogPost[] = [
          // Add your updated sample posts here
        ]
        await db.collection("blog").insertMany(sampleBlogPosts as any)
        return NextResponse.json({ success: true, message: "Blog posts refreshed" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin blog error:", error)
    return NextResponse.json({ error: "Failed to manage blog posts" }, { status: 500 })
  }
}

// Get all blog posts for admin management
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

    const posts = await db.collection("blog").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Admin blog fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
