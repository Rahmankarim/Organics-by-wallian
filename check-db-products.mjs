import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0';

async function checkProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB (organic_orchard database)');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:', collections.map(c => c.name));
    
    const productCount = await db.collection('products').countDocuments();
    console.log('\nTotal products:', productCount);
    
    if (productCount > 0) {
      const sample = await db.collection('products').find({}).limit(3).toArray();
      console.log('\nSample products:');
      sample.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - Price: ${p.price} - Active: ${p.isActive !== false}`);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
