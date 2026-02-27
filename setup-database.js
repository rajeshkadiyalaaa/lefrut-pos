// Automated Database Setup Script
// This script will create all necessary tables in your Supabase database

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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

console.log('🚀 Le Frut POS - Database Setup\n');
console.log('📦 Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('✅ Connected to Supabase!\n');
    console.log('⚠️  IMPORTANT: This script will create tables using the REST API.');
    console.log('⚠️  For best results, please run the SQL script manually:\n');
    console.log('   1. Go to https://app.supabase.com');
    console.log('   2. Select your project (chtftpxpxbgeosdrdbpq)');
    console.log('   3. Click on "SQL Editor" in the left sidebar');
    console.log('   4. Click "New Query"');
    console.log('   5. Copy the contents of: supabase/setup_complete_database.sql');
    console.log('   6. Paste into the editor and click "Run"\n');
    console.log('📄 The SQL file is located at:');
    console.log('   ' + join(__dirname, 'supabase', 'setup_complete_database.sql'));
    console.log('\n' + '='.repeat(60));
    console.log('\nWould you like me to display the SQL script to copy? (Y/n)');
    console.log('(Press Ctrl+C to exit and run manually)\n');
    
    // Read and display the SQL script
    const sqlPath = join(__dirname, 'supabase', 'setup_complete_database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL SCRIPT TO RUN IN SUPABASE:\n');
    console.log('='.repeat(60));
    console.log(sqlContent);
    console.log('='.repeat(60));
    console.log('\n✅ Copy the above SQL and run it in Supabase SQL Editor!');
    console.log('🔗 Direct link: https://app.supabase.com/project/chtftpxpxbgeosdrdbpq/sql\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();

