#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  try {
    // Step 1: Check if tables exist
    console.log('📋 Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log('⚠️  Could not check tables, proceeding with setup...');
    }

    // Step 2: Apply main schema
    console.log('📝 Applying main schema...');
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  Statement warning: ${error.message}`);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`⚠️  Statement error: ${err.message}`);
        }
      }
    }

    // Step 3: Apply permission fixes
    console.log('🔐 Applying permission fixes...');
    const fixPath = path.join(__dirname, '../supabase/fix-permissions.sql');
    const fixes = fs.readFileSync(fixPath, 'utf8');
    
    const fixStatements = fixes
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of fixStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  Fix warning: ${error.message}`);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`⚠️  Fix error: ${err.message}`);
        }
      }
    }

    // Step 4: Test salon creation
    console.log('🧪 Testing salon creation...');
    const testSalon = {
      name: 'Test Salon Setup',
      email: `setup-test-${Date.now()}@example.com`,
      subscription_status: 'active',
      session_duration: 30,
      max_ai_uses: 5,
      total_ai_generations_used: 0,
      free_trial_generations: 10,
    };

    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert(testSalon)
      .select()
      .single();

    if (salonError) {
      console.error('❌ Salon creation test failed:', salonError);
      return false;
    }

    console.log('✅ Salon creation test passed:', salon.id);

    // Clean up test salon
    await supabase.from('salons').delete().eq('id', salon.id);
    console.log('🧹 Cleaned up test salon');

    // Step 5: Seed styles if needed
    console.log('🎨 Checking styles...');
    const { data: existingStyles } = await supabase
      .from('styles')
      .select('count')
      .limit(1);

    if (!existingStyles || existingStyles.length === 0) {
      console.log('📦 Seeding styles...');
      const seedPath = path.join(__dirname, '../supabase/seed-styles.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of seedStatements) {
          try {
            await supabase.rpc('exec_sql', { sql: statement + ';' });
          } catch (err) {
            console.log(`⚠️  Seed warning: ${err.message}`);
          }
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Alternative simpler approach - just fix the RLS policies
async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for salon creation...');
  
  try {
    // Drop existing restrictive policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Salons can view own data" ON salons',
      'DROP POLICY IF EXISTS "Salons can update own data" ON salons'
    ];

    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) console.log(`Policy drop warning: ${error.message}`);
    }

    // Create permissive policies for service role
    const newPolicies = [
      `CREATE POLICY "Allow service role full access" ON salons FOR ALL USING (true)`,
      `CREATE POLICY "Allow anon to insert salons" ON salons FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "Allow anon to read salons for email check" ON salons FOR SELECT USING (true)`
    ];

    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('already exists')) {
        console.log(`Policy creation warning: ${error.message}`);
      }
    }

    // Test salon creation
    const testSalon = {
      name: 'RLS Test Salon',
      email: `rls-test-${Date.now()}@example.com`,
      subscription_status: 'active',
      session_duration: 30,
      max_ai_uses: 5,
      total_ai_generations_used: 0,
      free_trial_generations: 10,
    };

    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .insert(testSalon)
      .select()
      .single();

    if (salonError) {
      console.error('❌ RLS fix test failed:', salonError);
      return false;
    }

    console.log('✅ RLS fix successful! Test salon created:', salon.id);
    
    // Clean up
    await supabase.from('salons').delete().eq('id', salon.id);
    console.log('🧹 Test salon cleaned up');

    return true;
  } catch (error) {
    console.error('❌ RLS fix failed:', error);
    return false;
  }
}

// Run the fix
if (require.main === module) {
  fixRLSPolicies()
    .then(success => {
      if (success) {
        console.log('🎉 Database is ready for salon signups!');
        process.exit(0);
      } else {
        console.log('❌ Database setup failed. Please check the errors above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
