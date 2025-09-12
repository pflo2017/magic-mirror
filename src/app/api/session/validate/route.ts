import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type ClientSession = Database['public']['Tables']['client_sessions']['Row']

// Create a properly typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json()

    if (!session_token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Using the properly typed client defined above

    // Get session details
    const { data: session, error } = await supabase
      .from('client_sessions')
      .select('*')
      .eq('id', session_token)
      .eq('is_active', true)
      .single() as { data: ClientSession | null, error: any }

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
      await (supabase as any)
        .from('client_sessions')
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