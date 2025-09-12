/**
 * Test the reference image system
 */

const fs = require('fs');
const path = require('path');

async function testReferenceSystem() {
  console.log('🧪 Testing reference image system...');
  
  try {
    // Test 1: Check if reference image exists
    const filename = 'butterfly-haircut.png';
    const imagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', filename);
    
    console.log(`🔍 Looking for: ${imagePath}`);
    
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      console.log(`✅ Reference image found!`);
      console.log(`   Size: ${stats.size} bytes`);
      console.log(`   Modified: ${stats.mtime}`);
      
      // Test 2: Try to read and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString('base64');
      
      console.log(`✅ Successfully converted to base64`);
      console.log(`   Base64 length: ${base64.length} characters`);
      console.log(`   First 50 chars: ${base64.substring(0, 50)}...`);
      
      // Test 3: Check if it's a valid PNG
      const isPNG = base64.startsWith('iVBORw0KGgo');
      console.log(`✅ Valid PNG format: ${isPNG}`);
      
    } else {
      console.log(`❌ Reference image not found at: ${imagePath}`);
      
      // Check alternative locations
      const altPath = path.join(__dirname, '../public/hairstyle-previews', filename);
      console.log(`🔍 Checking alternative: ${altPath}`);
      
      if (fs.existsSync(altPath)) {
        console.log(`✅ Found at alternative location!`);
      } else {
        console.log(`❌ Not found at alternative location either`);
      }
    }
    
    // Test 4: List all available preview images
    const previewDir = path.join(process.cwd(), 'public', 'hairstyle-previews');
    if (fs.existsSync(previewDir)) {
      const files = fs.readdirSync(previewDir);
      console.log(`\n📁 Available preview images (${files.length}):`);
      files.forEach(file => {
        if (file.endsWith('.png')) {
          console.log(`   • ${file}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReferenceSystem();

