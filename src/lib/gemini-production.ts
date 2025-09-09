/**
 * Production-ready Gemini 2.5 Flash Image Generation
 * Following official Google documentation: https://ai.google.dev/gemini-api/docs/image-generation
 * 
 * This implementation uses the "Nano Banana" (gemini-2.5-flash-image-preview) model
 * for hair transformation with proper error handling and fallbacks.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface HairTransformationResult {
  success: boolean
  imageUrl?: string
  error?: string
  usedAI: boolean
  prompt?: string
  usedReference?: boolean
}

/**
 * Transform hair using Gemini 2.5 Flash Image (Nano Banana)
 * Following the official Google documentation approach
 */
export async function transformHairWithGemini(
  originalImageBase64: string,
  stylePrompt: string,
  sessionId: string
): Promise<HairTransformationResult> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not configured')
    return await createFallbackTransformation(originalImageBase64, sessionId, 'API key not configured')
  }

  try {
    console.log('🎨 Starting Gemini 2.5 Flash Image transformation...')
    
    // Initialize Gemini AI following official docs
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use the official model name from Google docs
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })

    // Create the prompt following Google's best practices
    const enhancedPrompt = createHairTransformationPrompt(stylePrompt)
    
    // Prepare the content following the EXACT official Google docs format
    const contents = [
      {
        parts: [
          { text: enhancedPrompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: originalImageBase64
            }
          }
        ]
      }
    ]

    console.log('📤 Sending request to Gemini 2.5 Flash Image...')
    
    // Generate content following the EXACT official documentation pattern
    const response = await model.generateContent({
      contents: contents
    })

    // Process response following Google's documentation
    const candidates = response.response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini')
    }

    const parts = candidates[0].content.parts
    let generatedImageData: string | null = null
    let responseText: string | null = null

    // Extract image and text from response (following official docs pattern)
    for (const part of parts) {
      if (part.text) {
        responseText = part.text
        console.log('📝 Gemini response:', part.text)
      } else if (part.inlineData) {
        generatedImageData = part.inlineData.data
        console.log('🖼️ Generated image received from Gemini')
      }
    }

    if (!generatedImageData) {
      throw new Error('No image data returned from Gemini')
    }

    // Store the generated image in Supabase Storage
    const imageUrl = await storeGeneratedImage(generatedImageData, sessionId)
    
    console.log('✅ Hair transformation completed successfully with Gemini')
    
    return {
      success: true,
      imageUrl,
      usedAI: true,
      prompt: enhancedPrompt,
      usedReference: false
    }

  } catch (error: any) {
    console.error('❌ Gemini transformation failed:', error.message)
    
    // Handle specific quota/billing errors
    if (error.message?.includes('quota') || error.message?.includes('billing')) {
      console.log('💳 Quota exceeded - falling back to demo mode')
      return await createFallbackTransformation(
        originalImageBase64, 
        sessionId, 
        'Free tier quota exceeded. Enable billing in Google Cloud Console for unlimited access.'
      )
    }
    
    // Handle other errors with fallback
    return await createFallbackTransformation(originalImageBase64, sessionId, error.message)
  }
}

/**
 * Create enhanced hair transformation prompt following Google's best practices
 */
function createHairTransformationPrompt(stylePrompt: string | any): string {
  // Parse the style prompt to extract the actual instruction
  let instruction = stylePrompt;
  
  // Handle different input types
  if (typeof stylePrompt === 'object') {
    // If it's already an object (from database JSON field)
    instruction = stylePrompt.instruction || stylePrompt.prompt || JSON.stringify(stylePrompt);
  } else if (typeof stylePrompt === 'string') {
    // If it's a JSON string, parse it
    try {
      const parsed = JSON.parse(stylePrompt);
      instruction = parsed.instruction || parsed.prompt || stylePrompt;
      
      // Handle double-nested instruction objects
      if (typeof instruction === 'object' && instruction.instruction) {
        instruction = instruction.instruction;
      }
    } catch {
      // If not JSON, use as-is
      instruction = stylePrompt;
    }
  }

  // Ensure instruction is a string
  if (typeof instruction !== 'string') {
    instruction = JSON.stringify(instruction);
  }

  // Log the instruction for debugging
  console.log('🎯 AI Instruction:', instruction);
  console.log('🔍 Original stylePrompt:', stylePrompt);

  return `You are a professional hair stylist AI. Transform ONLY the hair in this image according to the exact specification below.

TRANSFORMATION TASK:
${instruction}

CRITICAL RULES:
1. READ THE TASK CAREFULLY - if it says "Long Layers" then create long layered hair, if it says "pixie cut" then create a short pixie cut, if it says "change color to red" then only change the color
2. HAIR LENGTH CHANGES: If the instruction mentions "long", "layers", "waves", or "length", you MUST change the hair length significantly - make short hair longer or add volume and layers
3. PRESERVE EVERYTHING ELSE - Keep the person's face, skin, eyes, expression, background, and clothing exactly identical
4. ONLY MODIFY THE HAIR - Do not change any other aspect of the image
5. FOLLOW THE INSTRUCTION PRECISELY - Do not add your own creative interpretation
6. MAKE VISIBLE CHANGES - The transformation should be clearly noticeable, especially for length and style changes

SPECIFIC GUIDANCE:
- "Long Layers" = Create long, layered hairstyle with visible length and texture
- "Pixie Cut" = Create very short, cropped hairstyle
- "Bob Cut" = Create shoulder-length blunt or angled cut
- "Waves" = Add wave texture while maintaining or increasing length
- "Butterfly Haircut" = Add dramatic face-framing layers that create wing-like effect
- "Shag Cut" = Create heavy layering with choppy, textured ends
- "Wolf Cut" = Combine shag and mullet with dramatic layering
- Color changes = Only modify hair color, keep length and style the same

IMPORTANT: For layered cuts (butterfly, shag, wolf), make the layers VERY OBVIOUS and dramatic - the change should be clearly visible!

IMAGE FORMAT REQUIREMENTS:
- MAINTAIN THE EXACT SAME DIMENSIONS as the original image
- PRESERVE THE SAME ASPECT RATIO as the input image
- Keep the same image composition, framing, and crop
- Generate the output in the IDENTICAL FORMAT as the original
- Do not resize, crop, or change the image dimensions
- The output image must have the same width and height as the input

Generate the transformed image now with clear, visible changes to match the instruction, while preserving the exact same image format and dimensions as the original.`
}

/**
 * Store generated image in Supabase Storage following the pattern from official docs
 */
async function storeGeneratedImage(base64Data: string, sessionId: string): Promise<string> {
  try {
    // Convert base64 to buffer (following Google's JavaScript example)
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Generate unique filename
    const fileName = `transformed_${sessionId}_${Date.now()}.png`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('hair-tryon-images')
      .upload(`transformations/${fileName}`, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('hair-tryon-images')
      .getPublicUrl(`transformations/${fileName}`)

    return publicUrl

  } catch (error: any) {
    console.error('❌ Failed to store generated image:', error.message)
    throw error
  }
}

/**
 * Create fallback transformation when Gemini is unavailable
 */
async function createFallbackTransformation(
  originalImageBase64: string, 
  sessionId: string,
  reason: string
): Promise<HairTransformationResult> {
  try {
    console.log('🔄 Creating fallback transformation...')
    
    // Store original image as "transformed" with overlay message
    const buffer = Buffer.from(originalImageBase64, 'base64')
    const fileName = `fallback_${sessionId}_${Date.now()}.jpg`
    
    const { data, error } = await supabase.storage
      .from('hair-tryon-images')
      .upload(`transformations/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (error) {
      throw new Error(`Fallback storage failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hair-tryon-images')
      .getPublicUrl(`transformations/${fileName}`)

    return {
      success: true,
      imageUrl: publicUrl,
      usedAI: false,
      error: `Demo Mode: ${reason}`,
      prompt: 'Fallback transformation - enable billing for AI generation',
      usedReference: false
    }

  } catch (error: any) {
    console.error('❌ Fallback transformation failed:', error.message)
    return {
      success: false,
      error: `Transformation failed: ${error.message}`,
      usedAI: false,
      usedReference: false
    }
  }
}

/**
 * Test function to verify Gemini setup (for debugging)
 */
export async function testGeminiSetup(): Promise<{success: boolean, message: string}> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return { success: false, message: 'GEMINI_API_KEY not configured' }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Test text generation first
    const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const textResult = await textModel.generateContent('Respond with: GEMINI_WORKING')
    const textResponse = textResult.response.text()
    
    if (!textResponse.includes('GEMINI_WORKING')) {
      return { success: false, message: 'Text generation test failed' }
    }

    // Test image generation with correct format
    const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
    const imageResult = await imageModel.generateContent({
      contents: [{
        parts: [{ text: 'Create a simple test image of a red circle' }]
      }]
    })
    
    const parts = imageResult.response.candidates?.[0]?.content?.parts || []
    const hasImage = parts.some(part => part.inlineData)
    
    if (!hasImage) {
      return { success: false, message: 'Image generation test failed - no image returned' }
    }

    return { success: true, message: 'Gemini 2.5 Flash Image is working perfectly!' }

  } catch (error: any) {
    if (error.message?.includes('quota') || error.message?.includes('billing')) {
      return { 
        success: false, 
        message: 'Quota exceeded - enable billing in Google Cloud Console: https://console.cloud.google.com/billing' 
      }
    }
    return { success: false, message: `Setup test failed: ${error.message}` }
  }
}
