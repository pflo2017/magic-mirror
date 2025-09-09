import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
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

    // Create Stripe Checkout Session (redirects to Stripe's hosted page)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${images_count} Additional Images`,
              description: `Hair Try-On AI Image Package for ${salon.name}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/dashboard?payment=success&images=${images_count}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/dashboard?payment=cancelled`,
      metadata: {
        salon_id: salon.id,
        salon_name: salon.name,
        package_type,
        images_count: images_count.toString(),
        price: price.toString(),
      }
    })

    console.log(`✅ Created Checkout Session: ${session.id} for ${images_count} images ($${price})`)

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    })

  } catch (error) {
    console.error('❌ Stripe Checkout Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
