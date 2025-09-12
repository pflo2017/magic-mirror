/**
 * Import women's hairstyle images from Desktop and update database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importWomenStyleImages() {
  console.log('📸 Importing women\'s hairstyle images...');
  
  try {
    // Source and destination paths
    const sourceDir = path.join(process.env.HOME, 'Desktop', 'women style');
    const destDir = path.join(__dirname, '../public/hairstyle-previews');
    
    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Get all styles from database
    const { data: styles, error } = await supabase
      .from('styles')
      .select('id, name, category')
      .eq('category', 'women_hairstyles')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching styles:', error);
      return;
    }
    
    console.log(`📊 Found ${styles.length} women's hairstyles in database`);
    
    // Get all image files from source directory
    const imageFiles = fs.readdirSync(sourceDir)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .sort();
    
    console.log(`📁 Found ${imageFiles.length} PNG images in source folder`);
    console.log('\n📋 Available images:');
    imageFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    let copiedCount = 0;
    let updatedCount = 0;
    
    console.log('\n🔄 Processing images...');
    
    for (const style of styles) {
      // Find matching image file (case-insensitive)
      const matchingFile = imageFiles.find(file => {
        const fileName = file.replace('.png', '');
        return fileName.toLowerCase() === style.name.toLowerCase();
      });
      
      if (matchingFile) {
        // Generate clean filename
        const cleanFileName = style.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png';
        
        // Copy file
        const sourcePath = path.join(sourceDir, matchingFile);
        const destPath = path.join(destDir, cleanFileName);
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied: ${matchingFile} → ${cleanFileName}`);
        copiedCount++;
        
        // Update database with image URL
        const imageUrl = `/hairstyle-previews/${cleanFileName}`;
        const { error: updateError } = await supabase
          .from('styles')
          .update({ image_url: imageUrl })
          .eq('id', style.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${style.name}:`, updateError);
        } else {
          console.log(`   📝 Updated database: ${style.name} → ${imageUrl}`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️  No image found for: ${style.name}`);
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`📁 Copied: ${copiedCount} images`);
    console.log(`📝 Updated: ${updatedCount} database records`);
    console.log('\n✨ Your app now has beautiful preview images for women\'s hairstyles!');
    
    // List any unmatched images
    const unmatchedImages = imageFiles.filter(file => {
      const fileName = file.replace('.png', '');
      return !styles.some(style => style.name.toLowerCase() === fileName.toLowerCase());
    });
    
    if (unmatchedImages.length > 0) {
      console.log(`\n⚠️  Unmatched images (${unmatchedImages.length}):`);
      unmatchedImages.forEach(file => {
        console.log(`   • ${file}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error importing images:', error);
  }
}

importWomenStyleImages();

