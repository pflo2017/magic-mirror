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

    // Sign in with Supabase Auth (client-side)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Auth login error:', authError)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
