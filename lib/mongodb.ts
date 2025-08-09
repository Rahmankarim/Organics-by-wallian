import { MongoClient } from "mongodb"

// Only throw error if not in build mode and MONGODB_URI is missing
if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: MONGODB_URI not found. Database functionality will be disabled.')
}

// Provide a default URI for build time if missing
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fallback'
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Only create connection if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
} else {
  // Create a mock promise for build time
  clientPromise = Promise.reject(new Error('MongoDB URI not configured'))
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
