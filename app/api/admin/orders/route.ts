import { type NextRequest, NextResponse } from "next/server"
import type { IOrder } from "@/lib/models"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Sample orders data for initialization
const sampleOrders: IOrder[] = [
  {
    id: "ORD-001",
    userId: "demo-user",
    items: [
      {
        productId: 1,
        name: "Premium Kashmiri Almonds",
        price: 899,
        quantity: 2,
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        productId: 2,
        name: "Royal Pistachios",
        price: 1299,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    total: 3097,
    status: "Delivered",
    deliveryAddress: {
      id: "1",
      type: "Home",
      name: "Priya Sharma",
      address: "123 Green Valley Apartments, Sector 15, Mumbai, Maharashtra 400001",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    paymentMethod: "Credit Card",
    trackingNumber: "TRK123456789",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "ORD-002",
    userId: "demo-user-2",
    items: [
      {
        productId: 3,
        name: "Organic Dates Medley",
        price: 649,
        quantity: 3,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    total: 1947,
    status: "Shipped",
    deliveryAddress: {
      id: "2",
      type: "Office",
      name: "Rajesh Kumar",
      address: "456 Business Park, Andheri East, Mumbai, Maharashtra 400069",
      phone: "+91 98765 43211",
      isDefault: false,
    },
    paymentMethod: "UPI",
    trackingNumber: "TRK987654321",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "ORD-003",
    userId: "demo-user-3",
    items: [
      {
        productId: 5,
        name: "Premium Cashews",
        price: 799,
        quantity: 2,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    total: 1598,
    status: "Processing",
    deliveryAddress: {
      id: "3",
      type: "Home",
      name: "Anita Patel",
      address: "789 Residential Complex, Bandra West, Mumbai, Maharashtra 400050",
      phone: "+91 98765 43212",
      isDefault: true,
    },
    paymentMethod: "Credit Card",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "ORD-004",
    userId: "demo-user-4",
    items: [
      {
        productId: 4,
        name: "Himalayan Walnuts",
        price: 1099,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        productId: 6,
        name: "Mixed Dry Fruits Gift Box",
        price: 1899,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    total: 2998,
    status: "Pending",
    deliveryAddress: {
      id: "4",
      type: "Home",
      name: "Vikram Singh",
      address: "321 Garden View, Powai, Mumbai, Maharashtra 400076",
      phone: "+91 98765 43213",
      isDefault: true,
    },
    paymentMethod: "UPI",
    createdAt: new Date("2024-01-03"),
  },
]

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

    // Initialize with sample data if empty
    const count = await db.collection("orders").countDocuments()
    if (count === 0) {
      await db.collection("orders").insertMany(sampleOrders)
    }

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
        { id: { $regex: search, $options: "i" } },
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
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

    // Calculate statistics
    const stats = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Processing"] }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Shipped"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
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
