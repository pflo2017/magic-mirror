import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verifying payment for session: ${session_id}`)

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Extract metadata
    const {
      salon_id,
      salon_name,
      package_type,
      images_count,
      price
    } = session.metadata || {}

    console.log('📋 Session metadata:', session.metadata)

    if (!salon_id || !images_count || !price) {
      console.error('❌ Missing metadata in session:', session.metadata)
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      )
    }

    console.log(`💰 Processing payment: ${images_count} images for $${price} (salon: ${salon_id})`)

    const imagesCount = parseInt(images_count)
    const amount = parseFloat(price)

    // Check if this payment was already processed (using session metadata as identifier)
    const { data: existingTransaction } = await supabaseAdmin
      .from('billing_history')
      .select('id')
      .eq('salon_id', salon_id)
      .eq('overage_charges', amount)
      .eq('overage_images', imagesCount)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Within last 5 minutes
      .single()

    if (existingTransaction) {
      console.log(`✅ Payment already processed for session: ${session_id}`)
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        images_added: imagesCount
      })
    }

    // Get current salon data
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('images_remaining_this_cycle, total_images_available')
      .eq('id', salon_id)
      .single() as { 
        data: { 
          images_remaining_this_cycle: number
          total_images_available: number 
        } | null, 
        error: any 
      }

    if (salonError || !salon) {
      console.error('❌ Failed to fetch salon:', salonError?.message)
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Update salon's image counts
    const { error: updateError } = await supabaseAdmin
      .from('salons')
      .update({
        images_remaining_this_cycle: salon.images_remaining_this_cycle + imagesCount,
        total_images_available: salon.total_images_available + imagesCount
      })
      .eq('id', salon_id)

    if (updateError) {
      console.error('❌ Failed to update salon images:', updateError)
      return NextResponse.json({ error: 'Failed to update salon' }, { status: 500 })
    }

    // Record the purchase in billing history
    console.log('💾 Recording billing history...')
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    
    const billingData = {
      salon_id,
      billing_period_start: today.toISOString().split('T')[0], // YYYY-MM-DD format
      billing_period_end: nextMonth.toISOString().split('T')[0],
      base_plan_charge: 0, // This is an overage purchase, not base plan
      overage_charges: amount,
      total_charge: amount,
      images_used: 0, // This is a purchase, not usage
      images_included: 0, // This is overage images
      overage_images: imagesCount,
      payment_status: 'completed',
      // Stripe transaction tracking
      stripe_checkout_session_id: session_id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string || null,
      payment_method_type: 'card', // Stripe checkout default
      currency: session.currency?.toUpperCase() || 'USD',
      transaction_type: package_type || 'overage_purchase',
      description: `Purchased ${imagesCount} additional images via Stripe Checkout`,
      metadata: {
        stripe_session_id: session_id,
        stripe_amount_total: session.amount_total,
        stripe_payment_status: session.payment_status,
        original_metadata: session.metadata
      },
      processed_at: new Date().toISOString()
    }
    
    console.log('📝 Billing data:', billingData)
    
    const { data: billingResult, error: billingError } = await supabaseAdmin
      .from('billing_history')
      .insert(billingData)
      .select()

    if (billingError) {
      console.error('❌ Failed to record billing history:', billingError)
      console.error('❌ Billing error details:', JSON.stringify(billingError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to record transaction',
        details: billingError.message 
      }, { status: 500 })
    }
    
    console.log('✅ Billing history recorded:', billingResult)

    console.log(`🎉 Successfully verified and processed payment: +${imagesCount} images for salon ${salon_name}`)

    return NextResponse.json({
      success: true,
      message: 'Payment verified and images added',
      images_added: imagesCount,
      new_balance: salon.images_remaining_this_cycle + imagesCount
    })

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
