// Build-time environment validation
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];

const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingVars.length > 0 && process.env.NODE_ENV === "production") {
  console.warn(
    `⚠️  Missing environment variables for production: ${missingVars.join(
      ", "
    )}`
  );
  console.warn(
    "   The application may not function correctly without these variables."
  );
  console.warn("   Please set them in your deployment environment.");
}

if (process.env.NODE_ENV !== "production") {
  console.log("✅ Environment validation skipped for development/build mode");
}

module.exports = {};
