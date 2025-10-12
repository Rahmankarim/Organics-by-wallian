// Simple script to add a test product to the database
import dbConnect, { Product } from "../lib/mongoose.js";

async function addTestProduct() {
  try {
    await dbConnect();

    const testProduct = {
      id: 1,
      name: "Test Almonds",
      slug: "test-almonds",
      description: "Test product for debugging cart",
      shortDescription: "Test almonds",
      price: 100,
      originalPrice: 120,
      images: ["/placeholder.jpg"],
      category: "Nuts",
      subcategory: "Almonds",
      tags: ["test", "almonds"],
      variants: [],
      rating: 4.5,
      reviewCount: 10,
      inStock: true,
      stockCount: 100,
      weight: "250g",
      features: ["Test feature"],
      nutritionFacts: {
        calories: "100 kcal",
        protein: "5g",
        fat: "3g",
        carbs: "10g",
        fiber: "2g",
        vitaminE: "1mg",
        serving: "100g",
      },
      benefits: ["Test benefit"],
      isActive: true,
    };

    const existingProduct = await Product.findOne({ id: 1 });
    if (existingProduct) {
      console.log("Test product already exists");
      return;
    }

    await Product.create(testProduct);
    console.log("Test product added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error adding test product:", error);
    process.exit(1);
  }
}

addTestProduct();
