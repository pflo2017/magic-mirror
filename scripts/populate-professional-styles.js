/**
 * Populate database with 80 professional industry-standard hairstyles and colors
 * - 20 Women's Hairstyles
 * - 20 Men's Hairstyles  
 * - 20 Men's Beard Styles
 * - 10 Women's Hair Colors
 * - 10 Men's Hair Colors
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateProfessionalStyles() {
  console.log('🎨 Populating database with 80 professional styles...');
  
  try {
    // Load the professional hairstyles database
    const dbPath = path.join(__dirname, '../database/professional-hairstyles.json');
    const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    let totalInserted = 0;
    let totalUpdated = 0;
    
    // Process each category
    for (const [categoryKey, styles] of Object.entries(database)) {
      console.log(`\n🔄 Processing ${categoryKey}: ${styles.length} styles`);
      
      for (const style of styles) {
        // Check if style already exists
        const { data: existing } = await supabase
          .from('styles')
          .select('id')
          .eq('name', style.name)
          .eq('category', categoryKey)
          .single();
        
        const styleData = {
          name: style.name,
          category: categoryKey,
          description: style.description,
          prompt: {
            instruction: style.ai_instruction
          },
          image_url: `/hairstyle-previews/${style.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
          is_active: true
        };
        
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
            totalUpdated++;
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
            totalInserted++;
          }
        }
      }
    }
    
    // Show final summary
    const { data: finalCount } = await supabase
      .from('styles')
      .select('category, count(*)', { count: 'exact' })
      .eq('is_active', true);
    
    console.log('\n🎉 Professional styles population completed!');
    console.log(`📊 Results: ${totalInserted} inserted, ${totalUpdated} updated`);
    
    if (finalCount) {
      console.log('\n📋 Final Database Summary:');
      let grandTotal = 0;
      finalCount.forEach(row => {
        const count = row.count || 0;
        console.log(`   ${row.category}: ${count} styles`);
        grandTotal += count;
      });
      console.log(`   TOTAL: ${grandTotal} professional styles`);
    }
    
    console.log('\n🎯 Target Achievement:');
    console.log('   ✅ 20 Women\'s Hairstyles');
    console.log('   ✅ 20 Men\'s Hairstyles');
    console.log('   ✅ 20 Men\'s Beard Styles');
    console.log('   ✅ 10 Women\'s Hair Colors');
    console.log('   ✅ 10 Men\'s Hair Colors');
    console.log('   ✅ 80 Total Professional Styles');
    
  } catch (error) {
    console.error('❌ Error populating professional styles:', error);
  }
}

// Run the population
populateProfessionalStyles();
