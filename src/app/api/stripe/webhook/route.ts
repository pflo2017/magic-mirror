import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Find salon by stripe customer ID
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!salon) {
          console.error('No salon found for customer:', customerId)
          break
        }

        // Map subscription status
        let status = 'inactive'
        switch (subscription.status) {
          case 'active':
            status = 'active'
            break
          case 'past_due':
            status = 'past_due'
            break
          case 'canceled':
          case 'unpaid':
            status = 'cancelled'
            break
        }

        // Get plan details from price ID
        const priceId = subscription.items.data[0]?.price.id
        let planName = 'starter'
        let maxAiUses = 100
        let sessionDuration = 30

        // Map price IDs to plans
        switch (priceId) {
          case process.env.STRIPE_STARTER_PRICE_ID:
            planName = 'starter'
            maxAiUses = 100
            sessionDuration = 30
            break
          case process.env.STRIPE_PROFESSIONAL_PRICE_ID:
            planName = 'professional'
            maxAiUses = 500
            sessionDuration = 60
            break
          case process.env.STRIPE_ENTERPRISE_PRICE_ID:
            planName = 'enterprise'
            maxAiUses = -1 // unlimited
            sessionDuration = 120
            break
        }

        // Update salon
        await supabase
          .from('salons')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            subscription_plan: planName,
            max_ai_uses: maxAiUses,
            session_duration: sessionDuration,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', salon.id)

        console.log(`Updated salon ${salon.id} subscription: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Find salon and downgrade to free
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (salon) {
          await supabase
            .from('salons')
            .update({
              subscription_status: 'cancelled',
              subscription_plan: 'free',
              max_ai_uses: 10, // Free tier
              session_duration: 15,
              updated_at: new Date().toISOString()
            })
            .eq('id', salon.id)

          console.log(`Canceled subscription for salon ${salon.id}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        if (subscriptionId) {
          // Reset usage counters for new billing period
          await supabase
            .from('salons')
            .update({
              total_ai_generations_used: 0,
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId)

          console.log(`Payment succeeded, reset usage for subscription ${subscriptionId}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Mark salon as past due
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (salon) {
          await supabase
            .from('salons')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('id', salon.id)

          console.log(`Payment failed for salon ${salon.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 400 }
    )
  }
}
