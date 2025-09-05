import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase Auth...')
    
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('salons')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Supabase connection error:', testError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError
      })
    }

    console.log('Database connection successful')

    // Test 2: Try to create a user
    const testEmail = `test-${Date.now()}@example.com`
    console.log('Testing user creation with email:', testEmail)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'password123'
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({
        success: false,
        error: 'Auth signup failed',
        details: authError
      })
    }

    console.log('User created successfully:', authData.user?.id)

    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      user_id: authData.user?.id,
      email_confirmed: !!authData.user?.email_confirmed_at
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    })
  }
}
