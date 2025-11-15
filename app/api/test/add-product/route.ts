import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { Product } from '@/lib/mongoose'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const testProduct = {
      id: 1,
      name: "Test Premium Almonds",
      slug: "test-premium-almonds",
      description: "Test product for debugging cart functionality",
      shortDescription: "Test premium almonds",
      price: 299,
      originalPrice: 399,
      images: ["/placeholder.jpg"],
      category: "Nuts",
      subcategory: "Almonds",
      tags: ["test", "almonds", "premium"],
      variants: [
        {
          id: "test-almond-250g",
          name: "250g Pack",
          type: "weight",
          value: "250g",
          price: 299,
          stockCount: 50,
          sku: "TEST-ALM-250G"
        }
      ],
      rating: 4.5,
      reviewCount: 10,
      badge: "test",
      inStock: true,
      stockCount: 100,
      weight: "250g",
      features: ["Test Product", "Debug Purpose"],
      nutritionFacts: {
        calories: "100 kcal",
        protein: "5g",
        fat: "3g",
        carbs: "10g",
        fiber: "2g",
        vitaminE: "1mg",
        serving: "100g"
      },
      benefits: ["Test Benefit"],
      metaTitle: "Test Product",
      metaDescription: "Test product for debugging",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ id: 1 })
    if (existingProduct) {
      return NextResponse.json({ 
        message: 'Test product already exists',
        product: existingProduct 
      })
    }

    const createdProduct = await Product.create(testProduct)
    
    return NextResponse.json({ 
      message: 'Test product created successfully',
      product: createdProduct 
    })

  } catch (error) {
    console.error('Error creating test product:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create test product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}