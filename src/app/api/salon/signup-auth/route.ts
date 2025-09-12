import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password } = await request.json()

    console.log('Auth signup request received:', { name, email, phone, address })

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists first
    console.log('Checking if user already exists...')
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Create user with Supabase Auth
    console.log('Creating user with Supabase Auth...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll send confirmation email separately
      user_metadata: {
        user_type: 'salon',
        salon_name: name,
        phone: phone || null,
        address: address || null
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      console.error('Full error details:', JSON.stringify(authError, null, 2))
      
      // Handle specific error cases
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        )
      }
      
      if (authError.message.includes('password')) {
        return NextResponse.json(
          { error: 'Password does not meet requirements' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('email')) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Database error creating new user` },
        { status: 500 }
      )
    }

    console.log('Auth user created:', authData.user.id)

    // Send email verification
    console.log('Sending email verification...')
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback?type=signup`
      }
    })

    if (emailError) {
      console.error('Email verification error:', emailError)
      // Don't fail the signup if email fails, just log it
    }

    // The salon record will be created automatically by the database trigger
    // when the user confirms their email

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user_id: authData.user.id,
      email_sent: !emailError,
      next_step: 'email_verification'
    })

  } catch (error) {
    console.error('Salon signup error:', error)
    return NextResponse.json(
      { error: `Failed to create salon account: ${error.message}` },
      { status: 500 }
    )
  }
}
