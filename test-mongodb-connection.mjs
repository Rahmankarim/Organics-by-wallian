import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envFile = readFileSync(join(__dirname, ".env.local"), "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const uri = envVars.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("🔍 Testing MongoDB Atlas Connection...\n");
console.log(
  "📡 Connection String:",
  uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
);

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 75000,
});

async function testConnection() {
  try {
    console.log("\n⏳ Attempting to connect...");
    const startTime = Date.now();

    await client.connect();

    const elapsed = Date.now() - startTime;
    console.log(`✅ Connected successfully in ${elapsed}ms\n`);

    // Test database operations
    const db = client.db("organics");
    console.log("📊 Testing database operations...");

    const collections = await db.listCollections().toArray();
    console.log(
      `✅ Found ${collections.length} collections:`,
      collections.map((c) => c.name).join(", ")
    );

    // Test a simple query
    const users = db.collection("users");
    const userCount = await users.countDocuments();
    console.log(`✅ Users collection has ${userCount} documents`);

    console.log("\n✨ All tests passed! MongoDB connection is working.\n");
  } catch (error) {
    console.error("\n❌ Connection failed:", error.message);

    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("getaddrinfo")
    ) {
      console.error("\n💡 DNS resolution failed. Possible causes:");
      console.error("   - Check your internet connection");
      console.error("   - MongoDB Atlas cluster might be paused");
      console.error("   - Verify the connection string is correct");
    } else if (
      error.message.includes("timeout") ||
      error.message.includes("timed out")
    ) {
      console.error("\n💡 Connection timed out. Possible causes:");
      console.error("   - Your IP address is not whitelisted in MongoDB Atlas");
      console.error("   - Firewall blocking outbound connections");
      console.error("   - MongoDB Atlas cluster might be under maintenance");
      console.error("\n🔧 To fix:");
      console.error("   1. Go to MongoDB Atlas → Network Access");
      console.error(
        "   2. Add your current IP or allow access from anywhere (0.0.0.0/0)"
      );
      console.error("   3. Wait 1-2 minutes for changes to propagate");
    } else if (error.message.includes("Authentication failed")) {
      console.error("\n💡 Authentication failed. Check:");
      console.error("   - Username and password in connection string");
      console.error("   - Database user exists in MongoDB Atlas");
    }

    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
