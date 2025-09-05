import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Function to geocode address (for future map feature)
async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // For now, return null - in production, you would use Google Maps Geocoding API
    // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${address}, ${city}`)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    // const data = await response.json()
    // if (data.results && data.results.length > 0) {
    //   const location = data.results[0].geometry.location
    //   return { lat: location.lat, lng: location.lng }
    // }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

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

    // Geocode address for future map feature (if both city and address are provided)
    let coordinates = null
    if (city?.trim() && address?.trim()) {
      coordinates = await geocodeAddress(address.trim(), city.trim())
    }

    let result
    if (existingSalon) {
      // Update existing salon
      const updateData: any = {
        name: salon_name.trim(),
        location: location?.trim() || null,
        city: city?.trim() || null,
        address: address?.trim() || null
      }

      // Add coordinates if available (for future map feature)
      if (coordinates) {
        updateData.latitude = coordinates.lat
        updateData.longitude = coordinates.lng
      }

      const { data, error } = await supabaseAdmin
        .from('salons')
        .update(updateData)
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
      const insertData: any = {
        auth_user_id: user_id,
        email: email || `${user_id}@temp.com`,
        name: salon_name.trim(),
        location: location?.trim() || null,
        city: city?.trim() || null,
        address: address?.trim() || null,
        subscription_status: 'active',
        subscription_plan: 'starter',
        max_ai_uses: 20, // 20 AI transformations per client session
        session_duration: 30, // 30 minutes per session
        total_ai_generations_used: 0,
        free_trial_generations: 10
      }

      // Add coordinates if available (for future map feature)
      if (coordinates) {
        insertData.latitude = coordinates.lat
        insertData.longitude = coordinates.lng
      }

      const { data, error } = await supabaseAdmin
        .from('salons')
        .insert(insertData)
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
