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

    // For individual users, we'll provide a demo experience (no AI processing to keep it simple)
    // In a production environment, you could integrate AI processing here
    let generatedImageUrl: string = image_url // Use original image as demo
    let aiStatus = { 
      used_ai: false, 
      prompt_used: 'Demo mode - Individual user experience'
    }

    console.log('✅ Demo transformation completed for individual user')

    // Calculate remaining time
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

    // Create new JWT token with decremented AI uses
    const newSessionToken = jwt.sign(
      { 
        ...decoded,
        ai_uses_remaining: decoded.ai_uses_remaining - 1,
        updated_at: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: `${Math.ceil(timeRemaining / 60)}m` }
    )

    return NextResponse.json({
      success: true,
      generated_image_url: generatedImageUrl,
      new_session_token: newSessionToken, // Updated token with decremented uses
      style: {
        id: style.id,
        name: style.name,
        category: style.category,
        prompt: style.prompt
      },
      session: {
        ai_uses_remaining: decoded.ai_uses_remaining - 1,
        time_remaining: timeRemaining
      },
      ai_status: aiStatus
    })

  } catch (error) {
    console.error('Individual apply-style error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}
