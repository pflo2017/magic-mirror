/**
 * Script to generate consistent preview images for hairstyles
 * Uses Unsplash API to find professional hairstyle photos
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Get from https://unsplash.com/developers

/**
 * Search for hairstyle images on Unsplash
 */
async function searchHairstyleImage(styleName, category) {
  const query = `${styleName} hairstyle woman salon professional`;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait&client_id=${UNSPLASH_ACCESS_KEY}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.results && result.results.length > 0) {
            // Return the first high-quality image
            const image = result.results[0];
            resolve({
              url: image.urls.regular,
              download_url: image.urls.full,
              photographer: image.user.name,
              unsplash_id: image.id
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Generate AI-created preview images using consistent character
 */
function generateAIPreviewPrompts() {
  return {
    "long-layers": {
      prompt: "Professional headshot of a woman with long layered hair, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    },
    "pixie-cut": {
      prompt: "Professional headshot of a woman with short pixie cut hair, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    },
    "bob-cut": {
      prompt: "Professional headshot of a woman with classic bob haircut, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    },
    "beach-waves": {
      prompt: "Professional headshot of a woman with beach wave hairstyle, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    },
    "shag-cut": {
      prompt: "Professional headshot of a woman with modern shag haircut, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    },
    "lob-cut": {
      prompt: "Professional headshot of a woman with long bob (lob) haircut, studio lighting, clean background, front-facing, hair styling showcase, salon quality",
      style: "photorealistic portrait"
    }
  };
}

/**
 * Create consistent preview images using AI generation
 */
async function generateConsistentPreviews() {
  console.log('🎨 Generating AI preview prompts for consistent character...');
  
  const prompts = generateAIPreviewPrompts();
  const outputPath = path.join(__dirname, '../database/preview-prompts.json');
  
  const previewData = {
    base_character: {
      description: "Professional female model, 25-30 years old, neutral expression, studio lighting, clean white/gray background",
      consistency_notes: "Use the same model face and lighting setup for all hairstyle previews to maintain consistency"
    },
    hairstyle_prompts: prompts,
    generation_settings: {
      aspect_ratio: "3:4",
      quality: "high",
      style: "photorealistic",
      lighting: "professional studio lighting",
      background: "clean, neutral background"
    },
    recommended_ai_tools: [
      "Midjourney (--ar 3:4 --style raw)",
      "DALL-E 3 (square format, photorealistic)",
      "Stable Diffusion XL (portrait mode)",
      "Leonardo AI (PhotoReal model)"
    ]
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(previewData, null, 2));
  console.log(`✅ Preview prompts saved to: ${outputPath}`);
  
  // Generate individual prompt files for easy copy-paste
  const promptsDir = path.join(__dirname, '../database/individual-prompts');
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  
  Object.entries(prompts).forEach(([styleId, data]) => {
    const fullPrompt = `${previewData.base_character.description}, ${data.prompt}`;
    fs.writeFileSync(
      path.join(promptsDir, `${styleId}.txt`),
      fullPrompt
    );
  });
  
  console.log(`✅ Individual prompts saved to: ${promptsDir}`);
}

/**
 * Main function to generate preview images
 */
async function generatePreviewImages() {
  console.log('🖼️  Starting preview image generation...');
  
  try {
    // Method 1: Generate AI prompts for consistent character
    await generateConsistentPreviews();
    
    // Method 2: Search Unsplash for reference images (if API key provided)
    if (UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.log('\n🔍 Searching Unsplash for reference images...');
      
      const hairstyles = [
        { id: 'long-layers', name: 'Long Layers', category: 'long' },
        { id: 'pixie-cut', name: 'Pixie Cut', category: 'short' },
        { id: 'bob-cut', name: 'Classic Bob', category: 'medium' },
        { id: 'beach-waves', name: 'Beach Waves', category: 'medium' },
        { id: 'shag-cut', name: 'Modern Shag', category: 'medium' },
        { id: 'lob-cut', name: 'Long Bob', category: 'medium' }
      ];
      
      const references = {};
      
      for (const style of hairstyles) {
        console.log(`🔍 Searching for: ${style.name}`);
        const image = await searchHairstyleImage(style.name, style.category);
        if (image) {
          references[style.id] = image;
          console.log(`✅ Found reference for: ${style.name}`);
        } else {
          console.log(`❌ No reference found for: ${style.name}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Save reference images data
      const referencePath = path.join(__dirname, '../database/reference-images.json');
      fs.writeFileSync(referencePath, JSON.stringify(references, null, 2));
      console.log(`✅ Reference images saved to: ${referencePath}`);
    }
    
    console.log('\n🎉 Preview image generation completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Use the AI prompts to generate consistent character previews');
    console.log('2. Save generated images to /public/hairstyle-previews/');
    console.log('3. Update the database JSON with correct image URLs');
    console.log('4. Run the populate-hairstyles.js script');
    
  } catch (error) {
    console.error('❌ Error generating preview images:', error);
  }
}

// Run the script
generatePreviewImages();
