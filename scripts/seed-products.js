import clientPromise from "../lib/mongodb";

const sampleProducts = [
  {
    id: 1,
    name: "Premium Kashmiri Almonds",
    slug: "premium-kashmiri-almonds",
    description:
      "Premium quality Kashmiri almonds, rich in nutrients and flavor. Perfect for healthy snacking.",
    price: 899,
    originalPrice: 1199,
    images: ["/public/Features/almond.jpg", "/placeholder.svg"],
    category: "Almonds",
    subcategory: "Premium",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 50,
    rating: 4.8,
    reviewCount: 124,
    variants: [
      {
        id: "almond-250g",
        name: "Weight",
        value: "250g",
        price: 499,
        stockCount: 30,
      },
      {
        id: "almond-500g",
        name: "Weight",
        value: "500g",
        price: 899,
        stockCount: 50,
      },
      {
        id: "almond-1kg",
        name: "Weight",
        value: "1kg",
        price: 1699,
        stockCount: 25,
      },
    ],
    features: [
      "Premium Quality",
      "Rich in Vitamin E",
      "Heart Healthy",
      "No Artificial Colors",
    ],
    nutritionPer100g: {
      calories: 579,
      protein: "21.2g",
      carbs: "21.6g",
      fat: "49.9g",
      fiber: "12.5g",
    },
    tags: ["organic", "premium", "kashmiri", "almonds"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Royal Pistachios",
    slug: "royal-pistachios",
    description:
      "Premium quality pistachios imported from Iran. Rich, creamy texture with exceptional taste.",
    price: 1299,
    originalPrice: 1599,
    images: ["/public/Features/Pistachios.jpg", "/placeholder.svg"],
    category: "Pistachios",
    subcategory: "Imported",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 35,
    rating: 4.9,
    reviewCount: 89,
    variants: [
      {
        id: "pistachio-250g",
        name: "Weight",
        value: "250g",
        price: 699,
        stockCount: 20,
      },
      {
        id: "pistachio-500g",
        name: "Weight",
        value: "500g",
        price: 1299,
        stockCount: 35,
      },
      {
        id: "pistachio-1kg",
        name: "Weight",
        value: "1kg",
        price: 2399,
        stockCount: 15,
      },
    ],
    features: [
      "Iranian Quality",
      "Rich in Antioxidants",
      "High Protein",
      "Natural",
    ],
    nutritionPer100g: {
      calories: 560,
      protein: "20.2g",
      carbs: "27.2g",
      fat: "45.3g",
      fiber: "10.6g",
    },
    tags: ["imported", "iranian", "premium", "pistachios"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Organic Dates Medley",
    slug: "organic-dates-medley",
    description:
      "A delicious mix of premium quality dates including Medjool, Ajwa, and Deglet varieties.",
    price: 649,
    originalPrice: 799,
    images: ["/public/Features/dates.jpg", "/placeholder.svg"],
    category: "Dates",
    subcategory: "Mixed",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 60,
    rating: 4.7,
    reviewCount: 156,
    variants: [
      {
        id: "dates-500g",
        name: "Weight",
        value: "500g",
        price: 399,
        stockCount: 40,
      },
      {
        id: "dates-1kg",
        name: "Weight",
        value: "1kg",
        price: 649,
        stockCount: 60,
      },
      {
        id: "dates-2kg",
        name: "Weight",
        value: "2kg",
        price: 1199,
        stockCount: 30,
      },
    ],
    features: [
      "Organic Certified",
      "Mixed Varieties",
      "High Fiber",
      "Natural Sweetener",
    ],
    nutritionPer100g: {
      calories: 277,
      protein: "1.8g",
      carbs: "75g",
      fat: "0.2g",
      fiber: "6.7g",
    },
    tags: ["organic", "dates", "mixed", "healthy"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Premium Walnuts",
    slug: "premium-walnuts",
    description:
      "Fresh, premium quality walnuts. Rich in omega-3 fatty acids and perfect for brain health.",
    price: 1099,
    originalPrice: 1399,
    images: ["/public/Features/walnut.jpg", "/placeholder.svg"],
    category: "Walnuts",
    subcategory: "Premium",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 40,
    rating: 4.6,
    reviewCount: 98,
    variants: [
      {
        id: "walnut-250g",
        name: "Weight",
        value: "250g",
        price: 599,
        stockCount: 25,
      },
      {
        id: "walnut-500g",
        name: "Weight",
        value: "500g",
        price: 1099,
        stockCount: 40,
      },
      {
        id: "walnut-1kg",
        name: "Weight",
        value: "1kg",
        price: 1999,
        stockCount: 20,
      },
    ],
    features: [
      "Brain Food",
      "Rich in Omega-3",
      "Heart Healthy",
      "Fresh Quality",
    ],
    nutritionPer100g: {
      calories: 654,
      protein: "15.2g",
      carbs: "13.7g",
      fat: "65.2g",
      fiber: "6.7g",
    },
    tags: ["walnuts", "omega3", "brain-food", "premium"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedProducts() {
  try {
    const client = await clientPromise;
    const db = client.db("luxury-dry-fruits");

    // Clear existing products
    await db.collection("products").deleteMany({});

    // Insert sample products
    const result = await db.collection("products").insertMany(sampleProducts);

    console.log(`✅ Successfully inserted ${result.insertedCount} products`);
    console.log("Sample products:");
    sampleProducts.forEach((product) => {
      console.log(`- ${product.name} (₹${product.price})`);
    });
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedProducts();
