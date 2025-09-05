import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign up with Supabase Auth - SIMPLE!
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.user?.email_confirmed_at 
        ? 'Account created successfully!' 
        : 'Please check your email to confirm your account.',
      needs_confirmation: !data.user?.email_confirmed_at
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
