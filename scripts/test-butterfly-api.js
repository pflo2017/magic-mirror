/**
 * Test the butterfly haircut via the actual API to see what's failing
 */

const fs = require('fs');
const path = require('path');

async function testButterflyAPI() {
  console.log('🧪 Testing Butterfly Haircut via API...');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const fetch = (await import('node-fetch')).default;
    
    // Step 1: Create a valid session first
    console.log('\n1️⃣ Creating a test session...');
    
    const sessionResponse = await fetch('http://localhost:3000/api/session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        salon_id: 'test-salon-id'
      })
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session response:', sessionData);
    
    if (!sessionData.success) {
      console.log('❌ Failed to create session, trying with existing salon...');
      
      // Try to get styles to see what's available
      const stylesResponse = await fetch('http://localhost:3000/api/styles');
      const stylesData = await stylesResponse.json();
      console.log('Styles available:', stylesData.length || 'none');
      
      if (stylesData.length > 0) {
        const butterflyStyle = stylesData.find(s => 
          s.name.toLowerCase().includes('butterfly') || 
          s.name.toLowerCase().includes('layers')
        );
        console.log('Found butterfly style:', butterflyStyle);
      }
      
      return;
    }
    
    const sessionToken = sessionData.session_token;
    console.log('✅ Session created:', sessionToken);
    
    // Step 2: Get available styles
    console.log('\n2️⃣ Getting available styles...');
    
    const stylesResponse = await fetch('http://localhost:3000/api/styles');
    const styles = await stylesResponse.json();
    
    const butterflyStyle = styles.find(s => 
      s.name.toLowerCase().includes('butterfly') || 
      s.name.toLowerCase().includes('layers')
    );
    
    if (!butterflyStyle) {
      console.log('❌ No butterfly style found in:', styles.map(s => s.name));
      return;
    }
    
    console.log('✅ Found butterfly style:', butterflyStyle.name, 'ID:', butterflyStyle.id);
    
    // Step 3: Prepare test image
    console.log('\n3️⃣ Preparing test image...');
    
    const testImagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', 'butterfly-haircut.png');
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('✅ Test image prepared, size:', imageBuffer.length, 'bytes');
    
    // Step 4: Make the transformation request
    console.log('\n4️⃣ Making transformation request...');
    
    const transformResponse = await fetch('http://localhost:3000/api/session/apply-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        style_id: butterflyStyle.id,
        image_url: dataUrl
      })
    });
    
    const transformResult = await transformResponse.json();
    
    console.log('\n📊 Transformation Result:');
    console.log('Status:', transformResponse.status);
    console.log('Success:', transformResult.success);
    console.log('Generated Image URL:', transformResult.generated_image_url);
    console.log('AI Status:', transformResult.ai_status);
    console.log('Error:', transformResult.error);
    
    if (transformResult.success) {
      console.log('✅ Transformation succeeded!');
      if (transformResult.generated_image_url?.includes('placeholder')) {
        console.log('⚠️ But it returned a placeholder image, meaning AI failed');
      }
    } else {
      console.log('❌ Transformation failed:', transformResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testButterflyAPI();
