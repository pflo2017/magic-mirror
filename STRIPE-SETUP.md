# 🚀 Stripe Integration Setup Guide

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Test Mode**: Make sure you're in test mode (toggle in Stripe Dashboard)

## 🔑 Step 1: Get Stripe API Keys

### In your Stripe Dashboard:

1. Go to **Developers** → **API Keys**
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## ⚙️ Step 2: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🔗 Step 3: Set Up Webhook Endpoint

### In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: `http://localhost:3000/api/stripe/webhook`
4. **Events to send**: Select `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_`)

## 🧪 Step 4: Test with Stripe Test Cards

Use these test card numbers:

### ✅ Successful Payments:
- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

### ❌ Failed Payments (for testing):
- **Declined**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

### Card Details for Testing:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## 🎯 Step 5: Test the Integration

1. **Start your development server**: `npm run dev`
2. **Go to Dashboard** → **Settings** → **Subscription**
3. **Click "Purchase Now"** on an overage package
4. **Check the logs** for PaymentIntent creation
5. **Verify in Stripe Dashboard** → **Payments**

## 📊 What Happens When You Test:

1. **PaymentIntent Created**: You'll see the payment intent ID
2. **Webhook Triggered**: When payment succeeds (simulated for now)
3. **Images Added**: Your salon gets the additional images
4. **Billing History**: Purchase recorded in database

## 🔄 Production Deployment:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API Keys** (starts with `pk_live_` and `sk_live_`)
3. **Update Environment Variables** with live keys
4. **Set Webhook URL** to your production domain
5. **Test with Real Cards** (small amounts first!)

## 🛡️ Security Notes:

- ✅ **Never commit** `.env.local` to Git
- ✅ **Use test keys** for development
- ✅ **Webhook signatures** are verified for security
- ✅ **All payments** go through Stripe (PCI compliant)

## 🎉 Ready for Testing!

Your Stripe integration is now ready. The system will:
- Create PaymentIntents for overage purchases
- Process webhooks when payments succeed
- Automatically add images to salon accounts
- Record all transactions in billing history
