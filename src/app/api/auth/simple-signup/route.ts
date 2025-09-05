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

    console.log('Creating user with admin client:', email)

    // Create user with admin client (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        user_type: 'salon'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('User created successfully:', authData.user.id)

    // Create salon record
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
      console.error('Salon creation error:', salonError)
      return NextResponse.json(
        { error: `Salon creation failed: ${salonError.message}` },
        { status: 500 }
      )
    }

    console.log('Salon created successfully:', salon.id)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      salon: {
        id: salon.id,
        name: salon.name
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: `Failed to create account: ${error.message}` },
      { status: 500 }
    )
  }
}
