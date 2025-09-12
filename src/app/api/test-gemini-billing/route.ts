import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      })
    }

    // Test multiple requests to check if we're on free tier or paid
    const { testGeminiConnection } = await import('@/lib/gemini-native')
    
    console.log('🧪 Testing Gemini billing status...')
    
    // Test 1: Basic connection
    const test1 = await testGeminiConnection()
    
    // Test 2: Try image generation (this will fail on free tier)
    let imageTest = { success: false, error: 'Not tested' }
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
      
      const result = await model.generateContent([
        "Create a simple test image: a small red circle on white background"
      ])
      
      const candidates = result.response.candidates
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            imageTest = { success: true, error: 'Image generation working!' }
            break
          }
        }
      }
      
      if (!imageTest.success) {
        imageTest = { success: false, error: 'No image data returned' }
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      imageTest = { success: false, error: errorMsg }
    }

    // Determine billing status
    const isFreeTier = imageTest.error?.includes('quota') || imageTest.error?.includes('429')
    const isPaidTier = imageTest.success
    
    return NextResponse.json({
      success: test1.success,
      billingStatus: isPaidTier ? 'PAID_TIER' : isFreeTier ? 'FREE_TIER_LIMITED' : 'UNKNOWN',
      textGeneration: test1,
      imageGeneration: imageTest,
      recommendations: isPaidTier 
        ? '🎉 Paid tier active! Ready for unlimited hair transformations!'
        : isFreeTier 
        ? '⚠️ Free tier detected. Upgrade billing to enable image generation.'
        : '❓ Unable to determine billing status. Check API key and billing setup.',
      costEstimate: isPaidTier 
        ? 'Cost: ~$0.04 per hair transformation (4 cents)'
        : 'Upgrade needed for production use',
      setupInstructions: !isPaidTier ? [
        '1. Go to https://aistudio.google.com/',
        '2. Click on API key settings',
        '3. Enable billing and add payment method',
        '4. Test again with this endpoint'
      ] : [
        '✅ Billing setup complete!',
        '✅ Ready for production hair transformations',
        '✅ Cost: ~4 cents per transformation'
      ]
    })

  } catch (error) {
    console.error('Billing test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      billingStatus: 'ERROR'
    })
  }
}


