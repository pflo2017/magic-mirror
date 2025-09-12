# 🔗 Stripe Webhook Setup Guide

## 📋 **Step 1: Configure Webhook in Stripe Dashboard**

1. **Go to**: [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `http://localhost:3000/api/stripe/webhook`
4. **Events to send**: Select `checkout.session.completed`
5. **Click**: "Add endpoint"

## 🔑 **Step 2: Get Webhook Secret**

1. **Click** on your newly created webhook
2. **Copy** the "Signing secret" (starts with `whsec_`)
3. **Add to** your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## 🧪 **Step 3: Test with ngrok (for localhost)**

Since Stripe can't reach `localhost:3000`, you need to expose it:

1. **Install ngrok**: `npm install -g ngrok`
2. **Run**: `ngrok http 3000`
3. **Copy** the `https://` URL (e.g., `https://abc123.ngrok.io`)
4. **Update webhook URL** in Stripe to: `https://abc123.ngrok.io/api/stripe/webhook`

## ✅ **Step 4: Test the Flow**

1. **Make a test purchase** in your dashboard
2. **Check terminal** for webhook logs:
   ```
   🔔 Received Stripe webhook: checkout.session.completed
   ✅ Checkout completed: cs_test_...
   🎉 Successfully processed payment: +100 images for salon beauty emas
   ```
3. **Verify** images are added to your account

## 🚨 **Troubleshooting**

- **No webhook logs?** → Check ngrok URL and webhook endpoint
- **Webhook fails?** → Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
- **Images not added?** → Check database permissions and salon ID

## 🔄 **Production Setup**

For production, replace `localhost:3000` with your actual domain:
- **Webhook URL**: `https://yourdomain.com/api/stripe/webhook`
- **Use production** Stripe keys and webhook secret

