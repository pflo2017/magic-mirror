import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY not configured'
      })
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    // Test different model names to see which ones work
    const modelsToTest = [
      'gemini-2.5-flash-image-preview',
      'gemini-2.5-flash-image',
      'gemini-1.5-flash-image',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ]

    const results = []

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        // Try a simple text generation first
        const textResult = await model.generateContent("Hello, respond with just 'OK'")
        const textResponse = textResult.response.text()
        
        results.push({
          model: modelName,
          textGeneration: { success: true, response: textResponse.substring(0, 50) },
          imageGeneration: { success: false, error: 'Not tested - text first' }
        })

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          model: modelName,
          textGeneration: { success: false, error: errorMsg.substring(0, 200) },
          imageGeneration: { success: false, error: 'Not tested - text failed' }
        })
      }
    }

    // Now test image generation with working models
    for (const result of results) {
      if (result.textGeneration.success && result.model.includes('image')) {
        try {
          console.log(`Testing image generation with: ${result.model}`)
          const model = genAI.getGenerativeModel({ model: result.model })
          
          const imageResult = await model.generateContent([
            "Create a simple test: red circle on white background"
          ])
          
          const candidates = imageResult.response.candidates
          if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData) {
                result.imageGeneration = { success: true, response: 'Image generated successfully!' }
                break
              }
            }
          }
          
          if (!result.imageGeneration.success) {
            result.imageGeneration = { success: false, error: 'No image data in response' }
          }
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          result.imageGeneration = { success: false, error: errorMsg.substring(0, 300) }
        }
      }
    }

    // Check API key info
    let apiKeyInfo = 'Unable to determine'
    try {
      // Try to get some info about the API key
      const testModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      await testModel.generateContent("test")
      apiKeyInfo = 'API key is valid and working for text generation'
    } catch (error) {
      apiKeyInfo = `API key issue: ${error instanceof Error ? error.message.substring(0, 100) : 'Unknown'}`
    }

    return NextResponse.json({
      success: true,
      apiKeyStatus: apiKeyInfo,
      modelTests: results,
      workingModels: results.filter(r => r.textGeneration.success).map(r => r.model),
      imageCapableModels: results.filter(r => r.imageGeneration.success).map(r => r.model),
      recommendations: results.filter(r => r.imageGeneration.success).length > 0
        ? 'Found working image generation models!'
        : 'No working image generation models found. Check API key permissions or billing.'
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

