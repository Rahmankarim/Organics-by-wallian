const { MongoClient } = require('mongodb')

const uri = 'mongodb://localhost:27017/OrganicsByWalian'

async function seedDatabase() {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('luxury-dry-fruits')
    
    // Clear existing data
    await db.collection('users').deleteMany({})
    await db.collection('products').deleteMany({})
    await db.collection('orders').deleteMany({})
    
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
        stock: 15,
        description: 'Premium Iranian pistachios with natural flavor',
        isActive: true,
        createdAt: new Date('2024-01-02')
      },
      {
        name: 'Medjool Dates',
        price: 650,
        category: 'dates',
        image: '/Features/dates.jpg',
        stock: 8,
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
      }
    ]

    // Insert users and products first
    const insertedUsers = await db.collection('users').insertMany(users)
    const insertedProducts = await db.collection('products').insertMany(products)
    
    const userIds = Object.values(insertedUsers.insertedIds)
    const productIds = Object.values(insertedProducts.insertedIds)

    // Sample orders
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
          { productId: productIds[1].toString(), name: 'Iranian Pistachios', quantity: 1, price: 1200 }
        ],
        total: 1200,
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
          { productId: productIds[3].toString(), name: 'Kashmir Walnuts', quantity: 2, price: 950 }
        ],
        total: 1900,
        status: 'Processing',
        deliveryAddress: {
          name: 'Amit Kumar',
          phone: '+91 9876543212',
          address: '789 Civil Lines, Delhi 110001'
        },
        paymentMethod: 'Cash on Delivery',
        createdAt: new Date('2024-08-05')
      }
    ]

    // Insert orders
    await db.collection('orders').insertMany(orders)
    
    console.log('Database seeded successfully!')
    console.log(`Inserted ${users.length} users`)
    console.log(`Inserted ${products.length} products`)
    console.log(`Inserted ${orders.length} orders`)
    
    await client.close()
    
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seedDatabase()
