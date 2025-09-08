/**
 * Create placeholder images for hairstyles using Unsplash
 * This gives you immediate preview images while you generate AI ones
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Unsplash image URLs for different hairstyles (royalty-free)
const PLACEHOLDER_IMAGES = {
  'beach-waves.jpg': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=500&fit=crop&crop=face',
  'blunt-cut.jpg': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop&crop=face',
  'classic-bob.jpg': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=500&fit=crop&crop=face',
  'curtain-bangs.jpg': 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=500&fit=crop&crop=face',
  'long-bob.jpg': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop&crop=face',
  'long-layers.jpg': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face',
  'modern-shag.jpg': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop&crop=face',
  'pixie-cut.jpg': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=500&fit=crop&crop=face'
};

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../public/hairstyle-previews', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', reject);
  });
}

async function createPlaceholderImages() {
  console.log('📸 Creating placeholder images for immediate use...');
  
  try {
    // Ensure directory exists
    const previewDir = path.join(__dirname, '../public/hairstyle-previews');
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }
    
    // Download all placeholder images
    for (const [filename, url] of Object.entries(PLACEHOLDER_IMAGES)) {
      await downloadImage(url, filename);
      // Small delay to be respectful to Unsplash
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Placeholder images created successfully!');
    console.log('📋 Next Steps:');
    console.log('1. Refresh your app to see the preview images');
    console.log('2. Generate AI images using the prompts in database/ai-prompts/');
    console.log('3. Replace placeholders with your AI-generated images');
    
  } catch (error) {
    console.error('❌ Error creating placeholder images:', error);
  }
}

createPlaceholderImages();
