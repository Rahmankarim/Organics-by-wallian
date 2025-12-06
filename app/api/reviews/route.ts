import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Review, Product, Order, Analytics, CartItem } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')
    const skip = (page - 1) * limit

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Build query
    const query: any = { productId }
    if (rating) {
      query.rating = parseInt(rating)
    }

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalReviews = await Review.countDocuments(query)

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      },
      statistics: {
        averageRating: avgRating[0]?.averageRating || 0,
        totalReviews: avgRating[0]?.totalReviews || 0,
        ratingBreakdown: reviewStats
      }
    })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, rating, title, comment, images } = body

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if product exists
    const product = await Product.findOne({ id: productId })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user has purchased this product (any status or in cart)
    const hasOrderedProduct = await Order.findOne({
      userId: user._id,
      'items.productId': productId
    })

    const hasInCart = await CartItem.findOne({
      userId: user._id,
      productId: productId
    })

    if (!hasOrderedProduct && !hasInCart) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased or have in your cart' },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId: user._id,
      productId
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review
    const review = await Review.create({
      userId: user._id,
      productId,
      rating,
      title,
      comment,
      images: images || [],
      verified: true // Since we verified the purchase
    })

    // Update product rating
    const allReviews = await Review.find({ productId })
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0)
    const averageRating = totalRating / allReviews.length

    await Product.findOneAndUpdate(
      { id: productId },
      {
        rating: averageRating,
        reviewCount: allReviews.length
      }
    )

    // Track analytics
    await Analytics.create({
      type: 'review_submitted',
      userId: user._id,
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      data: {
        productId,
        rating,
        hasImages: (images && images.length > 0)
      }
    })

    return NextResponse.json({
      message: 'Review submitted successfully',
      reviewId: review._id
    }, { status: 201 })

  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, rating, title, comment, images } = body

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find review
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns this review
    if (review.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      )
    }

    // Update review
    const updateData: any = {}
    if (rating !== undefined) updateData.rating = rating
    if (title !== undefined) updateData.title = title
    if (comment !== undefined) updateData.comment = comment
    if (images !== undefined) updateData.images = images
    updateData.updatedAt = new Date()

    await Review.findByIdAndUpdate(reviewId, updateData)

    // Update product rating if rating changed
    if (rating !== undefined) {
      const allReviews = await Review.find({ productId: review.productId })
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0)
      const averageRating = totalRating / allReviews.length

      await Product.findOneAndUpdate(
        { id: review.productId },
        { rating: averageRating }
      )
    }

    return NextResponse.json({
      message: 'Review updated successfully'
    })

  } catch (error) {
    console.error('Review update error:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    const productId = review.productId

    await Review.findByIdAndDelete(reviewId)

    // Update product rating
    const remainingReviews = await Review.find({ productId })
    if (remainingReviews.length > 0) {
      const totalRating = remainingReviews.reduce((sum, rev) => sum + rev.rating, 0)
      const averageRating = totalRating / remainingReviews.length

      await Product.findOneAndUpdate(
        { id: productId },
        {
          rating: averageRating,
          reviewCount: remainingReviews.length
        }
      )
    } else {
      await Product.findOneAndUpdate(
        { id: productId },
        {
          rating: 0,
          reviewCount: 0
        }
      )
    }

    return NextResponse.json({
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Review deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
