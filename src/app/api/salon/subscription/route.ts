import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Type definitions for salon data
interface SalonData {
  id: string
  name: string
  images_used_this_cycle: number
  images_remaining_this_cycle: number
  total_images_available: number
  max_ai_uses: number
  billing_cycle_start: string
  billing_cycle_end: string
  subscription_status: string
  subscription_plan_id: string
  subscription_plans?: {
    id: string
    name: string
    price_monthly: number
    images_included: number
  }
}

// GET - Get salon's current subscription status
export async function GET(request: NextRequest) {
  try {
    // For testing, we'll use the first salon, but in production this should use proper auth
    const url = new URL(request.url)
    let salonId = url.searchParams.get('salon_id')

    // If no salon_id provided, get the first salon (for testing)
    if (!salonId) {
      const { data: salons, error: salonsError } = await supabaseAdmin
        .from('salons')
        .select('id')
        .limit(1) as { data: Array<{ id: string }> | null, error: any }

      if (salonsError || !salons || salons.length === 0) {
        console.log('❌ Subscription API - No salons found:', salonsError?.message)
        return NextResponse.json({ error: 'No salons found' }, { status: 404 })
      }

      salonId = salons[0].id
    }

    console.log('✅ Subscription API - Using salon ID:', salonId)

    // Get salon with subscription details
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select(`
        id,
        name,
        images_used_this_cycle,
        images_remaining_this_cycle,
        total_images_available,
        max_ai_uses,
        billing_cycle_start,
        billing_cycle_end,
        subscription_status,
        subscription_plan_id,
        subscription_plans (
          id,
          name,
          price_monthly,
          images_included
        )
      `)
      .eq('id', salonId!)
      .single() as { data: SalonData | null, error: any }

    if (salonError || !salon) {
      console.error('❌ Subscription API - Salon fetch error:', salonError?.message)
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    console.log('✅ Subscription API - Salon data:', salon)

    // Calculate days remaining in billing cycle
    const today = new Date()
    const cycleEnd = salon.billing_cycle_end ? new Date(salon.billing_cycle_end) : null
    const daysRemaining = cycleEnd ? Math.ceil((cycleEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Use hardcoded plan data to avoid permission issues
    const standardPlan = {
      id: 'standard',
      name: 'Standard Plan',
      price_per_month: 49,
      included_images: 200
    }

    // Calculate usage percentage
    const totalIncluded = standardPlan.included_images
    const usagePercentage = Math.round((salon.images_used_this_cycle / totalIncluded) * 100)

    return NextResponse.json({
      success: true,
      subscription: {
        salon_id: salon.id,
        salon_name: salon.name,
        status: salon.subscription_status,
        plan: standardPlan,
        images_used_this_cycle: salon.images_used_this_cycle,
        images_remaining_this_cycle: salon.images_remaining_this_cycle,
        total_images_available: salon.total_images_available,
        billing_cycle_start: salon.billing_cycle_start,
        billing_cycle_end: salon.billing_cycle_end,
        days_remaining_in_cycle: daysRemaining,
        session_duration: 30, // Default value
        max_ai_uses_per_session: salon.max_ai_uses
      }
    })

  } catch (error) {
    console.error('❌ Subscription API error:', error)
    return NextResponse.json({ error: 'Failed to get subscription status' }, { status: 500 })
  }
}

// POST - Purchase overage images
export async function POST(request: NextRequest) {
  try {
    const { package_type, images_count, price } = await request.json()

    if (!images_count || images_count < 1) {
      return NextResponse.json({ error: 'Invalid images_count parameter' }, { status: 400 })
    }

    // Get the first salon (for testing)
    const { data: salons, error: salonsError } = await supabaseAdmin
      .from('salons')
      .select('id, images_remaining_this_cycle, images_used_this_cycle, total_images_available')
      .limit(1) as { data: Array<{
        id: string
        images_remaining_this_cycle: number
        images_used_this_cycle: number
        total_images_available: number
      }> | null, error: any }

    if (salonsError || !salons || salons.length === 0) {
      return NextResponse.json({ error: 'No salons found' }, { status: 404 })
    }

    const salon = salons[0]

    // Update salon's image counts
    const { error: updateError } = await (supabaseAdmin as any)
      .from('salons')
      .update({
        images_remaining_this_cycle: salon.images_remaining_this_cycle + images_count,
        total_images_available: salon.total_images_available + images_count
      })
      .eq('id', salon.id)

    if (updateError) {
      console.error('❌ Purchase update error:', updateError)
      return NextResponse.json({ error: 'Failed to update salon images' }, { status: 500 })
    }

    // Record the purchase in billing history
    const { error: billingError } = await (supabaseAdmin as any)
      .from('billing_history')
      .insert({
        salon_id: salon.id,
        transaction_type: 'overage_purchase',
        amount: price,
        description: `Purchased ${images_count} additional images`,
        images_purchased: images_count,
        created_at: new Date().toISOString()
      })

    if (billingError) {
      console.error('❌ Billing history error:', billingError)
      // Don't fail the request if billing history fails
    }

    console.log(`✅ Successfully purchased ${images_count} images for salon ${salon.id}`)

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${images_count} additional images`,
      images_added: images_count,
      total_cost: price
    })

  } catch (error) {
    console.error('❌ Purchase overage error:', error)
    return NextResponse.json({ error: 'Failed to purchase overage images' }, { status: 500 })
  }
}

// PUT - Update salon settings (max images per session)
export async function PUT(request: NextRequest) {
  try {
    const { max_ai_uses } = await request.json()

    if (!max_ai_uses || max_ai_uses < 1 || max_ai_uses > 20) {
      return NextResponse.json({ error: 'max_ai_uses must be between 1 and 20' }, { status: 400 })
    }

    // Get the first salon (for testing)
    const { data: salons, error: salonsError } = await supabaseAdmin
      .from('salons')
      .select('id')
      .limit(1) as { data: Array<{ id: string }> | null, error: any }

    if (salonsError || !salons || salons.length === 0) {
      return NextResponse.json({ error: 'No salons found' }, { status: 404 })
    }

    const salon = salons[0]

    // Update salon settings
    const { error: updateError } = await (supabaseAdmin as any)
      .from('salons')
      .update({ max_ai_uses })
      .eq('id', salon.id)

    if (updateError) {
      console.error('❌ Update settings error:', updateError)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    console.log(`✅ Updated max_ai_uses to ${max_ai_uses} for salon ${salon.id}`)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      max_ai_uses
    })

  } catch (error) {
    console.error('❌ Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
