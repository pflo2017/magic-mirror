# 🚀 Setup Instructions for Your Hair Try-On SaaS

## ✅ **Credentials Configured**

Your credentials are now set up:
- ✅ **Supabase**: Connected to `mrcjuhmprzklwqaoiifu.supabase.co`
- ✅ **Gemini API**: Ready with your API key
- ⏳ **Redis**: Need to set up (free option below)
- ⏳ **Stripe**: Need your Stripe keys

## 🗄️ **Next Steps: Database Setup**

### 1. **Create Database Tables**

Go to your Supabase dashboard:
1. Visit: https://supabase.com/dashboard/project/mrcjuhmprzklwqaoiifu
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** to create all tables and policies

### 2. **Seed Style Data**

In the same SQL Editor:
1. Copy and paste the entire contents of `supabase/seed-styles.sql`
2. Click **Run** to populate 200+ hairstyles

### 3. **Create Storage Buckets**

In Supabase dashboard:
1. Go to **Storage**
2. Create bucket: `hair-tryon-images` (public read access)
3. Create bucket: `salon-assets` (public read access)

## 🔴 **Get Free Redis (Required for Queues)**

### Option 1: Upstash (Recommended - Free Tier)
1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub/Google
3. Create new Redis database
4. Copy the Redis URL
5. Update your `.env.local`:
   ```
   REDIS_URL=redis://your-upstash-url
   ```

### Option 2: Redis Cloud
1. Go to [redis.com](https://redis.com)
2. Create free account
3. Create new database
4. Get connection URL

### Option 3: Local Redis (Development Only)
```bash
# Install Redis locally
brew install redis  # macOS
# or
sudo apt install redis-server  # Ubuntu

# Start Redis
redis-server

# Use default URL
REDIS_URL=redis://localhost:6379
```

## 💳 **Get Stripe Keys (For Payments)**

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get your keys from dashboard:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)
4. Create webhook endpoint: `your-domain.com/api/stripe/webhook`
5. Get webhook secret (starts with `whsec_`)

## 🏃‍♂️ **Start Development**

Once you have Redis set up:

```bash
# Install dependencies (already done)
npm install

# Start the development server
npm run dev

# In another terminal, start the AI worker
npm run dev:worker
```

Visit: http://localhost:3000

## 🌐 **Deploy to Production**

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - All your .env.local variables
# - Use production Redis URL
# - Use production Stripe keys
```

## 🧪 **Test the Complete Flow**

1. **Visit Homepage**: http://localhost:3000
2. **Sign Up Flow**: Create a salon account
3. **Generate QR Code**: Download your salon's QR code
4. **Test Try-On**: Scan QR code and test hair styling
5. **Check Analytics**: View usage statistics

## 🔍 **Troubleshooting**

### Common Issues:

**Redis Connection Error:**
- Make sure Redis is running
- Check REDIS_URL format
- Try Upstash free tier

**Supabase Connection Error:**
- Verify project URL and keys
- Check if tables were created
- Ensure RLS policies are set

**Gemini API Error:**
- Verify API key is correct
- Check if Gemini API is enabled
- Monitor quota limits

## 📞 **Need Help?**

If you encounter any issues:
1. Check the console logs
2. Verify all environment variables
3. Ensure database tables are created
4. Test Redis connection

## 🎉 **You're Almost Ready!**

Just need to:
1. ✅ Set up Redis (5 minutes)
2. ✅ Run database setup (2 minutes)  
3. ✅ Start development server
4. 🚀 **Launch your Hair Try-On SaaS!**

The platform is ready to transform salon experiences! 💇‍♀️✨
