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

    // Test the Gemini connection
    const { testGeminiConnection } = await import('@/lib/gemini-simple')
    const testResult = await testGeminiConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Gemini AI is properly configured and working!',
        details: testResult.error // This contains the response from Gemini
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        instructions: 'Check your GEMINI_API_KEY and ensure it has proper permissions'
      })
    }

  } catch (error) {
    console.error('Gemini test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      instructions: 'Check server logs for more details'
    })
  }
}

