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

    const query: any = {}

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    // Get users (customers)
    const users = await db.collection("users")
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()

    const total = await db.collection("users").countDocuments(query)

    // For each user, get their order statistics
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await db.collection("orders").aggregate([
          { $match: { userId: user._id.toString() } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: "$total" }
            }
          }
        ]).toArray()

        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 }

        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || 'N/A',
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          joinedAt: user.createdAt,
          status: stats.totalOrders > 0 ? 'active' : 'inactive',
          isEmailVerified: user.isEmailVerified
        }
      })
    )

    // Calculate statistics
    const customerStats = {
      totalCustomers: total,
      activeCustomers: customersWithStats.filter(c => c.status === 'active').length,
      newCustomersThisMonth: await db.collection("users").countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      totalRevenue: customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0)
    }

    return NextResponse.json({
      customers: customersWithStats,
      stats: customerStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
