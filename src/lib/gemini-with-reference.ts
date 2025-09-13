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
  sessionId: string,
  category?: string
): Promise<{ success: boolean; imageUrl?: string; prompt?: string; error?: string; usedReference?: boolean }> {
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }

  const attemptId = Math.random().toString(36).substring(7)
  console.log(`🎨 [${attemptId}] Starting Gemini transformation WITH reference image...`)
  console.log(`🎨 [${attemptId}] Session: ${sessionId}, Category: ${category}`)

  try {
    
    // Parse style information
    const { instruction, styleName } = parseStylePrompt(stylePrompt)
    
    console.log(`🖼️ Loading reference image for: ${styleName}`)
    
    // Get reference image for this style
    console.log(`🎯 [${attemptId}] Attempting to load reference for style: "${styleName}"`)
    console.log(`📂 [${attemptId}] Category: ${category}, Gender: ${category === 'women_hairstyles' ? 'women' : category === 'men_hairstyles' ? 'men' : 'undefined'}`)
    
    // Determine gender from category
    const gender = category === 'women_hairstyles' ? 'women' : category === 'men_hairstyles' ? 'men' : undefined
    const referenceImageBase64 = await getReferenceImage(styleName, gender, attemptId)
    if (!referenceImageBase64) {
      console.log(`❌ [${attemptId}] REFERENCE IMAGE LOADING FAILED for style:`, styleName)
      console.log(`🔍 [${attemptId}] This might be why first attempt fails but second works`)
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

    console.log(`📤 [${attemptId}] Sending request with user photo + reference image...`)
    console.log(`📊 [${attemptId}] Request details:`)
    console.log(`   - User image size: ${originalImageBase64.length} chars`)
    console.log(`   - Reference image size: ${referenceImageBase64.length} chars`)
    console.log(`   - Prompt length: ${enhancedPrompt.length} chars`)
    
    // Generate content
    const startTime = Date.now()
    const response = await model.generateContent({
      contents: contents
    })
    const endTime = Date.now()
    
    console.log(`📥 [${attemptId}] Received response from Gemini (${endTime - startTime}ms)`)

    // Debug: Log response structure for Buzz Cut issues
    if (styleName.toLowerCase().includes('buzz')) {
      console.log(`🔍 [${attemptId}] BUZZ CUT DEBUG - Response structure:`, {
        hasCandidates: !!response.response.candidates,
        candidatesLength: response.response.candidates?.length,
        firstCandidate: response.response.candidates?.[0] ? {
          hasContent: !!response.response.candidates[0].content,
          partsLength: response.response.candidates[0].content?.parts?.length,
          finishReason: response.response.candidates[0].finishReason
        } : null
      })
    }

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
    
    // Debug: Check if this is actually a different image for Buzz Cut
    if (styleName.toLowerCase().includes('buzz')) {
      const imageDataLength = imagePart.inlineData.data.length
      const imageDataStart = imagePart.inlineData.data.substring(0, 100)
      const originalImageStart = originalImageBase64.substring(0, 100)
      
      console.log(`🔍 [${attemptId}] BUZZ CUT DEBUG - Generated image data:`, {
        dataLength: imageDataLength,
        dataStart: imageDataStart,
        mimeType: imagePart.inlineData.mimeType
      })
      
      console.log(`🔍 [${attemptId}] BUZZ CUT DEBUG - Original vs Generated comparison:`, {
        originalStart: originalImageStart,
        generatedStart: imageDataStart,
        areSame: originalImageStart === imageDataStart,
        originalLength: originalImageBase64.length,
        generatedLength: imageDataLength
      })
    }
    
    // Store the generated image
    const imageUrl = await storeGeneratedImage(imagePart.inlineData.data, sessionId)
    
    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      usedReference: true
    }

  } catch (error: any) {
    console.error(`❌ [${attemptId}] Gemini transformation failed:`, error)
    console.error(`❌ [${attemptId}] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    console.error(`🔍 [${attemptId}] This error on first attempt could explain the pattern`)
    
    // Check if it's a model availability issue
    if (error.message?.includes('not found') || error.message?.includes('not available') || error.message?.includes('model')) {
      console.log(`💡 [${attemptId}] Image generation model not available, falling back to standard transformation...`)
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
async function getReferenceImage(styleName: string, gender?: string, attemptId?: string): Promise<string | null> {
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
    
    // Determine gender folder from category or gender parameter
    let genderFolder = ''
    if (gender) {
      genderFolder = gender === 'women' ? 'women' : 'men'
    }
    
    // Try gender-specific folder first if gender is provided
    let imagePath = ''
    if (genderFolder) {
      imagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', genderFolder, filename)
      console.log(`🔍 [${attemptId || 'unknown'}] Looking for gender-specific reference image: ${imagePath}`)
      
      try {
        console.log(`🔍 [${attemptId || 'unknown'}] Checking if file exists: ${imagePath}`)
        if (fs.existsSync(imagePath)) {
          console.log(`✅ [${attemptId || 'unknown'}] File exists, reading...`)
          const imageBuffer = fs.readFileSync(imagePath)
          const base64 = imageBuffer.toString('base64')
          console.log(`✅ [${attemptId || 'unknown'}] Loaded gender-specific reference image: ${genderFolder}/${filename} (${imageBuffer.length} bytes)`)
          return base64
        } else {
          console.log(`❌ [${attemptId || 'unknown'}] Gender-specific reference image not found: ${imagePath}`)
          console.log(`🔍 [${attemptId || 'unknown'}] File system check failed - this could cause first-attempt failures`)
        }
      } catch (error) {
        console.error(`❌ [${attemptId || 'unknown'}] Error loading gender-specific reference image:`, error)
        console.error(`🔍 [${attemptId || 'unknown'}] This error could explain why first attempt fails but second works`)
      }
    }
    
    // Fall back to main folder
    imagePath = path.join(process.cwd(), 'public', 'hairstyle-previews', filename)
    console.log(`🔍 Looking for reference image in main folder: ${imagePath}`)
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
  return `You have TWO images to work with:
IMAGE 1: Original person's photo
IMAGE 2: Reference hairstyle (the exact style to copy)

TASK: Transform the person's hair in IMAGE 1 to match the hairstyle shown in IMAGE 2.

CRITICAL: Look at IMAGE 2 carefully - this shows the EXACT hairstyle the user wants. Copy this hairstyle precisely onto the person in IMAGE 1.

SPECIFIC INSTRUCTIONS: ${instruction}

TRANSFORMATION RULES:
1. Study IMAGE 2 (reference) first - note the exact hair length, cut, and style
2. Apply that SAME hairstyle to the person in IMAGE 1
3. Keep the person's face, skin, and background from IMAGE 1 unchanged
4. Make the hair transformation clear and obvious
5. The result should show the person with the hairstyle from IMAGE 2

If IMAGE 2 shows very short hair (like a buzz cut), make the person's hair very short.
If IMAGE 2 shows long hair, make the person's hair long.
Copy the reference hairstyle exactly as shown.

Generate the transformed image now.`
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
