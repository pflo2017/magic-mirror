/**
 * Debug the butterfly haircut transformation directly
 */

const fs = require('fs');
const path = require('path');

async function debugButterflyTransformation() {
  console.log('🔍 Debugging butterfly haircut transformation...');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    // Test 1: Check if we can import the transformation function
    console.log('\n1️⃣ Testing import of transformation function...');
    
    let transformHairWithReference;
    try {
      // Use dynamic import with .js extension for Node.js
      const module = await import('../src/lib/gemini-with-reference.js');
      transformHairWithReference = module.transformHairWithReference;
      console.log('✅ Successfully imported transformHairWithReference');
    } catch (importError) {
      console.log('❌ Failed to import .js, trying direct require...');
      console.log('Import error:', importError.message);
      
      // Try alternative approach - compile TypeScript on the fly
      try {
        require('ts-node/register');
        const module = require('../src/lib/gemini-with-reference.ts');
        transformHairWithReference = module.transformHairWithReference;
        console.log('✅ Successfully imported via ts-node');
      } catch (tsError) {
        console.log('❌ ts-node import failed:', tsError.message);
        
        // Final fallback - test the API endpoint directly
        console.log('💡 Will test via API endpoint instead...');
        return await testViaAPIEndpoint();
      }
    }
    
    // Test 2: Prepare test data
    console.log('\n2️⃣ Preparing test data...');
    
    // Load a small test image
    const testImagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', 'butterfly-haircut.png');
    if (!fs.existsSync(testImagePath)) {
      throw new Error('Test image not found: ' + testImagePath);
    }
    
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`✅ Test image loaded: ${base64Image.length} characters`);
    
    // Test style prompt
    const testStylePrompt = {
      instruction: "Transform the subject's hairstyle into butterfly layers: voluminous layers that flip outward at the ends creating movement. Preserve original face shape and features.",
      name: "Butterfly Layers"
    };
    
    console.log('✅ Test style prompt prepared:', testStylePrompt.name);
    
    // Test 3: Call the transformation function
    console.log('\n3️⃣ Calling transformation function...');
    
    const result = await transformHairWithReference(
      base64Image,
      testStylePrompt,
      'debug-test-session'
    );
    
    console.log('\n📊 Transformation result:');
    console.log('Success:', result.success);
    console.log('Has image URL:', !!result.imageUrl);
    console.log('Error:', result.error);
    console.log('Used AI:', result.usedAI);
    
    if (result.success) {
      console.log('✅ Transformation succeeded!');
      console.log('🔗 Image URL:', result.imageUrl);
    } else {
      console.log('❌ Transformation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Stack:', error.stack);
  }
}

async function testViaAPIEndpoint() {
  console.log('\n🌐 Testing via API endpoint...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Create test data
    const testImagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', 'butterfly-haircut.png');
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    // Make API request
    const response = await fetch('http://localhost:3000/api/session/apply-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: 'debug-test-session',
        style_id: 'test-butterfly-style',
        image_url: dataUrl
      })
    });
    
    const result = await response.json();
    
    console.log('📊 API Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Error:', result.error);
    console.log('AI Status:', result.ai_status);
    
    if (!result.success) {
      console.log('❌ API call failed:', result.error);
    }
    
  } catch (apiError) {
    console.error('❌ API test failed:', apiError.message);
  }
}

debugButterflyTransformation();
