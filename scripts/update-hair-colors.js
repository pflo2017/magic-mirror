/**
 * Update hair colors in database with professional salon names and proper color palettes
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateHairColors() {
  console.log('🎨 Updating hair colors with professional salon names and color palettes...');
  
  try {
    // Read the professional hair colors
    const colorsData = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../database/professional-hair-colors.json'), 
      'utf8'
    ));
    
    // First, delete all existing color entries
    console.log('🗑️  Removing old color entries...');
    await supabase
      .from('styles')
      .delete()
      .in('category', ['women_colors', 'men_colors']);
    
    let totalInserted = 0;
    
    // Insert women's colors
    console.log('\n👩 Inserting women\'s hair colors...');
    for (const color of colorsData.women_colors) {
      const { error } = await supabase
        .from('styles')
        .insert({
          name: color.name,
          category: color.category,
          description: color.description,
          prompt: {
            instruction: color.instruction,
            hex_color: color.hex_color
          },
          image_url: null, // No preview images for colors
          is_active: true
        });
      
      if (error) {
        console.error(`❌ Error inserting ${color.name}:`, error);
      } else {
        console.log(`✅ ${color.name} (${color.hex_color})`);
        totalInserted++;
      }
    }
    
    // Insert men's colors
    console.log('\n👨 Inserting men\'s hair colors...');
    for (const color of colorsData.men_colors) {
      const { error } = await supabase
        .from('styles')
        .insert({
          name: color.name,
          category: color.category,
          description: color.description,
          prompt: {
            instruction: color.instruction,
            hex_color: color.hex_color
          },
          image_url: null, // No preview images for colors
          is_active: true
        });
      
      if (error) {
        console.error(`❌ Error inserting ${color.name}:`, error);
      } else {
        console.log(`✅ ${color.name} (${color.hex_color})`);
        totalInserted++;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${totalInserted} hair colors!`);
    console.log('\n📊 Summary:');
    console.log(`   Women's Colors: ${colorsData.women_colors.length}`);
    console.log(`   Men's Colors: ${colorsData.men_colors.length}`);
    console.log('\n✨ All colors now have:');
    console.log('   ✅ Professional salon industry names');
    console.log('   ✅ Proper hex color codes for UI display');
    console.log('   ✅ Detailed AI instructions for color transformation');
    
    // Verify the update
    const { data: updatedColors, error: fetchError } = await supabase
      .from('styles')
      .select('category, name')
      .in('category', ['women_colors', 'men_colors'])
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (!fetchError) {
      console.log('\n🔍 Verification - Colors in database:');
      const womenColors = updatedColors.filter(c => c.category === 'women_colors');
      const menColors = updatedColors.filter(c => c.category === 'men_colors');
      
      console.log(`\n👩 Women's Colors (${womenColors.length}):`);
      womenColors.forEach(color => console.log(`   • ${color.name}`));
      
      console.log(`\n👨 Men's Colors (${menColors.length}):`);
      menColors.forEach(color => console.log(`   • ${color.name}`));
    }
    
  } catch (error) {
    console.error('❌ Error updating hair colors:', error);
  }
}

// Also clear image URLs for hairstyles since we removed the ugly SVGs
async function clearHairstyleImages() {
  console.log('\n🖼️  Clearing image URLs for hairstyles (removed ugly SVGs)...');
  
  try {
    const { error } = await supabase
      .from('styles')
      .update({ image_url: null })
      .in('category', ['women_hairstyles', 'men_hairstyles', 'men_beards']);
    
    if (error) {
      console.error('❌ Error clearing image URLs:', error);
    } else {
      console.log('✅ Cleared all hairstyle image URLs');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run both updates
async function runUpdates() {
  await updateHairColors();
  await clearHairstyleImages();
  console.log('\n🎯 All updates complete! Refresh your app to see the changes.');
}

runUpdates();

