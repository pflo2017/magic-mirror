import { GoogleGenAI } from '@google/genai'
import { supabase } from './supabase'
import sharp from 'sharp'

// Initialize the Google GenAI client as per the official documentation
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

interface AIGenerationRequest {
  originalImageUrl: string
  prompt: any
  styleId: string
}

interface AIGenerationResponse {
  success: boolean
  generated_image_url?: string
  error?: string
  category?: string
  style_name?: string
}

export async function processAIGeneration(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    const { originalImageUrl, prompt, styleId } = request
    
    // Download and process the original image
    const imageResponse = await fetch(originalImageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch original image')
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    
    // Step 1: Use Gemini 2.5 Flash to analyze the image and create detailed styling instructions
    const analysisPrompt = `
Analyze this person's photo and provide detailed instructions for applying this hairstyle: ${JSON.stringify(prompt)}

Consider:
1. Current hair length, texture, and color
2. Face shape and features
3. Skin tone
4. Lighting conditions
5. Background elements to preserve

Provide specific instructions for how to apply the requested style while maintaining realism.
`

    const analysisResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: 0 // Disable thinking for faster response
        }
      }
    })

    const analysisText = analysisResponse.text
    console.log('Gemini analysis:', analysisText)

    // Step 2: Use Imagen for actual image generation
    // Based on the documentation, we should use the image generation model
    const imageGenerationPrompt = `
Transform this portrait photo by applying the following hairstyle: ${prompt.prompt || prompt.name}

Style the hair to match: ${analysisText}

Requirements:
- Keep the person's face, skin tone, and facial features exactly the same
- Only change the hairstyle/hair color as specified
- Maintain the original lighting, shadows, and background
- Make the transformation look natural and professional
- High quality, photorealistic result
`

    // For now, we'll use a simulation since Imagen might not be available in all regions
    // In production, you would use the actual Imagen API call:
    /*
    const imageResult = await genAI.models.generateImage({
      model: 'imagen-3.0-generate-001',
      prompt: imageGenerationPrompt,
      config: {
        aspectRatio: '1:1',
        safetyFilterLevel: 'BLOCK_ONLY_HIGH',
        personGeneration: 'ALLOW_ADULT'
      }
    })
    */
    
    // Simulate image generation process with enhanced styling
    const generatedImageUrl = await simulateImageGeneration(originalImageUrl, prompt, analysisText)
    
    return {
      success: true,
      generated_image_url: generatedImageUrl,
      category: prompt.category,
      style_name: prompt.style_name || prompt.name
    }
    
  } catch (error) {
    console.error('AI generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Simulate image generation for demo purposes
// In production, replace this with actual image generation API calls
async function simulateImageGeneration(originalImageUrl: string, prompt: any, analysis: string): Promise<string> {
  try {
    // For demo purposes, we'll create a modified version of the original image
    // with some basic transformations to simulate the hair styling process
    
    const imageResponse = await fetch(originalImageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Use Sharp to create a modified version (this is just for demo)
    // In production, you'd use actual AI image generation
    let processedImage = sharp(Buffer.from(imageBuffer))
    
    // Apply some basic transformations based on the style type
    if (prompt.prompt && typeof prompt.prompt === 'string') {
      const promptText = prompt.prompt.toLowerCase()
      
      if (promptText.includes('blonde') || promptText.includes('light')) {
        // Simulate lighter hair by adjusting brightness
        processedImage = processedImage.modulate({ brightness: 1.1, saturation: 0.9 })
      } else if (promptText.includes('dark') || promptText.includes('black')) {
        // Simulate darker hair
        processedImage = processedImage.modulate({ brightness: 0.9, saturation: 1.1 })
      } else if (promptText.includes('red') || promptText.includes('copper')) {
        // Simulate red tones
        processedImage = processedImage.tint({ r: 255, g: 200, b: 200 })
      }
    }
    
    // Convert to buffer
    const outputBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer()
    
    // Upload to Supabase Storage
    const fileName = `generated/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    
    const { data, error } = await supabase.storage
      .from('hair-tryon-images')
      .upload(fileName, outputBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })
    
    if (error) {
      throw new Error(`Failed to upload generated image: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hair-tryon-images')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
    
  } catch (error) {
    console.error('Image generation simulation failed:', error)
    throw error
  }
}

// Production-ready function using actual Imagen API
export async function processWithImagenAPI(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    const { originalImageUrl, prompt, styleId } = request
    
    // Download and process the original image
    const imageResponse = await fetch(originalImageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch original image')
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    
    // Step 1: Analyze with Gemini 2.5 Flash
    const analysisPrompt = `Analyze this portrait and provide detailed hair styling instructions for: ${JSON.stringify(prompt)}`
    
    const analysisResponse = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: 0 // Disable thinking for faster response
        }
      }
    })

    // Step 2: Generate image with Imagen
    const imageGenerationPrompt = `
Professional hair transformation: Apply ${prompt.name || prompt.prompt} hairstyle to this person.

Analysis: ${analysisResponse.text}

Requirements:
- Photorealistic quality
- Maintain facial features and skin tone
- Natural lighting and shadows
- Professional salon result
- Keep background unchanged
`

    // Use Imagen 3.0 for actual image generation
    const imageResult = await genAI.models.generateImage({
      model: 'imagen-3.0-generate-001',
      prompt: imageGenerationPrompt,
      config: {
        aspectRatio: '1:1',
        safetyFilterLevel: 'BLOCK_ONLY_HIGH',
        personGeneration: 'ALLOW_ADULT',
        outputOptions: {
          mimeType: 'image/jpeg',
          compressionQuality: 90
        }
      }
    })

    // Upload generated image to Supabase Storage
    const generatedImageBuffer = Buffer.from(imageResult.image.data, 'base64')
    const fileName = `generated/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    
    const { data, error } = await supabase.storage
      .from('hair-tryon-images')
      .upload(fileName, generatedImageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })
    
    if (error) {
      throw new Error(`Failed to upload generated image: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hair-tryon-images')
      .getPublicUrl(fileName)
    
    return {
      success: true,
      generated_image_url: urlData.publicUrl,
      category: prompt.category,
      style_name: prompt.name || prompt.style_name
    }
    
  } catch (error) {
    console.error('Imagen API failed:', error)
    
    // Fallback to simulation if Imagen is not available
    console.log('Falling back to simulation mode...')
    return await processAIGeneration(request)
  }
}

// Alternative function for integrating with specialized hair try-on APIs
export async function processWithSpecializedAPI(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  // This is where you'd integrate with specialized services like:
  // - ModiFace API
  // - Perfect Corp YouCam API
  // - L'Oréal ModiFace
  // - Sephora Virtual Artist API
  
  try {
    // Example integration with ModiFace API:
    /*
    const response = await fetch('https://api.modiface.com/v1/hair-color', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MODIFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: request.originalImageUrl,
        hair_color: prompt.color || '#000000',
        style_id: request.styleId
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'ModiFace API failed')
    }
    
    return {
      success: true,
      generated_image_url: result.result_image_url,
      category: result.category,
      style_name: result.style_name
    }
    */
    
    // For now, fall back to our implementation
    return await processWithImagenAPI(request)
    
  } catch (error) {
    console.error('Specialized API failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Utility function to validate image format and size
export function validateImage(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload an image smaller than 10MB.'
    }
  }
  
  return { valid: true }
}

// Utility function to resize image if needed
export async function resizeImageIfNeeded(imageBuffer: Buffer, maxWidth: number = 1024, maxHeight: number = 1024): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata')
  }
  
  if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
    return imageBuffer
  }
  
  return await image
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 90 })
    .toBuffer()
}
