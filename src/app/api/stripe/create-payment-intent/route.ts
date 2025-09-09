import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { package_type, images_count, price } = await request.json()

    // Validate input
    if (!package_type || !images_count || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: package_type, images_count, price' },
        { status: 400 }
      )
    }

    // Get salon information (for testing, use first salon)
    const { data: salons, error: salonsError } = await supabaseAdmin
      .from('salons')
      .select('id, name')
      .limit(1) as { data: Array<{ id: string, name: string }> | null, error: any }

    if (salonsError || !salons || salons.length === 0) {
      return NextResponse.json({ error: 'No salon found' }, { status: 404 })
    }

    const salon = salons[0]

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        salon_id: salon.id,
        salon_name: salon.name,
        package_type,
        images_count: images_count.toString(),
        price: price.toString(),
      },
      description: `${images_count} additional images for ${salon.name}`,
    })

    console.log(`✅ Created PaymentIntent: ${paymentIntent.id} for ${images_count} images ($${price})`)

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })

  } catch (error) {
    console.error('❌ Stripe PaymentIntent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
