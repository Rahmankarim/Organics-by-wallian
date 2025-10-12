import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://organizesmart786:NearVerse786@cluster0.cvtrj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function checkProducts() {
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("organics");

    console.log("Fetching products...");
    const products = await db.collection("products").find({}).toArray();

    console.log(`Found ${products.length} products:`);
    products.forEach((product) => {
      console.log(
        `- ID: ${product.id}, _id: ${product._id}, Name: ${product.name}`
      );
    });

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkProducts();
