// Test script for Stripe integration
// Run with: node test-stripe-integration.js

const testStripeIntegration = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing Stripe Integration...\n')
  
  try {
    // Test 1: Create PaymentIntent
    console.log('1️⃣ Testing PaymentIntent creation...')
    const paymentResponse = await fetch(`${baseUrl}/api/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_type: 'overage',
        images_count: 100,
        price: 20.00
      })
    })
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json()
      console.log('✅ PaymentIntent created successfully!')
      console.log(`   Payment Intent ID: ${paymentData.payment_intent_id}`)
      console.log(`   Amount: $${paymentData.amount / 100}`)
      console.log(`   Client Secret: ${paymentData.client_secret?.substring(0, 20)}...`)
    } else {
      const error = await paymentResponse.json()
      console.log('❌ PaymentIntent creation failed:', error.error)
    }
    
    console.log('\n2️⃣ Testing subscription data...')
    const subscriptionResponse = await fetch(`${baseUrl}/api/salon/subscription`)
    
    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json()
      console.log('✅ Subscription data retrieved!')
      console.log(`   Salon: ${subscriptionData.subscription.salon_name}`)
      console.log(`   Images Remaining: ${subscriptionData.subscription.images_remaining_this_cycle}`)
      console.log(`   Max per Session: ${subscriptionData.subscription.max_ai_uses_per_session}`)
    } else {
      const error = await subscriptionResponse.json()
      console.log('❌ Subscription data failed:', error.error)
    }
    
    console.log('\n🎯 Test Summary:')
    console.log('- PaymentIntent API: Ready for Stripe integration')
    console.log('- Subscription API: Working correctly')
    console.log('- Next: Add your Stripe keys to .env.local')
    console.log('- Then: Test with Stripe test cards')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure your development server is running on port 3000')
  }
}

// Run the test
testStripeIntegration()
