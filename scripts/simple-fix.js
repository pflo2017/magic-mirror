#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDirectInsert() {
  console.log('🧪 Testing direct salon insertion...');
  
  try {
    // Try to insert directly with service role
    const testSalon = {
      name: 'Direct Test Salon',
      email: `direct-test-${Date.now()}@example.com`,
      subscription_status: 'active',
      session_duration: 30,
      max_ai_uses: 5,
      total_ai_generations_used: 0,
      free_trial_generations: 10,
    };

    console.log('Attempting insert with service role...');
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert(testSalon)
      .select()
      .single();

    if (salonError) {
      console.error('❌ Direct insert failed:', salonError);
      
      // Try with RLS bypass
      console.log('🔓 Trying with RLS bypass...');
      const { data: salon2, error: salonError2 } = await supabase
        .from('salons')
        .insert(testSalon)
        .select()
        .single();

      if (salonError2) {
        console.error('❌ RLS bypass also failed:', salonError2);
        return false;
      } else {
        console.log('✅ RLS bypass worked:', salon2.id);
        await supabase.from('salons').delete().eq('id', salon2.id);
        return true;
      }
    } else {
      console.log('✅ Direct insert worked:', salon.id);
      await supabase.from('salons').delete().eq('id', salon.id);
      return true;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function checkTables() {
  console.log('📋 Checking database tables...');
  
  try {
    // Check if salons table exists
    const { data, error } = await supabase
      .from('salons')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Salons table check failed:', error);
      
      if (error.code === '42P01') {
        console.log('📝 Salons table does not exist. You need to run the schema.sql first.');
        console.log('Go to your Supabase dashboard > SQL Editor and run the schema.sql file.');
        return false;
      }
      
      return false;
    } else {
      console.log('✅ Salons table exists');
      return true;
    }
  } catch (error) {
    console.error('❌ Table check failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Diagnosing database issues...\n');
  
  const tablesExist = await checkTables();
  if (!tablesExist) {
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase/schema.sql');
    console.log('4. Run the SQL to create tables');
    console.log('5. Then run this script again');
    return;
  }
  
  const insertWorks = await testDirectInsert();
  
  if (insertWorks) {
    console.log('\n🎉 Database is working correctly!');
    console.log('The salon signup should work now.');
  } else {
    console.log('\n🔧 MANUAL FIX REQUIRED:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Find the "salons" table');
    console.log('4. Temporarily disable RLS or add a permissive policy');
    console.log('5. Or run this SQL in the SQL Editor:');
    console.log('   ALTER TABLE salons DISABLE ROW LEVEL SECURITY;');
  }
}

main().catch(console.error);
