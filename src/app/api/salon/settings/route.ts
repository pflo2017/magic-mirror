import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// PUT /api/salon/settings - Update salon session settings
export async function PUT(request: NextRequest) {
  try {
    const { user_id, session_duration, max_ai_uses } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate session duration (5-120 minutes)
    if (session_duration !== undefined) {
      if (typeof session_duration !== 'number' || session_duration < 5 || session_duration > 120) {
        return NextResponse.json(
          { error: 'Session duration must be between 5 and 120 minutes' },
          { status: 400 }
        )
      }
    }

    // Validate max AI uses (1-50 per session)
    if (max_ai_uses !== undefined) {
      if (typeof max_ai_uses !== 'number' || max_ai_uses < 1 || max_ai_uses > 50) {
        return NextResponse.json(
          { error: 'AI uses per session must be between 1 and 50' },
          { status: 400 }
        )
      }
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (session_duration !== undefined) {
      updateData.session_duration = session_duration
    }
    if (max_ai_uses !== undefined) {
      updateData.max_ai_uses = max_ai_uses
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No settings provided to update' },
        { status: 400 }
      )
    }

    // Update salon settings - MULTI-TENANT: Only update salon for this specific user
    const { data, error } = await supabaseAdmin
      .from('salons')
      .update(updateData)
      .eq('auth_user_id', user_id) // CRITICAL: Ensure we only update THIS salon's data
      .select('id, session_duration, max_ai_uses, name')
      .single()

    if (error) {
      console.error('Salon settings update error:', error)
      return NextResponse.json(
        { error: 'Failed to update salon settings' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Salon not found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      salon: data,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Salon settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/salon/settings - Get current salon settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Get salon settings - MULTI-TENANT: Only get data for this specific user
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, session_duration, max_ai_uses, subscription_status')
      .eq('auth_user_id', user_id) // CRITICAL: Ensure we only get THIS salon's data
      .single()

    if (error) {
      console.error('Salon settings fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch salon settings' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Salon not found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      salon: data
    })

  } catch (error) {
    console.error('Salon settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

