import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect, { Wishlist, Product } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

// Utility function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id)
}

// Normalize image paths stored in DB. Convert "/public/Features/..." -> "/Features/..." and
// ensure a leading slash for relative paths. Preserve absolute URLs.
function normalizeImagePath(img: string | undefined) {
  if (!img) return '/placeholder.svg'
  // If it's an absolute URL (http(s)), return as-is
  if (/^https?:\/\//.test(img)) return img

  // Strip leading /public if present
  const stripped = img.replace(/^\/public/, '')

  // Ensure leading slash
  return stripped.startsWith('/') ? stripped : `/${stripped}`
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await dbConnect()

    const wishlist = await Wishlist.findOne({ userId: user._id }).lean()
    
    if (!wishlist || !wishlist.products.length) {
      return NextResponse.json({ items: [] })
    }

    const wishlistWithProducts = await Promise.all(
      wishlist.products.map(async (item: any) => {
  const product = await Product.findById(item.productId).lean()
        if (!product) return null

        const images = (product.images || ['/placeholder.svg']).map((img: string) => normalizeImagePath(img))

        return {
          id: item.productId,
          product: {
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            images,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            inStock: product.inStock,
            category: product.category
          },
          addedAt: item.addedAt
        }
      })
    )

    const validItems = wishlistWithProducts.filter(item => item !== null)

    return NextResponse.json({ items: validItems })

  } catch (error) {
    console.error('Wishlist fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    await dbConnect()

  const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    let wishlist = await Wishlist.findOne({ userId: user._id })
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: user._id,
        products: []
      })
    }

    const existingItem = wishlist.products.find((item: any) => item.productId === productId)

    if (existingItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 })
    }

    wishlist.products.push({
      productId,
      addedAt: new Date()
    })

    await wishlist.save()

    return NextResponse.json({ message: 'Product added to wishlist' })

  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json({ error: 'Failed to add product to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    await dbConnect()

    const wishlist = await Wishlist.findOne({ userId: user._id })
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 })
    }

    wishlist.products = wishlist.products.filter((item: any) => item.productId !== productId)

    await wishlist.save()

    return NextResponse.json({ message: 'Product removed from wishlist' })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json({ error: 'Failed to remove product from wishlist' }, { status: 500 })
  }
}
