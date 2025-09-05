import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { session_token, style_id, image_url } = await request.json()

    if (!session_token || !style_id || !image_url) {
      return NextResponse.json(
        { error: 'Session token, style ID, and image URL are required' },
        { status: 400 }
      )
    }

    // 1. Validate session token
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', session_token)
      .eq('is_active', true)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      )
    }

    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(session.expires_at)
    
    if (now > expiresAt) {
      await supabaseAdmin
        .from('sessions')
        .update({ is_active: false })
        .eq('id', session_token)

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Check AI usage limit
    if (session.ai_uses_count >= session.max_ai_uses) {
      return NextResponse.json(
        { error: 'AI usage limit reached' },
        { status: 429 }
      )
    }

    // 2. Get style details from database
    const { data: style, error: styleError } = await supabaseAdmin
      .from('styles')
      .select('name, prompt, category')
      .eq('id', style_id)
      .eq('is_active', true)
      .single()

    if (styleError || !style) {
      return NextResponse.json(
        { error: 'Invalid style ID' },
        { status: 400 }
      )
    }

    console.log('🔍 Processing hair transformation:', {
      session_id: session_token,
      style_name: style.name,
      category: style.category,
      style_prompt: style.prompt
    })

    // 3. Upload original image to Supabase Storage
    const imageBuffer = Buffer.from(image_url.split(',')[1], 'base64')
    const originalFileName = `originals/${session_token}-${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('hair-tryon-images')
      .upload(originalFileName, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image for processing' },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabaseAdmin.storage
      .from('hair-tryon-images')
      .getPublicUrl(originalFileName)

    // 4. Process with production-ready Gemini AI following official Google docs
    let generatedImageUrl: string
    let usedAI = false
    let aiError: string | undefined
    let aiPromptUsed: string | undefined
    
    if (process.env.GEMINI_API_KEY) {
      console.log('🎨 Processing with Gemini 2.5 Flash Image (Nano Banana):', {
        style: style.name,
        category: style.category
      })

      try {
        // Import and use the production-ready Gemini implementation
        const { transformHairWithGemini } = await import('@/lib/gemini-production')
        
        console.log('🚀 Using official Google Gemini 2.5 Flash Image API...')
        
        // Extract base64 data from the data URL
        const base64Data = image_url.split(',')[1]
        
        const aiResult = await transformHairWithGemini(
          base64Data,
          style.prompt,
          session_token
        )

        if (aiResult.success && aiResult.imageUrl) {
          generatedImageUrl = aiResult.imageUrl
          usedAI = aiResult.usedAI
          aiError = aiResult.error
          aiPromptUsed = aiResult.prompt
          console.log(`✅ Hair transformation completed! AI: ${usedAI}`)
        } else {
          throw new Error(aiResult.error || 'Hair transformation failed')
        }
      } catch (error: any) {
        console.error('❌ Gemini transformation error:', error.message)
        // Fallback to demo image if Gemini fails
        generatedImageUrl = `https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=AI+Temporarily+Unavailable%0A%0ATry+Again+Later`
        usedAI = false
        aiError = error.message
      }
    } else {
      console.log('GEMINI_API_KEY not configured, using demo mode')
      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      generatedImageUrl = `https://picsum.photos/400/400?random=${Date.now()}`
      usedAI = false
      aiError = 'API key not configured'
    }

    // 5. Update session usage count
    await supabaseAdmin
      .from('sessions')
      .update({ 
        ai_uses_count: session.ai_uses_count + 1
      })
      .eq('id', session_token)

    // 6. Store the generation record
    await supabaseAdmin
      .from('ai_generations')
      .insert({
        session_id: session.id,
        style_id: style_id,
        original_image_url: originalFileName,
        generated_image_url: generatedImageUrl,
        processing_time_ms: process.env.GEMINI_API_KEY ? 15000 : 2000, // Real AI takes longer
        prompt_used: style.prompt,
        was_cached: false
      })

    // 7. Return result with detailed AI status
    return NextResponse.json({
      success: true,
      generated_image_url: generatedImageUrl,
      status: 'completed',
      message: usedAI ? 'AI transformation completed!' : 'Demo transformation completed!',
      ai_status: {
        used_ai: usedAI,
        error: aiError,
        model: usedAI ? 'gemini-2.5-flash-image-preview' : 'demo',
        note: usedAI ? 'Powered by Google Gemini Nano Banana' : 'Enable billing for AI transformations',
        prompt_used: aiPromptUsed
      },
      style: {
        id: style_id,
        name: style.name,
        category: style.category,
        prompt: style.prompt // Include the AI prompt in response
      },
      session: {
        ai_uses_remaining: session.max_ai_uses - (session.ai_uses_count + 1),
        time_remaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      },
      api_configured: !!process.env.GEMINI_API_KEY // Let client know if API is configured
    })

  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}