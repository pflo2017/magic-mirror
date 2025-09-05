# Deployment Guide

This guide covers deploying the Hair Try-On SaaS platform to production.

## 🚀 Quick Deploy Checklist

- [ ] Set up Supabase project
- [ ] Configure Stripe account
- [ ] Get Gemini API key
- [ ] Set up Redis instance
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up webhook endpoints
- [ ] Deploy worker processes
- [ ] Test the complete flow

## 📋 Prerequisites

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key
3. Generate a service role key
4. Create storage buckets:
   - `hair-tryon-images` (public read access)
   - `salon-assets` (public read access)

### 2. Stripe Account Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create products and pricing:
   ```
   Basic Plan: $29/month
   Professional Plan: $59/month  
   Premium Plan: $99/month
   ```
3. Note the price IDs for each plan
4. Generate API keys (publishable and secret)

### 3. Google AI Studio

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create a new API key
3. Enable Gemini 1.5 Flash model access

### 4. Redis Instance

Choose one of these options:

**Option A: Upstash Redis (Recommended)**
1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Note the connection URL

**Option B: Redis Cloud**
1. Sign up at [redis.com](https://redis.com)
2. Create a new database
3. Note the connection details

**Option C: Self-hosted**
- Set up Redis on your server
- Ensure it's accessible from your deployment

## 🔧 Environment Configuration

Create a `.env.local` file with your production values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Redis
REDIS_URL=redis://your-redis-url:6379

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your-secure-jwt-secret-256-bits
```

## 🗄️ Database Setup

### 1. Run Schema Migration

In your Supabase SQL editor, run:

```sql
-- Copy and paste the entire contents of supabase/schema.sql
```

### 2. Seed Style Data

```sql
-- Copy and paste the entire contents of supabase/seed-styles.sql
```

### 3. Configure Storage Policies

Set up RLS policies for storage buckets:

```sql
-- Allow public read access to generated images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'hair-tryon-images');

-- Allow authenticated insert for salon assets
CREATE POLICY "Salon asset upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'salon-assets');
```

## 🌐 Vercel Deployment

### 1. Connect Repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Environment Variables

Add all environment variables from your `.env.local` file to Vercel:

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate values
3. Set environment to "Production"

### 3. Deploy

Click "Deploy" and wait for the build to complete.

## 🔄 Webhook Configuration

### 1. Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to your environment variables

### 2. Test Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## ⚙️ Worker Process Deployment

The AI worker needs to run as a separate process for production scalability.

### Option A: Vercel Serverless Functions

The queue system will work with Vercel's serverless functions, but for high volume, consider dedicated workers.

### Option B: Railway/Render

1. Create a new service on Railway or Render
2. Connect the same repository
3. Set build command: `npm run build`
4. Set start command: `npm run worker`
5. Add the same environment variables
6. Deploy

### Option C: Docker Container

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "run", "worker"]
```

Deploy this container to your preferred platform.

## 🔍 Testing Production Deployment

### 1. Basic Functionality Test

1. Visit your deployed URL
2. Sign up for a new salon account
3. Complete Stripe checkout
4. Generate QR code
5. Test the try-on flow

### 2. Load Testing

Use tools like Artillery or k6 to test under load:

```javascript
// artillery-test.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "QR Code Scan Flow"
    requests:
      - get:
          url: "/salon/test-salon-id/tryon"
```

### 3. Monitor Performance

Set up monitoring with:
- Vercel Analytics
- Supabase Monitoring
- Redis monitoring
- Stripe Dashboard

## 🔒 Security Checklist

- [ ] All environment variables are secure
- [ ] Supabase RLS policies are properly configured
- [ ] Stripe webhooks are using HTTPS
- [ ] JWT secrets are cryptographically secure
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Input validation is in place

## 📊 Monitoring & Maintenance

### 1. Set Up Alerts

Configure alerts for:
- High error rates
- Queue processing delays
- Database connection issues
- Payment failures
- Storage quota limits

### 2. Regular Maintenance

- Monitor Redis memory usage
- Clean up expired sessions
- Archive old analytics data
- Update AI model versions
- Review and update style library

### 3. Scaling Considerations

As your platform grows:
- Add more worker processes
- Implement database read replicas
- Use CDN for image delivery
- Consider multi-region deployment
- Implement caching layers

## 🚨 Troubleshooting

### Common Issues

**Webhook Failures**
- Check webhook URL is accessible
- Verify webhook secret matches
- Check Stripe event logs

**AI Processing Delays**
- Monitor Redis queue length
- Check worker process health
- Verify Gemini API limits

**Image Upload Issues**
- Check Supabase storage policies
- Verify bucket permissions
- Monitor storage quota

**Session Expiration**
- Check JWT secret configuration
- Verify Redis connection
- Monitor session cleanup

### Debug Commands

```bash
# Check Redis connection
redis-cli -u $REDIS_URL ping

# Monitor queue
redis-cli -u $REDIS_URL monitor

# Check worker logs
npm run worker

# Test Stripe webhook
stripe events resend evt_test_webhook
```

## 📈 Performance Optimization

### 1. Image Optimization

- Use WebP format for better compression
- Implement progressive loading
- Add image CDN (Cloudinary/ImageKit)

### 2. Caching Strategy

- Cache popular styles
- Implement session caching
- Use edge caching for static assets

### 3. Database Optimization

- Add appropriate indexes
- Implement connection pooling
- Monitor query performance

## 🎯 Go-Live Checklist

- [ ] All services are deployed and healthy
- [ ] DNS is configured correctly
- [ ] SSL certificates are active
- [ ] Monitoring is set up
- [ ] Backup systems are in place
- [ ] Team has access to all dashboards
- [ ] Documentation is updated
- [ ] Support processes are ready

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review service logs
3. Test individual components
4. Contact platform support if needed

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
