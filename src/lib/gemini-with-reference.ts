/**
 * Enhanced Gemini service with reference image support
 * Test implementation for better hairstyle accuracy
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Transform hair using reference images for better accuracy
 * Now supports ALL hairstyles that have reference images available
 */

/**
 * Transform hair using both user photo and reference image
 */
export async function transformHairWithReference(
  originalImageBase64: string,
  stylePrompt: string | any,
  sessionId: string
): Promise<{ success: boolean; imageUrl?: string; prompt?: string; error?: string; usedReference?: boolean }> {
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  try {
    console.log('🎨 Starting Gemini transformation WITH reference image...')
    
    // Parse style information
    const { instruction, styleName } = parseStylePrompt(stylePrompt)
    
    console.log(`🖼️ Loading reference image for: ${styleName}`)
    
    // Get reference image for this style
    console.log(`🎯 Attempting to load reference for style: "${styleName}"`)
    const referenceImageBase64 = await getReferenceImage(styleName)
    if (!referenceImageBase64) {
      console.log('⚠️ No reference image found for style:', styleName)
      return {
        success: false,
        error: 'No reference image found',
        usedReference: false
      }
    }
    
    console.log(`✅ Reference image loaded successfully, size: ${referenceImageBase64.length} characters`)
    
    // Initialize Gemini AI
    console.log('🔑 Initializing Gemini with API key:', apiKey.substring(0, 10) + '...')
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log('🤖 Getting model: gemini-2.5-flash-image-preview')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })

    // Create enhanced prompt with reference guidance
    const enhancedPrompt = createReferenceBasedPrompt(instruction, styleName)
    
    // Prepare content with both images
    const contents = [
      {
        role: "user",
        parts: [
          { text: enhancedPrompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: originalImageBase64
            }
          },
          {
            inlineData: {
              mimeType: "image/png", 
              data: referenceImageBase64
            }
          }
        ]
      }
    ]

    console.log('📤 Sending request with user photo + reference image...')
    console.log(`📊 Request details:`)
    console.log(`   - User image size: ${originalImageBase64.length} chars`)
    console.log(`   - Reference image size: ${referenceImageBase64.length} chars`)
    console.log(`   - Prompt length: ${enhancedPrompt.length} chars`)
    
    // Generate content
    const response = await model.generateContent({
      contents: contents
    })
    
    console.log('📥 Received response from Gemini')

    // Process response
    const candidates = response.response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini')
    }

    // Check for prohibited content or other finish reasons
    const firstCandidate = candidates[0]
    if (firstCandidate.finishReason === 'PROHIBITED_CONTENT') {
      console.log('⚠️ Gemini blocked content due to safety policies, falling back to standard transformation')
      // Fall back to standard transformation without reference
      const { transformHairWithGemini } = await import('./gemini-production')
      return await transformHairWithGemini(originalImageBase64, stylePrompt, sessionId)
    }
    
    if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
      throw new Error(`Gemini finished with reason: ${firstCandidate.finishReason}`)
    }
    
    const parts = firstCandidate.content?.parts
    if (!parts || parts.length === 0) {
      throw new Error('No parts in response')
    }

    // Find the image part
    const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'))
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data in response')
    }

    console.log('✅ Gemini transformation successful with reference!')
    
    // Store the generated image
    const imageUrl = await storeGeneratedImage(imagePart.inlineData.data, sessionId)
    
    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      usedReference: true
    }

  } catch (error: any) {
    console.error('❌ Gemini transformation failed:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Check if it's a model availability issue
    if (error.message?.includes('not found') || error.message?.includes('not available') || error.message?.includes('model')) {
      console.log('💡 Image generation model not available, falling back to standard transformation...')
      const { transformHairWithGemini } = await import('./gemini-production')
      return await transformHairWithGemini(originalImageBase64, stylePrompt, sessionId)
    }
    
    return {
      success: false,
      error: error.message || 'Transformation failed',
      usedReference: false
    }
  }
}

/**
 * Parse style prompt to extract instruction and style name
 */
function parseStylePrompt(stylePrompt: string | any): { instruction: string; styleName: string } {
  let instruction = stylePrompt
  let styleName = ''
  
  if (typeof stylePrompt === 'object') {
    instruction = stylePrompt.instruction || stylePrompt.prompt || JSON.stringify(stylePrompt)
    styleName = stylePrompt.name || ''
  } else if (typeof stylePrompt === 'string') {
    try {
      const parsed = JSON.parse(stylePrompt)
      instruction = parsed.instruction || parsed.prompt || stylePrompt
      styleName = parsed.name || ''
      
      if (typeof instruction === 'object' && instruction.instruction) {
        instruction = instruction.instruction
      }
    } catch {
      instruction = stylePrompt
    }
  }
  
  if (typeof instruction !== 'string') {
    instruction = JSON.stringify(instruction)
  }
  
  return { instruction, styleName }
}

/**
 * Get reference image for a specific hairstyle
 */
async function getReferenceImage(styleName: string): Promise<string | null> {
  try {
    // Handle different naming conventions
    let filename = styleName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png'
    
    // Map production style names to reference image filenames
    const styleNameMapping: { [key: string]: string } = {
      'butterfly-layers': 'butterfly-haircut.png',
      'butterfly-haircut': 'butterfly-haircut.png',
      'wolf-cut': 'wolf-cut.png',
      'modern-shag': 'shag-cut.png',
      'shag-cut': 'shag-cut.png',
      'feathered-hair': 'feathered-hair.png'
    }
    
    const baseFilename = styleName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (styleNameMapping[baseFilename]) {
      filename = styleNameMapping[baseFilename]
    }
    
    const imagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', filename)
    
    console.log(`🔍 Looking for reference image: ${imagePath}`)
    console.log(`🎯 Style: "${styleName}" → File: "${filename}"`)
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ Reference image not found: ${imagePath}`)
      // Try alternative path
      const altPath = path.join(__dirname, '../../public/hairstyle-previews', filename)
      console.log(`🔍 Trying alternative path: ${altPath}`)
      
      if (!fs.existsSync(altPath)) {
        console.log(`❌ Alternative path also not found: ${altPath}`)
        return null
      }
      
      // Use alternative path
      const imageBuffer = fs.readFileSync(altPath)
      const base64 = imageBuffer.toString('base64')
      console.log(`✅ Loaded reference image from alternative path: ${filename}`)
      return base64
    }
    
    // Read and convert to base64
    const imageBuffer = fs.readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')
    
    console.log(`✅ Loaded reference image: ${filename} (${imageBuffer.length} bytes)`)
    return base64
    
  } catch (error) {
    console.error('❌ Error loading reference image:', error)
    return null
  }
}

/**
 * Create enhanced prompt that uses reference image
 */
function createReferenceBasedPrompt(instruction: string, styleName: string): string {
  return `PROFESSIONAL HAIR STYLING SERVICE - You are a professional hair stylist AI assistant helping with virtual hair makeovers. You have been provided with TWO images:
1. The ORIGINAL photo of the person (first image)
2. A REFERENCE image showing the desired HAIRSTYLE (second image)

HAIR STYLING TASK:
Transform ONLY the hair in the ORIGINAL photo to match the hairstyle shown in the REFERENCE image. This is a professional hair styling service for salon clients.

SPECIFIC HAIR STYLING INSTRUCTION: ${instruction}

PROFESSIONAL HAIR STYLING RULES:
1. STUDY THE REFERENCE HAIRSTYLE IMAGE CAREFULLY - This shows exactly how the hair should look
2. APPLY THE REFERENCE HAIRSTYLE to the original photo - match the hair layers, texture, length, and overall hair shape
3. PRESERVE EVERYTHING ELSE - Keep the person's face, skin, eyes, expression, background, and clothing exactly identical to the original
4. ONLY MODIFY THE HAIR STYLING - Do not change any other aspect of the original image
5. PROFESSIONAL RESULT - The result should clearly show the hairstyle from the reference image applied to the original person's hair

HAIR STYLING REFERENCE GUIDANCE:
- Use the reference image as your PRIMARY guide for the hairstyle structure and appearance
- The text instruction provides additional hair styling context, but the reference image shows the exact hair look to achieve
- Pay attention to hair layer placement, hair texture, hair volume, and overall hair shape in the reference
- Make the hair transformation dramatic and clearly visible - it should obviously match the reference hairstyle

Generate the transformed image now, applying the reference hairstyle to the original photo with clear, visible changes.`
}

/**
 * Fallback to standard transformation without reference
 */
async function transformHairStandard(
  originalImageBase64: string,
  stylePrompt: string | any,
  sessionId: string
): Promise<{ success: boolean; imageUrl?: string; prompt?: string; error?: string }> {
  
  // Import and use the existing transformation function
  const { transformHairWithGemini } = await import('./gemini-production')
  return transformHairWithGemini(originalImageBase64, stylePrompt, sessionId)
}

/**
 * Store generated image in Supabase Storage
 */
async function storeGeneratedImage(base64Data: string, sessionId: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `transformations/transformed_${sessionId}_${Date.now()}.png`
    
    const { data, error } = await supabase.storage
      .from('hair-tryon-images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hair-tryon-images')
      .getPublicUrl(fileName)

    return publicUrl
    
  } catch (error: any) {
    console.error('❌ Storage error:', error)
    throw new Error(`Failed to store image: ${error.message}`)
  }
}
