import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Order, Product, User, Analytics } from '@/lib/mongoose'
import { getUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') // revenue, orders, users, products

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Build comprehensive analytics
    const analytics: any = {}

    // Revenue Analytics
    if (!type || type === 'revenue') {
      const revenueData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $nin: ['cancelled', 'refunded'] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])

      const totalRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $nin: ['cancelled', 'refunded'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
            average: { $avg: '$totalAmount' }
          }
        }
      ])

      analytics.revenue = {
        timeline: revenueData,
        summary: totalRevenue[0] || { total: 0, count: 0, average: 0 }
      }
    }

    // Orders Analytics
    if (!type || type === 'orders') {
      const orderStats = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' }
          }
        }
      ])

      const orderTimeline = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            processing: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
            },
            shipped: {
              $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
            },
            delivered: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])

      analytics.orders = {
        statusBreakdown: orderStats,
        timeline: orderTimeline
      }
    }

    // Users Analytics
    if (!type || type === 'users') {
      const userStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])

      const newUsers = await User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])

      const totalUsers = await User.countDocuments()
      const activeUsers = await User.countDocuments({ 
        lastLoginAt: { $gte: startDate } 
      })

      analytics.users = {
        total: totalUsers,
        active: activeUsers,
        roleBreakdown: userStats,
        registrationTimeline: newUsers
      }
    }

    // Products Analytics
    if (!type || type === 'products') {
      const topProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $nin: ['cancelled', 'refunded'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ])

      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stockCount' },
            averagePrice: { $avg: '$price' }
          }
        }
      ])

      const lowStockProducts = await Product.find({
        $or: [
          { stockCount: { $lte: 10 } },
          { inStock: false }
        ]
      }).select('name stockCount inStock category price').limit(20)

      analytics.products = {
        topSelling: topProducts,
        categoryBreakdown: categoryStats,
        lowStock: lowStockProducts
      }
    }

    // Website Analytics (from Analytics collection)
    if (!type || type === 'website') {
      const websiteStats = await Analytics.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])

      const pageViews = await Analytics.aggregate([
        {
          $match: {
            type: 'page_view',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$data.page',
            views: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            page: '$_id',
            views: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ])

      analytics.website = {
        eventBreakdown: websiteStats,
        topPages: pageViews
      }
    }

    // Performance Metrics
    const performanceMetrics = {
      conversionRate: 0,
      averageOrderValue: 0,
      customerLifetimeValue: 0,
      cartAbandonmentRate: 0
    }

    // Calculate conversion rate (orders / unique visitors)
    const uniqueVisitors = await Analytics.distinct('sessionId', {
      timestamp: { $gte: startDate },
      type: 'page_view'
    })

    const ordersCount = await Order.countDocuments({
      createdAt: { $gte: startDate },
      status: { $nin: ['cancelled', 'refunded'] }
    })

    if (uniqueVisitors.length > 0) {
      performanceMetrics.conversionRate = (ordersCount / uniqueVisitors.length) * 100
    }

    // Calculate average order value
    const avgOrderValue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$totalAmount' }
        }
      }
    ])

    if (avgOrderValue.length > 0) {
      performanceMetrics.averageOrderValue = avgOrderValue[0].average
    }

    analytics.performance = performanceMetrics

    return NextResponse.json({
      analytics,
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
