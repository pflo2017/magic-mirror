import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json()

    if (!session_token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get session details
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_token)
      .eq('is_active', true)
      .single()

    if (error || !session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      )
    }

    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(session.expires_at)
    
    if (now > expiresAt) {
      // Mark session as inactive
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', session_token)

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Check if AI uses are exhausted
    if (session.ai_uses_count >= session.max_ai_uses) {
      return NextResponse.json(
        { error: 'AI usage limit reached' },
        { status: 429 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        salon_id: session.salon_id,
        expires_at: session.expires_at,
        ai_uses_remaining: session.max_ai_uses - session.ai_uses_count,
        time_remaining: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      }
    })

  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  }
}