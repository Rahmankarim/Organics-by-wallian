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
const client = new MongoClient(uri);

async function checkUsers() {
  try {
    await client.connect();
    const db = client.db("organics");

    console.log("Checking users in database...\n");

    const users = await db.collection("users").find({}).toArray();
    console.log(`Found ${users.length} users in Users collection:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log("  Email:", user.email);
      console.log("  Name:", user.firstName, user.lastName);
      console.log(
        "  Password hash:",
        user.password ? user.password.substring(0, 20) + "..." : "NO PASSWORD"
      );
      console.log(
        "  Password length:",
        user.password ? user.password.length : 0
      );
      console.log("  Verified:", user.isEmailVerified);
      console.log("  Created:", user.createdAt);
      console.log();
    });

    const pendingUsers = await db.collection("pendingusers").find({}).toArray();
    console.log(
      `Found ${pendingUsers.length} pending users in PendingUsers collection:\n`
    );

    pendingUsers.forEach((user, index) => {
      console.log(`Pending User ${index + 1}:`);
      console.log("  Email:", user.email);
      console.log(
        "  Password hash:",
        user.password ? user.password.substring(0, 20) + "..." : "NO PASSWORD"
      );
      console.log(
        "  Password length:",
        user.password ? user.password.length : 0
      );
      console.log("  Expires:", user.verificationCodeExpires);
      console.log();
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkUsers();
