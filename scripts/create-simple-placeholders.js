/**
 * Create simple colored placeholder images for immediate testing
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG placeholder that can be used as an image
function createSVGPlaceholder(text, color = '#8B5CF6') {
  return `<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="500" fill="${color}"/>
    <text x="200" y="250" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
}

const placeholders = {
  'beach-waves.jpg': { text: 'Beach Waves', color: '#3B82F6' },
  'blunt-cut.jpg': { text: 'Blunt Cut', color: '#EF4444' },
  'classic-bob.jpg': { text: 'Classic Bob', color: '#10B981' },
  'curtain-bangs.jpg': { text: 'Curtain Bangs', color: '#F59E0B' },
  'long-bob.jpg': { text: 'Long Bob', color: '#8B5CF6' },
  'long-layers.jpg': { text: 'Long Layers', color: '#EC4899' },
  'modern-shag.jpg': { text: 'Modern Shag', color: '#6366F1' },
  'pixie-cut.jpg': { text: 'Pixie Cut', color: '#84CC16' }
};

function createPlaceholders() {
  console.log('🎨 Creating simple placeholder images...');
  
  const previewDir = path.join(__dirname, '../public/hairstyle-previews');
  
  Object.entries(placeholders).forEach(([filename, config]) => {
    const svgContent = createSVGPlaceholder(config.text, config.color);
    const svgPath = path.join(previewDir, filename.replace('.jpg', '.svg'));
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ Created: ${filename.replace('.jpg', '.svg')}`);
  });
  
  console.log('\n🎉 Placeholder SVGs created!');
  console.log('📋 These will show colored placeholders with hairstyle names');
}

createPlaceholders();

