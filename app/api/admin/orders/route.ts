import { type NextRequest, NextResponse } from "next/server"
import type { IOrder } from "@/lib/models"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Sample orders data for initialization
const sampleOrders: IOrder[] = [
  {
    orderNumber: "ORD-001",
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
    subtotal: 2197,
    tax: 100,
    shippingCost: 50,
    discount: 0,
    total: 3097,
    status: "delivered",
    paymentStatus: "succeeded",
    paymentMethod: "Credit Card",
    paymentIntentId: "pi_1234567890",
    shippingAddress: {
      type: 'home',
      firstName: 'Rahman',
      lastName: 'Karim',
      address: '123 Main St',
      city: 'Mumbai',
      state: 'MH',
      zipCode: '400001',
      country: 'India',
      phone: '+911234567890',
      isDefault: true
    },
    trackingNumber: "TRK123456789",
    shippingProvider: "DHL",
    estimatedDelivery: new Date("2024-01-20"),
    notes: "",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    orderNumber: "ORD-002",
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
    subtotal: 1647,
    tax: 100,
    shippingCost: 50,
    discount: 0,
    total: 1947,
    status: "shipped",
    paymentStatus: "succeeded",
    paymentMethod: "UPI",
    paymentIntentId: "pi_9876543210",
    shippingAddress: {
      type: 'home',
      firstName: 'Ali',
      lastName: 'Khan',
      address: '456 Market Rd',
      city: 'Delhi',
      state: 'DL',
      zipCode: '110001',
      country: 'India',
      phone: '+919876543210',
      isDefault: true
    },
    trackingNumber: "TRK987654321",
    shippingProvider: "FedEx",
    estimatedDelivery: new Date("2024-01-15"),
    notes: "",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    orderNumber: "ORD-003",
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
    subtotal: 1398,
    tax: 100,
    shippingCost: 50,
    discount: 0,
    total: 1598,
    status: "processing",
    paymentStatus: "pending",
    paymentMethod: "Credit Card",
    paymentIntentId: "pi_5555555555",
    shippingAddress: {
      type: 'home',
      firstName: 'Sara',
      lastName: 'Ahmed',
      address: '789 Park Ave',
      city: 'Bangalore',
      state: 'KA',
      zipCode: '560001',
      country: 'India',
      phone: '+911122334455',
      isDefault: true
    },
    trackingNumber: "TRK555555555",
    shippingProvider: "BlueDart",
    estimatedDelivery: new Date("2024-01-10"),
    notes: "",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
  {
    orderNumber: "ORD-004",
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
    subtotal: 2848,
    tax: 100,
    shippingCost: 50,
    discount: 0,
    total: 2998,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "UPI",
    paymentIntentId: "pi_4444444444",
    shippingAddress: {
      type: 'home',
      firstName: 'Fatima',
      lastName: 'Noor',
      address: '321 Lake View',
      city: 'Hyderabad',
      state: 'TS',
      zipCode: '500001',
      country: 'India',
      phone: '+919876543219',
      isDefault: true
    },
    trackingNumber: "TRK444444444",
    shippingProvider: "IndiaPost",
    estimatedDelivery: new Date("2024-01-08"),
    notes: "",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
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
      // Remove _id if it's a string to let MongoDB generate ObjectId
      const fixedOrders = sampleOrders.map(order => {
        if (order._id && typeof order._id === 'string') {
          const { _id, ...rest } = order;
          return rest;
        }
        return order;
      });
      await db.collection("orders").insertMany(fixedOrders)
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
