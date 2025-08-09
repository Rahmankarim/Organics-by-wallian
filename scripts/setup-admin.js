#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

async function setupAdmin() {
  try {
    console.log("🔧 Setting up admin user...");

    // Run the TypeScript file directly with tsx
    const scriptPath = path.join(__dirname, "setup-admin.ts");
    execSync(`npx tsx ${scriptPath}`, { stdio: "inherit", cwd: process.cwd() });

    console.log("✅ Admin setup completed!");
  } catch (error) {
    console.error("❌ Error setting up admin:", error.message);
  }
}

setupAdmin();
