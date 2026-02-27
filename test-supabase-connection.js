// Test Supabase Connection and Database Setup
// Run this with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const match = line.match(/^VITE_(\w+)=(.+)$/);
    if (match) {
      envVars[match[1]] = match[2].trim();
    }
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('API Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');
console.log('');

if (!supabaseUrl || !supabaseKey || 
    supabaseUrl.includes('your_supabase') || 
    supabaseKey.includes('your_supabase')) {
  console.error('❌ ERROR: Supabase credentials not configured!');
  console.log('\n📝 Please edit your .env file and add your actual Supabase credentials.');
  console.log('You can find them at: https://app.supabase.com -> Your Project -> Settings -> API\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('✅ Supabase client created successfully!\n');
    
    // Test 1: Check Auth
    console.log('📋 Test 1: Checking Authentication Service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('⚠️  No active session (this is OK - you need to sign in through the app)');
    } else {
      console.log('✅ Authentication service is working!');
    }
    console.log('');
    
    // Test 2: Check Categories Table
    console.log('📋 Test 2: Checking Categories Table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ ERROR accessing categories table:', catError.message);
      console.log('💡 This table might not exist yet. Run the SQL setup script!');
    } else {
      console.log('✅ Categories table exists!');
      console.log(`   Found ${categories.length} categories`);
    }
    console.log('');
    
    // Test 3: Check Products Table
    console.log('📋 Test 3: Checking Products Table...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (prodError) {
      console.error('❌ ERROR accessing products table:', prodError.message);
      console.log('💡 This table might not exist yet. Run the SQL setup script!');
    } else {
      console.log('✅ Products table exists!');
      console.log(`   Found ${products.length} products`);
    }
    console.log('');
    
    // Test 4: Check Transactions Table
    console.log('📋 Test 4: Checking Transactions Table...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (transError) {
      console.error('❌ ERROR accessing transactions table:', transError.message);
      console.log('💡 This table might not exist yet. Run the SQL setup script!');
    } else {
      console.log('✅ Transactions table exists!');
      console.log(`   Found ${transactions.length} transactions`);
    }
    console.log('');
    
    // Test 5: Check Shop Expenses Table
    console.log('📋 Test 5: Checking Shop Expenses Table...');
    const { data: expenses, error: expError } = await supabase
      .from('shop_expenses')
      .select('*')
      .limit(5);
    
    if (expError) {
      console.error('❌ ERROR accessing shop_expenses table:', expError.message);
      console.log('💡 This table might not exist yet. Run the SQL setup script!');
    } else {
      console.log('✅ Shop Expenses table exists!');
      console.log(`   Found ${expenses.length} expenses`);
    }
    console.log('');
    
    // Test 6: Check Other Sales Table
    console.log('📋 Test 6: Checking Other Sales Table...');
    const { data: otherSales, error: salesError } = await supabase
      .from('other_sales')
      .select('*')
      .limit(5);
    
    if (salesError) {
      console.error('❌ ERROR accessing other_sales table:', salesError.message);
      console.log('💡 This table might not exist yet. Run the SQL setup script!');
    } else {
      console.log('✅ Other Sales table exists!');
      console.log(`   Found ${otherSales.length} other sales records`);
    }
    console.log('');
    
    // Test 7: Check Storage Bucket
    console.log('📋 Test 7: Checking Storage Bucket...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ ERROR accessing storage:', bucketError.message);
    } else {
      const productImagesBucket = buckets.find(b => b.id === 'product-images');
      if (productImagesBucket) {
        console.log('✅ Product images storage bucket exists!');
        console.log(`   Bucket: ${productImagesBucket.name} (public: ${productImagesBucket.public})`);
      } else {
        console.log('⚠️  Product images bucket not found. Run the SQL setup script!');
      }
    }
    console.log('');
    
    // Summary
    console.log('='.repeat(60));
    console.log('📊 CONNECTION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allGood = !catError && !prodError && !transError && !expError && !salesError;
    
    if (allGood) {
      console.log('🎉 SUCCESS! All database tables are set up correctly!');
      console.log('✅ Your Le Frut POS system is ready to use!');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Open http://localhost:5173 in your browser');
      console.log('  2. Sign up for a new account');
      console.log('  3. Start using your POS system!');
    } else {
      console.log('⚠️  SETUP REQUIRED!');
      console.log('');
      console.log('Some tables are missing. Please run the database setup:');
      console.log('  1. Go to: https://app.supabase.com');
      console.log('  2. Select your project');
      console.log('  3. Go to SQL Editor');
      console.log('  4. Open: supabase/setup_complete_database.sql');
      console.log('  5. Copy and paste the entire SQL script');
      console.log('  6. Click "Run" to execute');
      console.log('  7. Run this test again: node test-supabase-connection.js');
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error.message);
    console.log('\n💡 Make sure your .env file has the correct Supabase credentials.');
  }
}

testConnection();

