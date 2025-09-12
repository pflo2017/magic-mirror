import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { session_token, style_id, image_url } = await request.json()

    if (!session_token || !style_id || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(session_token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      )
    }

    // Check if session has expired
    const now = new Date()
    const expiresAt = new Date(decoded.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Check if user has remaining AI uses
    if (decoded.ai_uses_remaining <= 0) {
      return NextResponse.json(
        { error: 'No AI uses remaining in this session' },
        { status: 403 }
      )
    }

    // Get style information
    const { data: style, error: styleError } = await supabase
      .from('styles')
      .select('*')
      .eq('id', style_id)
      .single()

    if (styleError || !style) {
      return NextResponse.json(
        { error: 'Style not found' },
        { status: 404 }
      )
    }

    // Process with AI transformation (same as salon users)
    let generatedImageUrl: string
    let usedAI = false
    let aiError: string | undefined
    let aiPromptUsed: string | undefined
    let usesReference = false
    
    if (process.env.GEMINI_API_KEY) {
      console.log('🎨 Processing individual user with Gemini AI:', {
        style: style.name,
        category: style.category
      })

      try {
        // Extract base64 data from the data URL
        const base64Data = image_url.split(',')[1]
        
        // Try reference-based transformation first
        console.log('🖼️ Attempting reference-based transformation for individual user:', style.name)
        
        // Import and use the reference-based implementation
        const { transformHairWithReference } = await import('@/lib/gemini-with-reference')
        
        let aiResult = await transformHairWithReference(
          base64Data,
          { ...(style.prompt as any), name: style.name },
          decoded.session_id,
          style.category as any
        )
        
        console.log('📊 Individual reference transformation result:', { success: aiResult.success, hasImageUrl: !!aiResult.imageUrl, error: aiResult.error, usedReference: aiResult.usedReference })
        
        // If reference-based transformation failed due to missing reference image, fall back to standard
        if (!aiResult.success && aiResult.error?.includes('No reference image found')) {
          console.log('🚀 Individual user falling back to standard Gemini transformation...')
          // Import and use the standard implementation
          const { transformHairWithGemini } = await import('@/lib/gemini-production')
          
          aiResult = await transformHairWithGemini(
            base64Data,
            style.prompt as any,
            decoded.session_id
          )
          usesReference = false
        } else {
          usesReference = true
        }

        if (aiResult.success && aiResult.imageUrl) {
          generatedImageUrl = aiResult.imageUrl
          usedAI = (aiResult as any).usedAI || true
          aiError = aiResult.error
          aiPromptUsed = aiResult.prompt
          console.log(`✅ Individual hair transformation completed! AI: ${usedAI}, Reference: ${usesReference}`)
        } else {
          console.error(`❌ Individual transformation failed:`, aiResult.error)
          throw new Error(aiResult.error || 'Hair transformation failed')
        }
      } catch (error: any) {
        console.error('❌ Individual Gemini transformation error:', error.message)
        // Fallback to demo image if Gemini fails
        generatedImageUrl = `https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=AI+Temporarily+Unavailable%0A%0ATry+Again+Later`
        usedAI = false
        aiError = error.message
      }
    } else {
      console.log('GEMINI_API_KEY not configured for individual user, using demo mode')
      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      generatedImageUrl = `https://picsum.photos/400/400?random=${Date.now()}`
      usedAI = false
      aiError = 'API key not configured'
    }

    console.log('✅ Individual transformation completed:', { usedAI, usesReference })

    // Calculate remaining time
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

    // Create new JWT token with decremented AI uses
    const newSessionToken = jwt.sign(
      { 
        ...decoded,
        ai_uses_remaining: decoded.ai_uses_remaining - 1,
        updated_at: new Date().toISOString()
      },
      JWT_SECRET
      // Note: expiresIn removed since decoded token already has exp property
    )

    return NextResponse.json({
      success: true,
      generated_image_url: generatedImageUrl,
      new_session_token: newSessionToken, // Updated token with decremented uses
      ai_status: {
        used_ai: usedAI,
        error: aiError,
        model: usedAI ? 'gemini-2.5-flash-image-preview' : 'demo',
        note: usedAI ? (usesReference ? 'Enhanced with reference image - Powered by Google Gemini' : 'Powered by Google Gemini') : 'Demo mode or API not configured',
        uses_reference: usedAI && usesReference,
        prompt_used: aiPromptUsed
      },
      style: {
        id: style_id,
        name: style.name,
        category: style.category,
        prompt: style.prompt
      },
      session: {
        ai_uses_remaining: decoded.ai_uses_remaining - 1,
        time_remaining: timeRemaining
      },
      api_configured: !!process.env.GEMINI_API_KEY
    })

  } catch (error) {
    console.error('Individual apply-style error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}
