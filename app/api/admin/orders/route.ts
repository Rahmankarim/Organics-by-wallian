import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const status = url.searchParams.get("status")
    const dateFrom = url.searchParams.get("dateFrom")
    const dateTo = url.searchParams.get("dateTo")

    const query: any = {}

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      // Case-insensitive status match
      query.status = { $regex: new RegExp(`^${status}$`, 'i') }
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo)
      }
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      db.collection("orders").find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray(),
      db.collection("orders").countDocuments(query),
    ])

    // Calculate statistics from actual orders
    const stats = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            pendingOrders: {
              $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /^pending$/i } }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /^processing$/i } }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /^shipped$/i } }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /^delivered$/i } }, 1, 0] },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      orders,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
