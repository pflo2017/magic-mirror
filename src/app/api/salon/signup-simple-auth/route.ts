import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password } = await request.json()

    console.log('Simple auth signup request received:', { name, email, phone, address })

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

    // Use regular Supabase Auth signup (client-side method)
    console.log('Creating user with regular Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'salon',
          salon_name: name,
          phone: phone || null,
          address: address || null
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback?type=signup`
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        )
      }
      
      if (authError.message.includes('password')) {
        return NextResponse.json(
          { error: 'Password does not meet requirements (minimum 6 characters)' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('email')) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Signup failed: ${authError.message}` },
        { status: 400 }
      )
    }

    console.log('Auth signup successful:', authData.user?.id)

    // Check if email confirmation is required
    if (authData.user && !authData.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        user_id: authData.user.id,
        email_confirmation_required: true,
        next_step: 'email_verification'
      })
    } else {
      // If email confirmation is not required (e.g., in development)
      return NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        user_id: authData.user?.id,
        email_confirmation_required: false,
        next_step: 'dashboard'
      })
    }

  } catch (error) {
    console.error('Salon signup error:', error)
    return NextResponse.json(
      { error: `Failed to create account: ${error.message}` },
      { status: 500 }
    )
  }
}
