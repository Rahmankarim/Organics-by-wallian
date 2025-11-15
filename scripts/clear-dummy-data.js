const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Read .env.local file manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error("Warning: Could not read .env.local file");
  }
}

loadEnv();

async function clearDummyData() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in environment variables");
    console.error("Please make sure .env.local exists with MONGODB_URI");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("organic_orchard");

    // Delete all existing orders (dummy data)
    const ordersResult = await db.collection("orders").deleteMany({});
    console.log(`🗑️  Deleted ${ordersResult.deletedCount} dummy orders`);

    console.log("\n✅ All dummy data has been cleared!");
    console.log("📝 Your database is now ready for authentic customer data.");
    console.log(
      "💡 Orders will appear when real customers place them through your website.\n"
    );
  } catch (error) {
    console.error("❌ Error clearing dummy data:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔒 Database connection closed");
  }
}

clearDummyData();
