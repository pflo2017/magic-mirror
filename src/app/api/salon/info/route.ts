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

    // Fetch salon information using admin client
    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, email, logo_url, subscription_status, subscription_plan, city, address')
      .eq('id', salonId)
      .single()

    if (error || !salon) {
      console.error('Salon fetch error:', error)
      // Try to find salon by auth_user_id if direct ID lookup failed
      const { data: salonByAuth } = await supabaseAdmin
        .from('salons')
        .select('id, name, email, logo_url, subscription_status, subscription_plan, city, address')
        .eq('auth_user_id', salonId)
        .single()

      if (salonByAuth) {
        return NextResponse.json({
          success: true,
          salon: {
            id: salonByAuth.id,
            name: salonByAuth.name || `Salon ${salonByAuth.email}`,
            logo: salonByAuth.logo_url,
            subscription_status: salonByAuth.subscription_status,
            subscription_plan: salonByAuth.subscription_plan,
            city: salonByAuth.city,
            address: salonByAuth.address
          }
        })
      }

      // Return a default salon for demo purposes
      return NextResponse.json({
        success: true,
        salon: {
          id: salonId,
          name: 'Magic Mirror Virtual Try-On',
          logo: null,
          subscription_status: 'active',
          subscription_plan: 'starter'
        }
      })
    }

    return NextResponse.json({
      success: true,
      salon: {
        id: salon.id,
        name: salon.name || `Salon ${salon.email}`,
        logo: salon.logo_url,
        subscription_status: salon.subscription_status,
        subscription_plan: salon.subscription_plan,
        city: salon.city,
        address: salon.address
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
