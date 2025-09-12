# 🚀 Production Deployment Guide

## 🏗️ **Architecture Overview**

Our payment system is designed to work seamlessly in both development and production:

### **Payment Flow:**
1. **User clicks "Purchase"** → Creates Stripe Checkout Session
2. **Redirects to Stripe** → User completes payment on Stripe's secure page
3. **Returns to app** → App verifies payment and adds images
4. **Backup webhook** → Stripe webhook also processes payment (redundancy)

### **Key Features:**
- ✅ **Idempotent**: Prevents duplicate charges/credits
- ✅ **Resilient**: Works even if webhooks fail
- ✅ **Secure**: No card data touches our servers
- ✅ **Production-ready**: Scales to thousands of transactions

## 🌐 **Production Setup Steps**

### **1. Domain & Hosting**
```bash
# Deploy to Vercel, Netlify, or your preferred platform
npm run build
```

### **2. Environment Variables**
Update your production environment with:
```env
# Stripe (PRODUCTION KEYS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-key
```

### **3. Stripe Webhook Configuration**
1. **Go to**: [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**: `https://yourdomain.com/api/stripe/webhook`
3. **Select events**: `checkout.session.completed`
4. **Copy webhook secret** to `STRIPE_WEBHOOK_SECRET`

### **4. Database Setup**
Run these SQL scripts in your production Supabase:
```sql
-- Run in order:
1. supabase/create-subscription-system.sql
2. setup-subscription-data.sql
3. fix-subscription-permissions.sql
4. fix-subscription-security.sql
```

### **5. Test Production Flow**
1. **Use Stripe test cards** in production mode
2. **Verify webhook logs** in Stripe dashboard
3. **Check database** for correct image credits
4. **Test complete user journey**

## 🔧 **Development vs Production**

| Feature | Development | Production |
|---------|-------------|------------|
| **Stripe Keys** | `pk_test_...` | `pk_live_...` |
| **Webhook URL** | `ngrok` tunnel | `https://yourdomain.com` |
| **Database** | Test/staging | Production Supabase |
| **Error Handling** | Console logs | Error monitoring |

## 🛡️ **Security Checklist**

- ✅ **Environment variables** secured (not in code)
- ✅ **Webhook signatures** verified
- ✅ **Database RLS** enabled
- ✅ **API rate limiting** implemented
- ✅ **HTTPS** enforced
- ✅ **Input validation** on all endpoints

## 📊 **Monitoring & Maintenance**

### **Key Metrics to Monitor:**
- Payment success rate
- Webhook delivery success
- Image credit accuracy
- API response times
- Error rates

### **Regular Tasks:**
- Monitor Stripe dashboard for failed payments
- Check webhook delivery logs
- Verify database consistency
- Update Stripe API versions

## 🚨 **Troubleshooting Production Issues**

### **Payment Not Processing:**
1. Check Stripe webhook logs
2. Verify webhook endpoint is reachable
3. Check database permissions
4. Validate environment variables

### **Images Not Added:**
1. Check `/api/stripe/verify-payment` logs
2. Verify salon ID in metadata
3. Check database update queries
4. Ensure no duplicate transactions

### **Webhook Failures:**
1. Stripe automatically retries failed webhooks
2. Our verification API provides backup processing
3. Check webhook signature validation
4. Monitor webhook endpoint health

## 🎯 **Go-Live Checklist**

- [ ] Production Stripe keys configured
- [ ] Webhook endpoint tested and verified
- [ ] Database scripts executed
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Payment flow tested end-to-end
- [ ] Backup/recovery procedures documented
- [ ] Team trained on monitoring tools

**🚀 Ready for production when all items are checked!**

