import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('Creating user with Supabase Auth:', email)

    // Create user with Supabase Auth (admin method for auto-confirm)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm since you disabled email confirmation
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log('✅ User created successfully:', authData.user.id)

    // Create salon record
    try {
      const { data: salon, error: salonError } = await supabaseAdmin
        .from('salons')
        .insert({
          auth_user_id: authData.user.id,
          name: `Salon ${authData.user.email}`,
          email: authData.user.email!,
          subscription_status: 'active',
          session_duration: 30,
          max_ai_uses: 5,
          total_ai_generations_used: 0,
          free_trial_generations: 10
        })
        .select()
        .single()

      if (salonError) {
        console.error('❌ Salon creation error:', salonError)
        // User is created, but salon failed - that's OK, they can complete setup later
      } else {
        console.log('✅ Salon created successfully:', salon.id)
      }
    } catch (salonError) {
      console.error('❌ Salon creation exception:', salonError)
      // Continue - user is created successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: authData.user.email_confirmed_at !== null
      }
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}