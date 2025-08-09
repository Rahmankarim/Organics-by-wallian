const fs = require("fs");
const path = require("path");

// List of API route files that need to be fixed
const routes = [
  "app/api/products/route.ts",
  "app/api/products/[id]/route.ts",
  "app/api/admin/products/[id]/route.ts",
  "app/api/admin/orders/[id]/route.ts",
  "app/api/blog/route.ts",
  "app/api/blog/[slug]/route.ts",
  "app/api/admin/blog/route.ts",
  "app/api/contact/route.ts",
  "app/api/contact/[id]/route.ts",
  "app/api/admin/init/route.ts",
  "app/api/admin/seed/route.ts",
];

const workspaceRoot = process.cwd();

routes.forEach((routePath) => {
  const fullPath = path.join(workspaceRoot, routePath);

  if (fs.existsSync(fullPath)) {
    console.log(`Fixing ${routePath}...`);

    let content = fs.readFileSync(fullPath, "utf8");

    // Replace static MongoDB imports with dynamic imports
    content = content.replace(
      /import clientPromise from ["']@\/lib\/mongodb["']/g,
      "// Dynamic import - will be loaded at runtime"
    );

    content = content.replace(
      /import \{ MongoClient \} from ["']mongodb["']/g,
      "// Dynamic import - will be loaded at runtime"
    );

    content = content.replace(
      /import \{ ObjectId \} from ["']mongodb["']/g,
      "// Dynamic import - will be loaded at runtime"
    );

    // Add environment check and dynamic import at the start of GET/POST functions
    const functionRegex =
      /(export async function (GET|POST|PUT|DELETE)\([^)]*\) \{[\s]*try \{)/g;

    content = content.replace(functionRegex, (match, funcStart) => {
      if (match.includes("if (!process.env.MONGODB_URI)")) {
        return match; // Already fixed
      }

      return `${funcStart}
    // Check if required environment variables are available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')`;
    });

    // Replace direct clientPromise usage
    content = content.replace(
      /const client = await clientPromise/g,
      "const client = await clientPromise"
    );

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${routePath}`);
  } else {
    console.log(`Skipping ${routePath} - file not found`);
  }
});

console.log("Dynamic import fixes completed!");
