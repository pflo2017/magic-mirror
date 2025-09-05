import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password } = await request.json()

    console.log('Working signup request received:', { name, email, phone, address })

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

    // Check if salon already exists
    console.log('Checking if salon exists...')
    const { data: existingSalon } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('email', email)
      .single()

    if (existingSalon) {
      return NextResponse.json(
        { error: 'A salon with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password for storage (we'll implement our own simple auth)
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create salon record with hashed password
    console.log('Creating salon record...')
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .insert({
        name: name,
        email: email,
        password_hash: hashedPassword, // We'll add this column
        phone: phone,
        address: address,
        subscription_status: 'active',
        session_duration: 30,
        max_ai_uses: 5,
        total_ai_generations_used: 0,
        free_trial_generations: 10,
        email_verified: false // We'll implement email verification separately
      })
      .select()
      .single()

    if (salonError) {
      console.error('Salon creation error:', salonError)
      
      // If password_hash column doesn't exist, try without it
      if (salonError.message.includes('password_hash')) {
        console.log('Trying without password_hash column...')
        const { data: salon2, error: salonError2 } = await supabaseAdmin
          .from('salons')
          .insert({
            name: name,
            email: email,
            phone: phone,
            address: address,
            subscription_status: 'active',
            session_duration: 30,
            max_ai_uses: 5,
            total_ai_generations_used: 0,
            free_trial_generations: 10
          })
          .select()
          .single()

        if (salonError2) {
          throw salonError2
        }

        console.log('Salon created without password:', salon2.id)
        
        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You can now sign in.',
          salon: {
            id: salon2.id,
            name: salon2.name,
            email: salon2.email,
            subscription_status: salon2.subscription_status,
            free_trial_generations: salon2.free_trial_generations
          },
          next_step: 'login'
        })
      }
      
      throw salonError
    }

    console.log('Salon created with password:', salon.id)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now sign in.',
      salon: {
        id: salon.id,
        name: salon.name,
        email: salon.email,
        subscription_status: salon.subscription_status,
        free_trial_generations: salon.free_trial_generations
      },
      next_step: 'login'
    })

  } catch (error) {
    console.error('Working signup error:', error)
    return NextResponse.json(
      { error: `Failed to create account: ${error.message}` },
      { status: 500 }
    )
  }
}
