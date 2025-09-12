/**
 * Script to populate the hairstyles database from the JSON file
 * Run with: node scripts/populate-hairstyles.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateHairstyles() {
  try {
    console.log('🎨 Loading hairstyles database...');
    
    // Load the JSON database
    const dbPath = path.join(__dirname, '../database/hairstyles-database.json');
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    console.log(`📊 Found ${database.women_hairstyles.length} hairstyles to process`);
    
    // Process each hairstyle
    for (const style of database.women_hairstyles) {
      console.log(`\n🔄 Processing: ${style.name}`);
      
      // Prepare the style data for Supabase
      const styleData = {
        name: style.name,
        category: `women_${style.category}`, // e.g., "women_long", "women_short"
        description: style.description,
        prompt: {
          instruction: style.ai_instruction,
          technical_specs: style.technical_specs,
          tags: style.tags
        },
        image_url: style.preview_image,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      // Check if style already exists
      const { data: existing } = await supabase
        .from('styles')
        .select('id')
        .eq('name', style.name)
        .eq('category', styleData.category)
        .single();
      
      if (existing) {
        // Update existing style
        const { error } = await supabase
          .from('styles')
          .update(styleData)
          .eq('id', existing.id);
          
        if (error) {
          console.error(`❌ Error updating ${style.name}:`, error);
        } else {
          console.log(`✅ Updated: ${style.name}`);
        }
      } else {
        // Insert new style
        const { error } = await supabase
          .from('styles')
          .insert(styleData);
          
        if (error) {
          console.error(`❌ Error inserting ${style.name}:`, error);
        } else {
          console.log(`✅ Inserted: ${style.name}`);
        }
      }
    }
    
    // Process color variations
    console.log(`\n🎨 Processing ${database.color_variations.length} color variations...`);
    
    for (const color of database.color_variations) {
      const colorData = {
        name: color.name,
        category: 'women_colors',
        description: color.description,
        prompt: {
          instruction: color.ai_instruction
        },
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      const { data: existing } = await supabase
        .from('styles')
        .select('id')
        .eq('name', color.name)
        .eq('category', 'women_colors')
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('styles')
          .update(colorData)
          .eq('id', existing.id);
          
        if (error) {
          console.error(`❌ Error updating ${color.name}:`, error);
        } else {
          console.log(`✅ Updated color: ${color.name}`);
        }
      } else {
        const { error } = await supabase
          .from('styles')
          .insert(colorData);
          
        if (error) {
          console.error(`❌ Error inserting ${color.name}:`, error);
        } else {
          console.log(`✅ Inserted color: ${color.name}`);
        }
      }
    }
    
    console.log('\n🎉 Hairstyles database population completed!');
    
    // Show summary
    const { data: totalStyles } = await supabase
      .from('styles')
      .select('category, count(*)', { count: 'exact' })
      .eq('is_active', true);
      
    console.log('\n📊 Database Summary:');
    if (totalStyles) {
      totalStyles.forEach(row => {
        console.log(`   ${row.category}: ${row.count} styles`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error populating hairstyles:', error);
  }
}

// Run the script
populateHairstyles();

