import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongoose'
import { CartItem, Product, Analytics } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

// Validate if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id)
}

// Resolve product by either ObjectId (_id) or legacy numeric `id` field.
async function resolveProduct(productRef: any) {
  if (!productRef && productRef !== 0) return null
  // If it's an ObjectId-like string, query by _id
  if (typeof productRef === 'string' && isValidObjectId(productRef)) {
    return await Product.findById(productRef).lean()
  }

  // If numeric (string of digits or number) query by legacy numeric id
  if (typeof productRef === 'number' || (typeof productRef === 'string' && /^\d+$/.test(productRef))) {
    const numericId = typeof productRef === 'string' ? parseInt(productRef, 10) : productRef
    return await Product.findOne({ id: numericId }).lean()
  }

  // Unknown format - avoid querying by `id` with a string which will cause cast errors
  return null
}

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get cart items for user
    const cartItems = await CartItem.find({ userId: user._id }).lean()

    // Get product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await resolveProduct(item.productId) as any
        if (!product) return null
        
        // Find variant if specified
        let variant = null
        if (item.variantId && product.variants) {
          variant = product.variants.find((v: any) => v.id === item.variantId)
        }

        return {
          _id: item._id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant ? variant.price : product.price,
          addedAt: item.addedAt,
          product: {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            images: product.images,
            inStock: variant ? variant.stockCount > 0 : product.inStock,
            stockCount: variant ? variant.stockCount : product.stockCount
          },
          variant
        }
      })
    )

    // Filter out null items (products that don't exist anymore)
    const validCartItems = cartWithProducts.filter(item => item !== null)

    // Calculate totals
    const subtotal = validCartItems.reduce((total, item: any) => {
      return total + (item.price * item.quantity)
    }, 0)

    const totalItems = validCartItems.reduce((total, item: any) => {
      return total + item.quantity
    }, 0)

    const tax = subtotal * 0.18 // 18% GST
    const shipping = subtotal >= 999 ? 0 : 99 // Free shipping above Rs. 999
    const total = subtotal + tax + shipping

    return NextResponse.json({
      success: true,
      items: validCartItems,
      summary: {
        subtotal,
        totalItems,
        tax,
        shipping,
        total
      }
    })

  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    console.log('Cart POST endpoint called')
    
    // First validate request body
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { productId, quantity, variantId, price } = body

    // Validation
    if (!productId || !quantity || quantity <= 0) {
      console.log('Validation failed:', { productId, quantity })
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      )
    }

    await dbConnect()
    console.log('Database connected')

    // Validate productId is a valid MongoDB ObjectId or legacy numeric ID
    console.log('Looking for product with ID:', productId, 'Type:', typeof productId)
    
    let product: any = null
    
    // First try as ObjectId (preferred method)
    if (typeof productId === 'string' && isValidObjectId(productId)) {
      console.log('Trying ObjectId lookup:', productId)
      product = await Product.findById(productId).lean()
      console.log('ObjectId query result:', product ? 'Product found' : 'Product not found')
    }
    
    // If not found and it's a numeric ID, try legacy lookup
    if (!product && (typeof productId === 'number' || (typeof productId === 'string' && /^\d+$/.test(productId)))) {
      const numericId = typeof productId === 'string' ? parseInt(productId) : productId
      console.log('Trying legacy numeric ID lookup:', numericId)
      product = await Product.findOne({ id: numericId }).lean()
      console.log('Numeric ID query result:', product ? 'Product found' : 'Product not found')
    }
    
  if (!product) {
      // Debug: List all available products with their _id and id values
      const allProducts = await Product.find({}, '_id id name').limit(10).lean()
      console.log('Available products:', allProducts.map((p: any) => ({ 
        _id: p._id.toString(), 
        id: p.id, 
        name: p.name 
      })))
      
      console.log('Product not found for ID:', productId)
      return NextResponse.json(
        { 
          error: 'Product not found',
          requestedId: productId,
          availableIds: allProducts.map((p: any) => p._id.toString()),
          hint: 'Make sure to use valid MongoDB ObjectId strings'
        },
        { status: 404 }
      )
    }
    
    console.log('Product found:', { 
      _id: product._id.toString(), 
      name: product.name, 
      price: product.price,
      inStock: product.inStock 
    })

    if (!product.inStock) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Require authentication for adding to server-side cart
    const user = await getUserFromRequest(request)
    console.log('User found:', !!user)

    if (!user) {
      return NextResponse.json({ message: 'Please login to add items to cart' }, { status: 401 })
    }

    if (user) {
      // Authenticated user - save to database
      console.log('Processing authenticated user cart')
      
      // Check variant if specified
      let variant = null
      if (variantId && product.variants) {
        variant = product.variants.find((v: any) => v.id === variantId)
        if (!variant) {
          return NextResponse.json(
            { error: 'Product variant not found' },
            { status: 404 }
          )
        }
        if (variant.stockCount < quantity) {
          return NextResponse.json(
            { error: 'Insufficient stock for selected variant' },
            { status: 400 }
          )
        }
      } else if (product.stockCount < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }

      // Check if item already exists in cart
      const existingCartItem = await CartItem.findOne({
        userId: user._id,
        productId,
        variantId: variantId || null
      })

      if (existingCartItem) {
        // Update quantity
        const newQuantity = existingCartItem.quantity + quantity
        const maxStock = variant ? variant.stockCount : product.stockCount
        
        if (newQuantity > maxStock) {
          return NextResponse.json(
            { error: `Cannot add more items. Maximum available: ${maxStock}` },
            { status: 400 }
          )
        }

        existingCartItem.quantity = newQuantity
        existingCartItem.price = variant ? variant.price : (price || product.price)
        await existingCartItem.save()
        console.log('Updated existing cart item')
      } else {
        // Create new cart item
        const newCartItem = await CartItem.create({
          userId: user._id,
          productId,
          variantId: variantId || null,
          quantity,
          price: variant ? variant.price : (price || product.price),
          addedAt: new Date()
        })
        console.log('Created new cart item:', newCartItem._id)
      }
    }

    // Track analytics
    try {
      await Analytics.findOneAndUpdate(
        { type: 'product_interaction', productId },
        {
          $inc: {
            'data.addToCartCount': 1
          }
        },
        { upsert: true }
      )
    } catch (analyticsError) {
      console.error('Analytics error:', analyticsError)
    }

    console.log('Cart POST successful')
    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      productId,
      quantity,
      authenticated: !!user
    })

  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add item to cart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update cart item quantity
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
    const { productId, quantity, variantId } = body

    if (!productId || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find cart item
    const cartItem = await CartItem.findOne({
      userId: user._id,
      productId,
      variantId: variantId || null
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await CartItem.deleteOne({ _id: cartItem._id })
    } else {
      // Verify stock availability
      const product = await Product.findOne({ id: productId }) as any
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      let maxStock = product.stockCount
      if (variantId && product.variants) {
        const variant = product.variants.find((v: any) => v.id === variantId)
        if (variant) {
          maxStock = variant.stockCount
        }
      }

      if (quantity > maxStock) {
        return NextResponse.json(
          { error: `Cannot update quantity. Maximum available: ${maxStock}` },
          { status: 400 }
        )
      }

      cartItem.quantity = quantity
      await cartItem.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully'
    })

  } catch (error) {
    console.error('Cart PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    const body = await request.json().catch(() => ({}))
    const { productId, variantId } = body

    if (productId) {
      // Remove specific item
      const result = await CartItem.deleteOne({
        userId: user._id,
        productId,
        variantId: variantId || null
      })

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }
    } else {
      // Clear entire cart
      await CartItem.deleteMany({ userId: user._id })
    }

    return NextResponse.json({
      success: true,
      message: productId ? 'Item removed from cart' : 'Cart cleared successfully'
    })

  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}
