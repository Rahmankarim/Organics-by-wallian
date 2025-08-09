import { type NextRequest, NextResponse } from "next/server"
// Dynamic import - will be loaded at runtime
import type { IBlogPost } from "@/lib/models"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Find the specific blog post by slug
    const post = await db.collection("blog").findOne({ slug: params.slug })

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    // Get related posts from the same category
    const relatedPosts = await db
      .collection("blog")
      .find({ 
        category: post.category, 
        slug: { $ne: params.slug } 
      })
      .limit(3)
      .toArray()

    return NextResponse.json({ 
      post: {
        ...post,
        _id: post._id.toString()
      },
      relatedPosts: relatedPosts.map(p => ({
        ...p,
        _id: p._id.toString()
      }))
    })
  } catch (error) {
    console.error("Blog post fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}
