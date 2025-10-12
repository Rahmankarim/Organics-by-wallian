import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test adding product ID 1 to cart
    const testCartData = {
      productId: 1,
      quantity: 1
    }

    const response = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCartData)
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Cart POST test completed',
      status: response.status,
      result: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
}