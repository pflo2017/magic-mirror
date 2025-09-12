import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salon_id')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Fetch salon information using admin client (v1 schema fields only)
    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, email, subscription_status')
      .eq('id', salonId)
      .single()

    if (error || !salon) {
      console.error('Salon fetch error:', error)
      
      // Return a default salon for demo purposes (v1 compatible)
      return NextResponse.json({
        success: true,
        salon: {
          id: salonId,
          name: 'Magic Mirror Virtual Try-On',
          logo: null,
          subscription_status: 'active',
          subscription_plan: null,
          city: null,
          address: null
        }
      })
    }

    return NextResponse.json({
      success: true,
      salon: {
        id: salon.id,
        name: salon.name || `Salon ${salon.email}`,
        logo: null, // v1 doesn't have logo_url field
        subscription_status: salon.subscription_status,
        subscription_plan: null, // v1 doesn't have subscription_plan field
        city: null, // v1 doesn't have city field
        address: null // v1 doesn't have address field
      }
    })

  } catch (error) {
    console.error('Salon info API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salon information' },
      { status: 500 }
    )
  }
}
