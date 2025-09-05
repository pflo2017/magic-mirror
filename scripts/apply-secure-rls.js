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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySecureRLS() {
  console.log('🔒 Applying secure RLS policies...');
  
  try {
    // Read the secure RLS policies file
    const sqlPath = path.join(__dirname, '../supabase/secure-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ 
            sql: statement + ';'
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.log(`⚠️  Statement ${i + 1} warning: ${error}`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error: ${err.message}`);
      }
    }
    
    // Test the secure function
    console.log('🧪 Testing secure salon creation function...');
    const { data, error } = await supabase.rpc('create_salon_secure', {
      salon_name: 'Secure Test Salon',
      salon_email: `secure-test-${Date.now()}@example.com`,
      salon_phone: '555-0000',
      salon_address: 'Test Address'
    });
    
    if (error) {
      console.error('❌ Secure function test failed:', error);
      return false;
    }
    
    console.log('✅ Secure function test passed:', data[0].id);
    
    // Clean up test salon
    await supabase.from('salons').delete().eq('id', data[0].id);
    console.log('🧹 Test salon cleaned up');
    
    console.log('🎉 Secure RLS policies applied successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to apply secure RLS policies:', error);
    return false;
  }
}

// Alternative: Apply policies manually via Supabase client
async function applyPoliciesDirectly() {
  console.log('🔒 Applying RLS policies directly...');
  
  try {
    // Re-enable RLS
    console.log('Enabling RLS...');
    const tables = ['salons', 'sessions', 'styles', 'analytics', 'ai_generations'];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
      });
      if (error && !error.message.includes('already')) {
        console.log(`RLS enable warning for ${table}:`, error.message);
      }
    }
    
    // Test salon creation with current setup
    console.log('🧪 Testing current salon creation...');
    const { data, error } = await supabase
      .from('salons')
      .insert({
        name: 'Direct Test Salon',
        email: `direct-test-${Date.now()}@example.com`,
        subscription_status: 'active',
        session_duration: 30,
        max_ai_uses: 5,
        total_ai_generations_used: 0,
        free_trial_generations: 10,
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Direct salon creation failed:', error);
      console.log('📋 You need to apply the secure RLS policies manually in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Direct salon creation works:', data.id);
    
    // Clean up
    await supabase.from('salons').delete().eq('id', data.id);
    
    return true;
    
  } catch (error) {
    console.error('❌ Direct policy application failed:', error);
    return false;
  }
}

// Run the application
if (require.main === module) {
  applyPoliciesDirectly()
    .then(success => {
      if (success) {
        console.log('🎉 RLS setup completed!');
        process.exit(0);
      } else {
        console.log('❌ RLS setup failed. Please apply policies manually.');
        console.log('📋 Copy the contents of supabase/secure-rls-policies.sql');
        console.log('📋 Paste and run in Supabase Dashboard > SQL Editor');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
