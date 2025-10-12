import { MongoClient } from "mongodb";

const mongoUri =
  "mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organics?retryWrites=true&w=majority&appName=Cluster0";
const databaseName = "organics";

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
        sku: "ALM-250G",
      },
      {
        id: "almond-500g",
        name: "Weight",
        value: "500g",
        price: 899,
        stockCount: 50,
        sku: "ALM-500G",
      },
    ],
    features: ["Premium Quality", "Rich in Vitamin E", "Heart Healthy"],
    shortDescription: "Premium Kashmiri almonds for healthy snacking",
    sku: "ALM-KASHMIRI-500G",
    tags: ["almonds", "premium", "kashmiri", "healthy"],
    badge: "Premium",
    weight: "500g",
    nutritionFacts: {
      calories: "576 kcal",
      protein: "21.2g",
      fat: "49.9g",
      carbs: "21.6g",
      fiber: "12.5g",
      vitaminE: "25.6mg",
      serving: "100g",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Roasted Pistachios",
    slug: "roasted-pistachios",
    description: "Delicious roasted pistachios, perfectly salted.",
    price: 1299,
    originalPrice: 1599,
    images: ["/placeholder.svg"],
    category: "Pistachios",
    inStock: true,
    stockCount: 30,
    rating: 4.5,
    reviewCount: 89,
    variants: [],
    sku: "PIST-ROASTED-500G",
    features: ["Roasted", "Salted", "Premium Quality"],
    shortDescription: "Delicious roasted pistachios",
    tags: ["pistachios", "roasted", "salted"],
    badge: "Popular",
    weight: "500g",
    nutritionFacts: {
      calories: 557,
      protein: 20.6,
      fat: 44.4,
      carbs: 27.5,
      fiber: 10.3,
      vitaminE: 2.3,
      serving: "28g (1 oz)",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Organic Dates Medley",
    slug: "organic-dates-medley",
    description:
      "Premium organic dates from the finest palm groves. Natural energy booster with rich taste.",
    price: 649,
    originalPrice: 799,
    images: ["/Features/dates.jpg"],
    category: "Dates",
    subcategory: "Organic",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 40,
    rating: 4.7,
    reviewCount: 156,
    variants: [],
    sku: "DATES-ORGANIC-500G",
    features: ["100% Organic", "Natural Energy", "Rich in Fiber"],
    shortDescription: "Premium organic dates for natural energy",
    tags: ["dates", "organic", "energy", "healthy"],
    badge: "Organic",
    weight: "500g",
    nutritionFacts: {
      calories: 277,
      protein: 1.8,
      fat: 0.2,
      carbs: 75.0,
      fiber: 6.7,
      vitaminE: 0.1,
      serving: "100g",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Himalayan Walnuts",
    slug: "himalayan-walnuts",
    description:
      "Premium Himalayan walnuts, rich in Omega-3 fatty acids. Perfect for brain health.",
    price: 1099,
    originalPrice: 1399,
    images: ["/Features/walnut.jpg"],
    category: "Walnuts",
    subcategory: "Himalayan",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 35,
    rating: 4.8,
    reviewCount: 92,
    variants: [],
    sku: "WALNUT-HIMALAYAN-500G",
    features: ["Omega-3 Rich", "Brain Health", "Premium Quality"],
    shortDescription: "Himalayan walnuts rich in Omega-3",
    tags: ["walnuts", "himalayan", "omega3", "brain"],
    badge: "Limited Edition",
    weight: "500g",
    nutritionFacts: {
      calories: 654,
      protein: 15.2,
      fat: 65.2,
      carbs: 13.7,
      fiber: 6.7,
      vitaminE: 0.7,
      serving: "28g (1 oz)",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "Premium Honey - Pure Kekar Honey",
    slug: "premium-honey-pure-kekar-honey",
    description:
      "Pure Kekar honey from Gilgit Baltistan. 100% natural and unprocessed.",
    price: 2699,
    originalPrice: 3099,
    images: ["/placeholder.jpg"],
    category: "Honey",
    subcategory: "Pure",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 25,
    rating: 4.9,
    reviewCount: 78,
    variants: [],
    sku: "HONEY-KEKAR-500ML",
    features: ["100% Pure", "Unprocessed", "Gilgit Baltistan"],
    shortDescription: "Pure Kekar honey from Gilgit Baltistan",
    tags: ["honey", "pure", "kekar", "gilgit"],
    badge: "Premium",
    weight: "500ml",
    nutritionFacts: {
      calories: 304,
      protein: 0.3,
      fat: 0.0,
      carbs: 82.4,
      fiber: 0.2,
      vitaminE: 0.0,
      serving: "21g (1 tbsp)",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: "Black Cumin - Kala Zeera",
    slug: "black-cumin-kala-zeera",
    description:
      "100% Organic black cumin from Gilgit Baltistan. Rich in antioxidants and health benefits.",
    price: 3600,
    originalPrice: 5000,
    images: ["/Features/cumin.jpg"],
    category: "Spices",
    subcategory: "Organic",
    brand: "Luxury Dry Fruits",
    inStock: true,
    stockCount: 20,
    rating: 4.6,
    reviewCount: 45,
    variants: [],
    sku: "CUMIN-BLACK-1KG",
    features: ["100% Organic", "Antioxidant Rich", "Medicinal Properties"],
    shortDescription: "Organic black cumin from Gilgit Baltistan",
    tags: ["cumin", "black", "organic", "spices"],
    badge: "New",
    weight: "1kg",
    nutritionFacts: {
      calories: 375,
      protein: 17.8,
      fat: 22.3,
      carbs: 44.2,
      fiber: 10.5,
      vitaminE: 3.3,
      serving: "5g (1 tsp)",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedProducts() {
  let client;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(databaseName);
    const collection = db.collection("products");

    // Clear existing products and drop indexes
    console.log("Dropping products collection...");
    await collection
      .drop()
      .catch(() => console.log("Collection does not exist, continuing..."));

    // Insert sample products
    console.log("Inserting sample products...");
    const result = await collection.insertMany(sampleProducts);

    console.log(`Inserted ${result.insertedCount} products`);
    console.log(
      "Inserted IDs:",
      Object.values(result.insertedIds).map((id) => id.toString())
    );
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedProducts();
