import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/salons/locations - Fetch all active salon locations for the map
export async function GET() {
  try {
    const { data: salons, error } = await supabaseAdmin
      .from('salon_locations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching salon locations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch salon locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      salons: salons || [],
      count: salons?.length || 0
    })

  } catch (error) {
    console.error('Salon locations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// This endpoint will be used by the landing page to show a map of all contracted salons
// Example usage:
// const response = await fetch('/api/salons/locations')
// const { salons } = await response.json()
// // Use salons array to populate map markers


