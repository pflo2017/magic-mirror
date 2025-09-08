/**
 * Add additional bang/fringe styles for women
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addBangStyles() {
  console.log('💇‍♀️ Adding additional bang/fringe styles for women...');
  
  try {
    // Read the additional bang styles
    const bangsData = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../database/additional-bang-styles.json'), 
      'utf8'
    ));
    
    let addedCount = 0;
    
    console.log('\n✂️ Adding new bang styles...');
    for (const style of bangsData.additional_bangs) {
      const { error } = await supabase
        .from('styles')
        .insert({
          name: style.name,
          category: style.category,
          description: style.description,
          prompt: {
            instruction: style.instruction
          },
          image_url: null, // No preview images for now
          is_active: true
        });
      
      if (error) {
        console.error(`❌ Error adding ${style.name}:`, error);
      } else {
        console.log(`✅ Added: ${style.name}`);
        console.log(`   Description: ${style.description}`);
        addedCount++;
      }
    }
    
    // Get final count of women's hairstyles
    const { data: finalStyles, error: finalError } = await supabase
      .from('styles')
      .select('name')
      .eq('category', 'women_hairstyles')
      .order('name', { ascending: true });
    
    if (!finalError) {
      console.log(`\n🎉 Successfully added ${addedCount} new bang styles!`);
      console.log(`📊 Total women's hairstyles: ${finalStyles.length}`);
      
      // Show all bang styles
      const bangStyles = finalStyles.filter(style => 
        style.name.toLowerCase().includes('bang') || 
        style.name.toLowerCase().includes('french bob')
      );
      
      console.log(`\n💇‍♀️ All bang/fringe styles (${bangStyles.length}):`);
      bangStyles.forEach((style, index) => {
        console.log(`   ${index + 1}. ${style.name}`);
      });
      
      console.log('\n✨ Women can now generate hairstyles like yours with blunt bangs!');
    }
    
  } catch (error) {
    console.error('❌ Error adding bang styles:', error);
  }
}

addBangStyles();
