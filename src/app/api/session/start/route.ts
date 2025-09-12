import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/database'

type Salon = Database['public']['Tables']['salons']['Row']
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
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, max_ai_uses, session_duration')
      .eq('id', salon_id)
      .single() as { data: Partial<Salon> | null, error: any }

    if (salonError || !salon) {
      console.error('Salon not found:', salonError)
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    // Create session record
    const { data: session, error } = await supabase
      .from('client_sessions')
      .insert({
        salon_id: salon.id,
        expires_at: expiresAt.toISOString(),
        max_ai_uses: salon.max_ai_uses || 5,
        ai_uses_count: 0,
        is_active: true
      } as any)
      .select()
      .single() as { data: ClientSession | null, error: any }

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session_token: session?.id,
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