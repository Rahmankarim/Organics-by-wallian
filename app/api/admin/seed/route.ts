import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Clear existing data
    await db.collection('products').deleteMany({})
    await db.collection('orders').deleteMany({})
    await db.collection('users').deleteMany({})

    // Sample users
    const users = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 9876543210',
        createdAt: new Date('2024-01-01')
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '+91 9876543211',
        createdAt: new Date('2024-01-15')
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '+91 9876543212',
        createdAt: new Date('2024-02-01')
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        phone: '+91 9876543213',
        createdAt: new Date('2024-02-15')
      },
      {
        name: 'Vikash Singh',
        email: 'vikash@example.com',
        phone: '+91 9876543214',
        createdAt: new Date('2024-03-01')
      }
    ]

    // Sample products
    const products = [
      {
        name: 'Premium California Almonds',
        price: 850,
        category: 'almonds',
        image: '/Features/almond.jpg',
        stock: 45,
        description: 'High-quality California almonds, rich in nutrients',
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        name: 'Iranian Pistachios',
        price: 1200,
        category: 'pistachios',
        image: '/Features/Pistachios.jpg',
        stock: 32,
        description: 'Premium Iranian pistachios with natural flavor',
        isActive: true,
        createdAt: new Date('2024-01-02')
      },
      {
        name: 'Medjool Dates',
        price: 650,
        category: 'dates',
        image: '/Features/dates.jpg',
        stock: 28,
        description: 'Sweet and soft Medjool dates from Jordan',
        isActive: true,
        createdAt: new Date('2024-01-03')
      },
      {
        name: 'Kashmir Walnuts',
        price: 950,
        category: 'walnuts',
        image: '/Features/walnut.jpg',
        stock: 18,
        description: 'Fresh Kashmir walnuts with excellent quality',
        isActive: true,
        createdAt: new Date('2024-01-04')
      },
      {
        name: 'Raw Cashews',
        price: 750,
        category: 'cashews',
        image: '/placeholder.jpg',
        stock: 8,
        description: 'Premium raw cashews from Kerala',
        isActive: true,
        createdAt: new Date('2024-01-05')
      },
      {
        name: 'Mixed Dry Fruits Gift Box',
        price: 1500,
        category: 'gifts',
        image: '/placeholder.jpg',
        stock: 15,
        description: 'Perfect gift box with assorted premium dry fruits',
        isActive: true,
        createdAt: new Date('2024-01-06')
      }
    ]

    // Insert users and products first to get their IDs
    const insertedUsers = await db.collection('users').insertMany(users)
    const insertedProducts = await db.collection('products').insertMany(products)

    const userIds = Object.values(insertedUsers.insertedIds)
    const productIds = Object.values(insertedProducts.insertedIds)

    // Sample orders with real IDs
    const orders = [
      {
        userId: userIds[0].toString(),
        items: [
          { productId: productIds[0].toString(), name: 'Premium California Almonds', quantity: 2, price: 850 },
          { productId: productIds[2].toString(), name: 'Medjool Dates', quantity: 1, price: 650 }
        ],
        total: 2350,
        status: 'Delivered',
        deliveryAddress: {
          name: 'Rahul Sharma',
          phone: '+91 9876543210',
          address: '123 MG Road, Bangalore, Karnataka 560001'
        },
        paymentMethod: 'Card',
        createdAt: new Date('2024-08-01')
      },
      {
        userId: userIds[1].toString(),
        items: [
          { productId: productIds[1].toString(), name: 'Iranian Pistachios', quantity: 1, price: 1200 },
          { productId: productIds[3].toString(), name: 'Kashmir Walnuts', quantity: 1, price: 950 }
        ],
        total: 2150,
        status: 'Shipped',
        deliveryAddress: {
          name: 'Priya Patel',
          phone: '+91 9876543211',
          address: '456 Park Street, Mumbai, Maharashtra 400001'
        },
        paymentMethod: 'UPI',
        createdAt: new Date('2024-08-03')
      },
      {
        userId: userIds[2].toString(),
        items: [
          { productId: productIds[5].toString(), name: 'Mixed Dry Fruits Gift Box', quantity: 2, price: 1500 }
        ],
        total: 3000,
        status: 'Processing',
        deliveryAddress: {
          name: 'Amit Kumar',
          phone: '+91 9876543212',
          address: '789 Civil Lines, Delhi 110001'
        },
        paymentMethod: 'Cash on Delivery',
        createdAt: new Date('2024-08-05')
      },
      {
        userId: userIds[3].toString(),
        items: [
          { productId: productIds[0].toString(), name: 'Premium California Almonds', quantity: 1, price: 850 },
          { productId: productIds[1].toString(), name: 'Iranian Pistachios', quantity: 2, price: 1200 },
          { productId: productIds[4].toString(), name: 'Raw Cashews', quantity: 1, price: 750 }
        ],
        total: 4000,
        status: 'Pending',
        deliveryAddress: {
          name: 'Sneha Reddy',
          phone: '+91 9876543213',
          address: '321 Tank Bund, Hyderabad, Telangana 500001'
        },
        paymentMethod: 'Card',
        createdAt: new Date('2024-08-07')
      },
      {
        userId: userIds[4].toString(),
        items: [
          { productId: productIds[2].toString(), name: 'Medjool Dates', quantity: 3, price: 650 },
          { productId: productIds[3].toString(), name: 'Kashmir Walnuts', quantity: 2, price: 950 }
        ],
        total: 3850,
        status: 'Delivered',
        deliveryAddress: {
          name: 'Vikash Singh',
          phone: '+91 9876543214',
          address: '654 Fraser Road, Patna, Bihar 800001'
        },
        paymentMethod: 'UPI',
        createdAt: new Date('2024-08-08')
      },
      {
        userId: userIds[0].toString(),
        items: [
          { productId: productIds[4].toString(), name: 'Raw Cashews', quantity: 2, price: 750 }
        ],
        total: 1500,
        status: 'Delivered',
        deliveryAddress: {
          name: 'Rahul Sharma',
          phone: '+91 9876543210',
          address: '123 MG Road, Bangalore, Karnataka 560001'
        },
        paymentMethod: 'Card',
        createdAt: new Date('2024-08-09')
      }
    ]

    // Insert orders
    const insertedOrders = await db.collection('orders').insertMany(orders)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: insertedUsers.insertedCount,
        products: insertedProducts.insertedCount,
        orders: insertedOrders.insertedCount
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
