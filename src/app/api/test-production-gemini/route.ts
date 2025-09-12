import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing production Gemini implementation...')
    
    // Test the setup function
    const { testGeminiSetup } = await import('@/lib/gemini-production')
    
    const result = await testGeminiSetup()
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-flash-image-preview',
      implementation: 'production-ready following Google docs'
    })

  } catch (error: any) {
    console.error('❌ Production Gemini test failed:', error.message)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check GEMINI_API_KEY in .env.local',
        'Enable billing in Google Cloud Console',
        'Verify API key permissions'
      ]
    })
  }
}


