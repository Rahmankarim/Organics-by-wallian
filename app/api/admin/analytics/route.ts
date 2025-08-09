import { NextRequest, NextResponse } from 'next/server'

// Route segment config to prevent static analysis during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
        recentOrders: [],
        lowStockProducts: [],
        orderStatusBreakdown: {}
      })
    }

    // Import MongoDB client only when needed
    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI!

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db('OrganicsByWalian')

    // Calculate totals
    const totalOrders = await db.collection('orders').countDocuments()
    const totalProducts = await db.collection('products').countDocuments()
    const totalUsers = await db.collection('users').countDocuments()

    // Calculate total revenue
    const revenueResult = await db.collection('orders').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]).toArray()
    
    const totalRevenue = revenueResult[0]?.total || 0

    // Get recent orders
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get low stock products
    const lowStockProducts = await db.collection('products')
      .find({ stock: { $lt: 20 } })
      .sort({ stock: 1 })
      .limit(10)
      .toArray()

    // Order status breakdown
    const statusBreakdown = await db.collection('orders').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const orderStatusBreakdown: Record<string, number> = {}
    statusBreakdown.forEach(item => {
      orderStatusBreakdown[item._id] = item.count
    })

    await client.close()

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      orderStatusBreakdown
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
