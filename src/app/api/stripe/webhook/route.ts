import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook received at:', new Date().toISOString())
    
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    console.log('📝 Webhook body length:', body.length)
    console.log('🔐 Signature present:', !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified successfully')
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`🔔 Processing Stripe webhook: ${event.type}`)

    // Handle successful checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log(`✅ Checkout completed: ${session.id}`)
      console.log('📋 Metadata:', session.metadata)

      // Extract metadata
      const {
        salon_id,
        salon_name,
        package_type,
        images_count,
        price
      } = session.metadata || {}

      if (!salon_id || !images_count || !price) {
        console.error('❌ Missing required metadata in Checkout Session')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const imagesCount = parseInt(images_count)
      const amount = parseFloat(price)

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
      const { error: updateError } = await (supabaseAdmin as any)
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
      const { error: billingError } = await (supabaseAdmin as any)
        .from('billing_history')
        .insert({
          salon_id,
          transaction_type: 'overage_purchase',
          amount,
          description: `Purchased ${imagesCount} additional images via Stripe`,
          images_purchased: imagesCount,
          stripe_payment_intent_id: session.payment_intent as string,
          created_at: new Date().toISOString()
        })

      if (billingError) {
        console.error('❌ Failed to record billing history:', billingError)
        // Don't fail the webhook for billing history errors
      }

      console.log(`🎉 Successfully processed payment: +${imagesCount} images for salon ${salon_name}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}