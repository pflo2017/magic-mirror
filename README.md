# Hair Try-On SaaS Platform

A comprehensive multi-tenant SaaS platform that enables hair salons to offer virtual hair try-on experiences to their clients through QR codes. Built with Next.js, Supabase, and AI-powered styling.

## 🚀 Features

- **Permanent QR Codes**: Each salon gets a unique, permanent QR code that never changes
- **AI-Powered Styling**: Advanced hair transformation using Google Gemini API
- **Session Management**: Time-limited client sessions with configurable usage limits
- **200+ Styles**: Comprehensive library of hairstyles, colors, and beard styles
- **Analytics Dashboard**: Track popular styles, session analytics, and client preferences
- **Subscription Management**: Stripe-powered billing with multiple plan tiers
- **Real-time Processing**: Async queue system with Redis caching for instant results
- **Mobile-First Design**: Responsive interface optimized for mobile devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Queue System**: BullMQ + Redis
- **AI Integration**: Google Gemini 2.5 Flash + Imagen 3.0
- **Payments**: Stripe
- **Image Storage**: Supabase Storage + CDN
- **Caching**: Redis

### System Components
- **Salon Dashboard**: Manage settings, view analytics, download QR codes
- **Client Try-On Interface**: Mobile-optimized hair styling experience
- **Session Management**: Temporary tokens with expiration and usage limits
- **AI Processing Queue**: Async image generation with caching
- **Analytics Engine**: Track usage patterns and popular styles

## 📋 Prerequisites

Before setting up the project, ensure you have:

1. **Node.js** (v18 or higher)
2. **Redis** server running locally or cloud instance
3. **Supabase** project
4. **Stripe** account
5. **Google AI Studio** account (for Gemini API)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd hair-tryon-saas
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Google AI Configuration (Gemini + Imagen)
GEMINI_API_KEY=your_google_ai_api_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

### 3. Database Setup

#### Create Supabase Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the schema creation script:

```sql
-- Copy and paste the contents of supabase/schema.sql
```

#### Seed Style Data

Run the seed script to populate the styles table:

```sql
-- Copy and paste the contents of supabase/seed-styles.sql
```

#### Create Storage Buckets

Create the required storage buckets in Supabase:

1. `hair-tryon-images` - for client photos and generated results
2. `salon-assets` - for QR codes and salon branding

Set appropriate policies for public access to generated images.

### 4. Stripe Configuration

1. Create products and prices in your Stripe dashboard for the subscription plans
2. Update the price IDs in `src/lib/stripe.ts`:

```typescript
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'price_your_basic_price_id', // Replace with actual Stripe price ID
    // ... rest of config
  },
  // ... other plans
}
```

3. Set up webhook endpoint in Stripe dashboard pointing to `/api/stripe/webhook`

### 5. Redis Setup

Ensure Redis is running:

```bash
# Local Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine

# Or use a cloud Redis service (recommended for production)
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Subscription Plans

Modify the subscription plans in `src/lib/stripe.ts` to match your pricing strategy:

```typescript
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 2900, // $29.00 in cents
    features: {
      session_duration: 20, // minutes
      max_ai_uses: 3,
      max_active_sessions: 10,
      // ... other features
    }
  }
  // ... add more plans
}
```

### Style Categories

Add or modify style categories in the database by updating the `styles` table. Each style should have:

- `category`: 'women' | 'men' | 'beard' | 'color'
- `name`: Display name
- `description`: Brief description
- `prompt`: JSON object with AI generation instructions

### Session Settings

Default session settings can be configured per salon in the database or through the dashboard interface.

## 🚀 Deployment

### 1. Production Environment

Set up production environment variables with your production credentials.

### 2. Database Migration

Run the schema and seed scripts on your production Supabase instance.

### 3. Redis Configuration

Use a production Redis service like:
- Redis Cloud
- AWS ElastiCache
- Google Cloud Memorystore
- Upstash Redis

### 4. Deploy to Vercel

```bash
npm run build
vercel --prod
```

### 5. Configure Webhooks

Update your Stripe webhook endpoint to point to your production domain:
`https://yourdomain.com/api/stripe/webhook`

## 📱 Usage

### For Salon Owners

1. **Sign Up**: Create an account and choose a subscription plan
2. **Setup**: Complete Stripe checkout and access your dashboard
3. **Generate QR Code**: Download your permanent QR code from the dashboard
4. **Display**: Print and display the QR code in your salon
5. **Monitor**: Track usage and analytics through the dashboard

### For Clients

1. **Scan QR Code**: Use any QR code scanner or camera app
2. **Upload Photo**: Take a selfie or upload an existing photo
3. **Choose Style**: Browse and select from 200+ hairstyles and colors
4. **Generate**: AI processes the image in 10-30 seconds
5. **Download/Share**: Save or share the result

## 🔒 Security Features

- **Session-based Authentication**: Temporary tokens with expiration
- **Rate Limiting**: Prevents abuse with configurable limits
- **Image Processing**: Secure handling and automatic cleanup
- **RLS Policies**: Database-level security with Supabase
- **Input Validation**: Comprehensive validation on all endpoints

## 📊 Analytics

The platform tracks:
- Total and active sessions
- Popular styles and categories
- Daily usage patterns
- Session completion rates
- Peak usage hours

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Salon dashboard
│   └── salon/[id]/tryon/  # Client try-on interface
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Database operations
│   ├── stripe.ts         # Payment processing
│   ├── session.ts        # Session management
│   ├── queue.ts          # Job queue system
│   ├── redis.ts          # Caching layer
│   ├── gemini.ts         # AI integration
│   └── qr-code.ts        # QR code generation
├── types/                 # TypeScript definitions
└── components/            # React components
```

### Adding New Features

1. **New Styles**: Add entries to the `styles` table
2. **Custom Branding**: Extend the QR code generation system
3. **Additional Analytics**: Add new tracking in the analytics system
4. **Payment Plans**: Create new Stripe products and update the configuration

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection**: Ensure Redis is running and accessible
2. **Supabase Permissions**: Check RLS policies and service role permissions
3. **Stripe Webhooks**: Verify webhook endpoint and secret configuration
4. **Image Upload**: Ensure Supabase storage buckets are properly configured
5. **AI Processing**: Check Gemini API key and quota limits

### Logs and Monitoring

- Check browser console for frontend errors
- Monitor API route logs in development
- Use Supabase dashboard for database monitoring
- Check Redis logs for queue processing issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**Note**: This is a complete SaaS platform ready for production deployment. Make sure to properly configure all services and test thoroughly before launching.