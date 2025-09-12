import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password } = await request.json()

    console.log('Manual signup request received:', { name, email, phone, address })

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user
    console.log('Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'salon',
          salon_name: name,
          phone: phone || null,
          address: address || null
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: `Failed to create account: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('Auth user created:', authData.user.id)

    // Step 2: Manually create salon record (in case trigger doesn't work)
    console.log('Creating salon record manually...')
    try {
      const { data: salonData, error: salonError } = await supabaseAdmin
        .from('salons')
        .insert({
          auth_user_id: authData.user.id,
          name: name,
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
        // Don't fail the signup if salon creation fails - the trigger might handle it
        console.log('Salon creation failed, but auth user exists. Trigger might handle it.')
      } else {
        console.log('Salon record created manually:', salonData.id)
      }
    } catch (salonCreateError) {
      console.error('Manual salon creation failed:', salonCreateError)
      // Continue anyway - the trigger might work
    }

    // Step 3: Return success
    if (authData.user && !authData.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        user_id: authData.user.id,
        email_confirmation_required: true,
        next_step: 'email_verification'
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        user_id: authData.user.id,
        email_confirmation_required: false,
        next_step: 'dashboard'
      })
    }

  } catch (error) {
    console.error('Manual signup error:', error)
    return NextResponse.json(
      { error: `Failed to create account: ${error.message}` },
      { status: 500 }
    )
  }
}
