/**
 * Update image URLs to point to SVG placeholders temporarily
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateImageUrls() {
  console.log('🔄 Updating image URLs to SVG placeholders...');
  
  const updates = [
    { name: 'Beach Waves', url: '/hairstyle-previews/beach-waves.svg' },
    { name: 'Blunt Cut', url: '/hairstyle-previews/blunt-cut.svg' },
    { name: 'Classic Bob', url: '/hairstyle-previews/classic-bob.svg' },
    { name: 'Curtain Bangs', url: '/hairstyle-previews/curtain-bangs.svg' },
    { name: 'Long Bob (Lob)', url: '/hairstyle-previews/long-bob.svg' },
    { name: 'Long Layers', url: '/hairstyle-previews/long-layers.svg' },
    { name: 'Modern Shag', url: '/hairstyle-previews/modern-shag.svg' },
    { name: 'Pixie Cut', url: '/hairstyle-previews/pixie-cut.svg' }
  ];
  
  for (const update of updates) {
    const { error } = await supabase
      .from('styles')
      .update({ image_url: update.url })
      .eq('name', update.name)
      .eq('category', 'women_hairstyles');
    
    if (error) {
      console.error(`❌ Error updating ${update.name}:`, error);
    } else {
      console.log(`✅ Updated: ${update.name} → ${update.url}`);
    }
  }
  
  console.log('\n🎉 Image URLs updated! Refresh your app to see placeholders.');
}

updateImageUrls();

