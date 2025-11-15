import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { Product } from '@/lib/mongoose'

export async function POST() {
  try {
    await dbConnect()
    
    const testProducts = [
      {
        id: 1,
        name: "Premium Kashmiri Almonds",
        slug: "premium-kashmiri-almonds",
        description: "Premium quality Kashmiri almonds, rich in nutrients and flavor. Perfect for healthy snacking.",
        shortDescription: "Premium Kashmiri almonds",
        price: 899,
        originalPrice: 1199,
        images: ["/Features/almond.jpg", "/placeholder.jpg"],
        category: "Nuts",
        subcategory: "Almonds",
        tags: ["almonds", "kashmiri", "premium"],
        variants: [],
        rating: 4.8,
        reviewCount: 124,
        badge: "Bestseller",
        inStock: true,
        stockCount: 100,
        weight: "250g",
        features: ["Premium Quality", "Rich in Vitamin E"],
        nutritionFacts: {
          calories: "100 kcal",
          protein: "5g",
          fat: "3g",
          carbs: "10g",
          fiber: "2g",
          vitaminE: "1mg",
          serving: "100g"
        },
        benefits: ["Heart Health", "Brain Health"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Royal Pistachios",
        slug: "royal-pistachios",
        description: "Premium quality pistachios with rich taste and high nutritional value.",
        shortDescription: "Royal pistachios",
        price: 1299,
        originalPrice: 1599,
        images: ["/Features/Pistachios.jpg", "/placeholder.jpg"],
        category: "Nuts",
        subcategory: "Pistachios",
        tags: ["pistachios", "royal", "premium"],
        variants: [],
        rating: 4.9,
        reviewCount: 89,
        badge: "Premium",
        inStock: true,
        stockCount: 80,
        weight: "250g",
        features: ["High in Antioxidants"],
        nutritionFacts: {
          calories: "120 kcal",
          protein: "6g",
          fat: "8g",
          carbs: "8g",
          fiber: "3g",
          vitaminE: "2mg",
          serving: "100g"
        },
        benefits: ["Eye Health", "Heart Health"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: "Organic Dates Medley",
        slug: "organic-dates-medley",
        description: "Premium organic dates that are naturally sweet and energy-packed.",
        shortDescription: "Organic dates medley",
        price: 649,
        originalPrice: 799,
        images: ["/Features/dates.jpg", "/placeholder.jpg"],
        category: "Dates",
        subcategory: "Organic",
        tags: ["dates", "organic", "natural"],
        variants: [],
        rating: 4.7,
        reviewCount: 156,
        badge: "Organic",
        inStock: true,
        stockCount: 120,
        weight: "500g",
        features: ["Natural Energy Booster", "Organic"],
        nutritionFacts: {
          calories: "277 kcal",
          protein: "2g",
          fat: "0.2g",
          carbs: "75g",
          fiber: "7g",
          vitaminE: "0.1mg",
          serving: "100g"
        },
        benefits: ["Energy Boost", "Digestive Health"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: "Himalayan Walnuts",
        slug: "himalayan-walnuts",
        description: "Fresh Himalayan walnuts rich in omega-3 fatty acids and essential nutrients.",
        shortDescription: "Himalayan walnuts",
        price: 1099,
        originalPrice: 1399,
        images: ["/Features/walnut.jpg", "/placeholder.jpg"],
        category: "Nuts",
        subcategory: "Walnuts",
        tags: ["walnuts", "himalayan", "omega3"],
        variants: [],
        rating: 4.8,
        reviewCount: 92,
        badge: "Limited Edition",
        inStock: true,
        stockCount: 60,
        weight: "250g",
        features: ["Omega-3 Rich", "Brain Food"],
        nutritionFacts: {
          calories: "654 kcal",
          protein: "15g",
          fat: "65g",
          carbs: "14g",
          fiber: "7g",
          vitaminE: "0.7mg",
          serving: "100g"
        },
        benefits: ["Brain Health", "Heart Health"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: "Premium Cashews",
        slug: "premium-cashews",
        description: "Creamy and delicious premium quality cashews from Kerala.",
        shortDescription: "Premium cashews",
        price: 1199,
        originalPrice: 1399,
        images: ["/placeholder.jpg"],
        category: "Nuts",
        subcategory: "Cashews",
        tags: ["cashews", "premium", "kerala"],
        variants: [],
        rating: 4.6,
        reviewCount: 78,
        badge: "Premium",
        inStock: true,
        stockCount: 90,
        weight: "250g",
        features: ["Creamy Texture", "Premium Grade"],
        nutritionFacts: {
          calories: "553 kcal",
          protein: "18g",
          fat: "44g",
          carbs: "30g",
          fiber: "3g",
          vitaminE: "0.9mg",
          serving: "100g"
        },
        benefits: ["Heart Health", "Bone Health"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: "Mixed Dry Fruits Gift Box",
        slug: "mixed-dry-fruits-gift-box",
        description: "Premium assorted dry fruits perfectly packed for gifting.",
        shortDescription: "Mixed dry fruits gift box",
        price: 1899,
        originalPrice: 2299,
        images: ["/placeholder.jpg"],
        category: "Gift Boxes",
        subcategory: "Assorted",
        tags: ["gift", "mixed", "assorted"],
        variants: [],
        rating: 4.9,
        reviewCount: 145,
        badge: "Gift Special",
        inStock: true,
        stockCount: 50,
        weight: "1kg",
        features: ["Premium Packaging", "Assorted Varieties"],
        nutritionFacts: {
          calories: "400 kcal",
          protein: "12g",
          fat: "25g",
          carbs: "35g",
          fiber: "8g",
          vitaminE: "5mg",
          serving: "100g"
        },
        benefits: ["Complete Nutrition", "Perfect Gift"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Clear existing products first
    await Product.deleteMany({ id: { $in: [1, 2, 3, 4, 5, 6] } })
    
    // Add new test products
    const createdProducts = await Product.insertMany(testProducts)
    
    return NextResponse.json({ 
      message: 'Test products created successfully',
      count: createdProducts.length,
      products: createdProducts
    })

  } catch (error) {
    console.error('Error creating test products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create test products', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}