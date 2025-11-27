import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const uri = envVars.MONGODB_URI;
const client = new MongoClient(uri);

async function testLogin() {
  try {
    await client.connect();
    const db = client.db('organics');
    
    const testEmail = 'wallianreyanali@gmail.com';
    const testPassword = 'Test123!'; // Replace with actual password you used
    
    console.log(`Testing login for: ${testEmail}`);
    console.log(`Test password: ${testPassword}\n`);
    
    const user = await db.collection('users').findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found');
    console.log('Password hash in DB:', user.password);
    console.log('Hash length:', user.password.length);
    console.log();
    
    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (!isMatch) {
      console.log('\n⚠️  Password does not match!');
      console.log('This means either:');
      console.log('1. The test password is wrong');
      console.log('2. The password was double-hashed');
      console.log('3. The password in DB is corrupted\n');
      
      // Try to see if it was double-hashed
      console.log('Testing if password was double-hashed...');
      const rehashed = await bcrypt.hash(testPassword, 12);
      const isDoubleMatch = await bcrypt.compare(rehashed, user.password);
      console.log('Double-hash test:', isDoubleMatch ? '✅ YES - PASSWORD WAS DOUBLE HASHED!' : '❌ No');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testLogin();
