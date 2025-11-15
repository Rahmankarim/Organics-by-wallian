import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { Product } from '@/lib/mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    const products = await Product.find({}).limit(10).lean()
    
    return NextResponse.json({
      success: true,
      message: 'Products found',
      count: products.length,
      products: products.map((p: any) => ({
        _id: p._id,
        id: p.id,
        name: p.name,
        price: p.price,
        inStock: p.inStock
      }))
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}