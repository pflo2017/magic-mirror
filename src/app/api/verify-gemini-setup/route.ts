import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured',
        setup: 'Add your API key to .env.local'
      })
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    console.log('🔍 Verifying Gemini setup following Google\'s official docs...')

    // Step 1: Test basic text generation (should always work)
    console.log('Step 1: Testing basic text generation...')
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const textResult = await textModel.generateContent("Respond with: API_KEY_WORKING")
    const textResponse = textResult.response.text()

    // Step 2: Test image generation with different approaches
    console.log('Step 2: Testing image generation...')
    
    // Try the official model name from Google's docs
    const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    
    let imageSuccess = false
    let imageError = ''
    
    try {
      // Use the exact pattern from Google's documentation
      const imageResult = await imageModel.generateContent([
        "Create a simple test image: a small red circle on a white background"
      ])
      
      // Check response structure as per Google's docs
      if (imageResult.response.candidates && imageResult.response.candidates.length > 0) {
        const parts = imageResult.response.candidates[0].content.parts
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            imageSuccess = true
            console.log('✅ Image generation successful!')
            break
          }
        }
      }
      
      if (!imageSuccess) {
        imageError = 'No image data found in response'
      }
      
    } catch (error) {
      imageError = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Image generation failed:', imageError)
    }

    // Step 3: Analyze the results and provide recommendations
    const recommendations = []
    
    if (!textResponse.includes('API_KEY_WORKING')) {
      recommendations.push('❌ API key may be invalid - check Google AI Studio')
    } else {
      recommendations.push('✅ API key is valid for text generation')
    }

    if (!imageSuccess) {
      if (imageError.includes('quota') || imageError.includes('429')) {
        recommendations.push('⚠️ Quota exceeded - you may need to enable billing in Google Cloud Console')
        recommendations.push('📋 Go to: https://console.cloud.google.com/billing')
        recommendations.push('📋 Enable billing for your project (even for free tier)')
      } else if (imageError.includes('permission') || imageError.includes('403')) {
        recommendations.push('⚠️ Permission denied - enable Generative AI API in Google Cloud Console')
        recommendations.push('📋 Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com')
      } else {
        recommendations.push('⚠️ Image generation failed - check model availability')
        recommendations.push('📋 Verify Gemini 2.5 Flash Image is available in your region')
      }
    } else {
      recommendations.push('🎉 Image generation is working perfectly!')
    }

    return NextResponse.json({
      success: imageSuccess,
      textGeneration: {
        working: textResponse.includes('API_KEY_WORKING'),
        response: textResponse.substring(0, 100)
      },
      imageGeneration: {
        working: imageSuccess,
        error: imageError || 'None'
      },
      apiKey: {
        configured: true,
        valid: textResponse.includes('API_KEY_WORKING')
      },
      recommendations,
      nextSteps: imageSuccess ? [
        '✅ Setup complete! Ready for hair transformations',
        '🚀 Test the full hair transformation flow'
      ] : [
        '1. Check Google Cloud Console billing settings',
        '2. Enable Generative AI API if not already enabled',
        '3. Verify your region supports Gemini 2.5 Flash Image',
        '4. Try again after enabling billing'
      ]
    })

  } catch (error) {
    console.error('Setup verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: [
        'Check your API key is correctly set in .env.local',
        'Verify the API key is from Google AI Studio',
        'Ensure your Google Cloud project has proper permissions'
      ]
    })
  }
}
