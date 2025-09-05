import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('=== SIGNUP ATTEMPT ===')
    console.log('Email:', email)
    console.log('Password length:', password?.length)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Step 1: Just create salon record directly (skip auth for now)
    console.log('Creating salon directly...')
    
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .insert({
        name: `Salon ${email}`,
        email: email,
        subscription_status: 'active',
        session_duration: 30,
        max_ai_uses: 5,
        total_ai_generations_used: 0,
        free_trial_generations: 10
      })
      .select()
      .single()

    if (salonError) {
      console.error('Salon creation error:', salonError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: salonError.message 
      }, { status: 500 })
    }

    console.log('✅ Salon created:', salon.id)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      salon: salon
    })

  } catch (error) {
    console.error('❌ Signup failed:', error)
    return NextResponse.json({ 
      error: 'Signup failed', 
      details: error.message 
    }, { status: 500 })
  }
}
