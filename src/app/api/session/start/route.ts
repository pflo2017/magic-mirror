import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { salon_id } = await request.json()

    if (!salon_id) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // First, get the salon record to ensure it exists (look by salon ID directly)
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('id, max_ai_uses, session_duration')
      .eq('id', salon_id)
      .single()

    if (salonError || !salon) {
      console.error('Salon not found:', salonError)
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    // Create session record
    const { data: session, error } = await supabaseAdmin
      .from('client_sessions')
      .insert({
        salon_id: salon.id,
        expires_at: expiresAt.toISOString(),
        max_ai_uses: salon.max_ai_uses || 5,
        ai_uses_count: 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session_token: session.id,
      expires_at: expiresAt.toISOString(),
      max_ai_uses: salon.max_ai_uses || 5,
      session_duration: salon.session_duration || 15,
      salon_id: salon.id
    })

  } catch (error) {
    console.error('Session start error:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}