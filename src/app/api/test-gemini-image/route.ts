import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY environment variable not configured',
        instructions: 'Add GEMINI_API_KEY to your .env.local file'
      })
    }

    // Test both text generation and image generation
    const { testGeminiConnection, testGeminiImageGeneration } = await import('@/lib/gemini-native')
    
    console.log('🧪 Testing Gemini connection...')
    const textTest = await testGeminiConnection()
    
    console.log('🎨 Testing Gemini image generation...')
    const imageTest = await testGeminiImageGeneration()

    return NextResponse.json({
      success: textTest.success && imageTest.success,
      textGeneration: textTest,
      imageGeneration: imageTest,
      message: textTest.success && imageTest.success 
        ? '🎉 Gemini AI is fully configured and ready for REAL hair transformations!'
        : '⚠️ Some Gemini features are not working properly',
      instructions: !textTest.success || !imageTest.success
        ? 'Check your GEMINI_API_KEY and ensure it has access to Gemini 2.5 Flash Image'
        : 'Ready for production hair transformations!'
    })

  } catch (error) {
    console.error('Gemini test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      instructions: 'Check server logs for more details'
    })
  }
}


