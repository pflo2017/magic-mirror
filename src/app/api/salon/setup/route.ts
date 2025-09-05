import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { salon_name, location, city, address, user_id, email } = await request.json()

    if (!salon_name?.trim() || !user_id) {
      return NextResponse.json(
        { error: 'Salon name and user ID are required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Check if salon already exists for this user
    const { data: existingSalon } = await supabaseAdmin
      .from('salons')
      .select('id, name, location, city, address')
      .eq('auth_user_id', user_id)
      .single()

    let result
    if (existingSalon) {
      // Update existing salon
      const { data, error } = await supabaseAdmin
        .from('salons')
        .update({
          name: salon_name.trim(),
          location: location?.trim() || null,
          city: city?.trim() || null,
          address: address?.trim() || null
        })
        .eq('auth_user_id', user_id)
        .select()
        .single()

      if (error) {
        console.error('Salon update error:', error)
        return NextResponse.json(
          { error: 'Failed to update salon information' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Create new salon
      const { data, error } = await supabaseAdmin
        .from('salons')
        .insert({
          auth_user_id: user_id,
          email: email || `${user_id}@temp.com`,
          name: salon_name.trim(),
          location: location?.trim() || null,
          city: city?.trim() || null,
          address: address?.trim() || null,
          subscription_status: 'active',
          subscription_plan: 'starter',
          max_ai_uses: 100,
          session_duration: 30,
          total_ai_generations_used: 0,
          free_trial_generations: 10
        })
        .select()
        .single()

      if (error) {
        console.error('Salon creation error:', error)
        return NextResponse.json(
          { error: 'Failed to create salon' },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      salon: result
    })

  } catch (error) {
    console.error('Salon setup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
