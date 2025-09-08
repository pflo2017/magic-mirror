/**
 * Clean up duplicate and redundant hairstyles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate and redundant hairstyles...');
  
  try {
    // Get all current women's hairstyles
    const { data: styles, error } = await supabase
      .from('styles')
      .select('*')
      .eq('category', 'women_hairstyles')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching styles:', error);
      return;
    }
    
    console.log(`📊 Found ${styles.length} women's hairstyles`);
    
    // Define duplicates and redundant styles to remove
    const stylesToRemove = [
      'Long Bob (Lob)', // Keep "Lob (Long Bob)" instead
      'Blunt Cut', // Too similar to "Blunt Bob"
      'Shag Cut', // Keep "Modern Shag" instead
    ];
    
    // Define styles to update/rename for clarity
    const stylesToUpdate = [
      {
        oldName: 'Lob (Long Bob)',
        newName: 'Long Bob',
        newDescription: 'Sophisticated shoulder-length bob that hits at the collarbone, versatile and modern'
      },
      {
        oldName: 'Modern Shag',
        newName: 'Shag Cut',
        newDescription: 'Heavily layered cut with feathered ends, rock-and-roll attitude, and lots of texture'
      }
    ];
    
    let removedCount = 0;
    let updatedCount = 0;
    
    // Remove duplicates
    console.log('\n🗑️  Removing duplicate styles...');
    for (const styleName of stylesToRemove) {
      const { error: deleteError } = await supabase
        .from('styles')
        .delete()
        .eq('name', styleName)
        .eq('category', 'women_hairstyles');
      
      if (deleteError) {
        console.error(`❌ Error removing ${styleName}:`, deleteError);
      } else {
        console.log(`✅ Removed: ${styleName}`);
        removedCount++;
      }
    }
    
    // Update style names for clarity
    console.log('\n✏️  Updating style names...');
    for (const update of stylesToUpdate) {
      const { error: updateError } = await supabase
        .from('styles')
        .update({
          name: update.newName,
          description: update.newDescription
        })
        .eq('name', update.oldName)
        .eq('category', 'women_hairstyles');
      
      if (updateError) {
        console.error(`❌ Error updating ${update.oldName}:`, updateError);
      } else {
        console.log(`✅ Updated: "${update.oldName}" → "${update.newName}"`);
        updatedCount++;
      }
    }
    
    // Get final count
    const { data: finalStyles, error: finalError } = await supabase
      .from('styles')
      .select('name')
      .eq('category', 'women_hairstyles')
      .order('name', { ascending: true });
    
    if (!finalError) {
      console.log(`\n🎉 Cleanup complete!`);
      console.log(`📊 Final count: ${finalStyles.length} women's hairstyles`);
      console.log(`🗑️  Removed: ${removedCount} duplicates`);
      console.log(`✏️  Updated: ${updatedCount} style names`);
      
      console.log('\n📋 Final women\'s hairstyles list:');
      finalStyles.forEach((style, index) => {
        console.log(`   ${index + 1}. ${style.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupDuplicates();
