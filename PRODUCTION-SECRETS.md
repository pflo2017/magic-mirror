# Production Secrets Management Guide

## 🚨 **NEVER Store Secrets in Code or .env Files in Production!**

## ✅ **Best Practices for Production Secrets**

### 1. **Vercel Environment Variables (Recommended for Next.js)**

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each secret individually:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://mrcjuhmprzklwqaoiifu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   GEMINI_API_KEY = AIzaSyDvFgJDn3oipZHJFcs5EBD7nU8yjwir_gU
   ```
4. Set environment to **Production**
5. Deploy - Vercel automatically injects these as environment variables

### 2. **Supabase Secrets (Alternative Option)**

Supabase has a secrets management feature:

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **Vault**
3. Store secrets there and reference them in your functions

**Example:**
```sql
-- Store secret in Supabase Vault
SELECT vault.create_secret('gemini_api_key', 'AIzaSyDvFgJDn3oipZHJFcs5EBD7nU8yjwir_gU');

-- Use in Edge Functions
SELECT vault.decrypt_secret('gemini_api_key');
```

### 3. **AWS Systems Manager (Enterprise)**

For large-scale production:
```javascript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: "us-east-1" });
const parameter = await ssm.send(new GetParameterCommand({
  Name: "/hairtryon/gemini-api-key",
  WithDecryption: true
}));
```

### 4. **HashiCorp Vault (Enterprise)**

For maximum security:
```javascript
import vault from 'node-vault';

const vaultClient = vault({
  apiVersion: 'v1',
  endpoint: 'https://vault.company.com:8200',
});

const secret = await vaultClient.read('secret/data/hairtryon');
```

## 🎯 **Recommended Approach for Your Project**

### **Development:**
- ✅ Use `.env.local` file (already set up)
- ✅ Add `.env.local` to `.gitignore` (already done)

### **Production (Vercel):**
- ✅ Use Vercel Environment Variables
- ✅ Never commit secrets to Git
- ✅ Use different keys for production vs development

### **Production (Other Platforms):**
- **Railway**: Environment Variables in dashboard
- **Render**: Environment Variables in settings
- **AWS/GCP**: Use their secret management services
- **Docker**: Use Docker secrets or external secret management

## 🔐 **Security Best Practices**

### 1. **Separate Keys by Environment**
```
Development: AIzaSyDvFgJDn3oipZHJFcs5EBD7nU8yjwir_gU-dev
Production:  AIzaSyDvFgJDn3oipZHJFcs5EBD7nU8yjwir_gU-prod
```

### 2. **Rotate Keys Regularly**
- Change API keys every 90 days
- Use key rotation automation when possible
- Monitor for key usage anomalies

### 3. **Principle of Least Privilege**
- Only give keys the minimum required permissions
- Use service accounts instead of personal accounts
- Implement IP restrictions when possible

### 4. **Monitoring and Auditing**
```javascript
// Log API key usage (without exposing the key)
console.log(`API call made with key ending in: ${apiKey.slice(-4)}`);
```

## 🚀 **Quick Setup for Your Project**

### Step 1: Get Redis (Free)
1. Go to [Upstash.com](https://upstash.com)
2. Create free Redis database
3. Copy the Redis URL

### Step 2: Update Environment
```bash
# Copy your credentials to .env.local
cp env.example .env.local

# Edit .env.local with your Redis URL
REDIS_URL=redis://your-upstash-redis-url
```

### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## 🔍 **Environment Variable Validation**

Add runtime validation to catch missing secrets:

```javascript
// src/lib/config.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'REDIS_URL'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## ⚠️ **What NOT to Do**

❌ **Never do this:**
- Commit `.env` files to Git
- Hardcode secrets in source code
- Share secrets in chat/email
- Use the same keys for dev and production
- Store secrets in client-side code

✅ **Always do this:**
- Use environment variables
- Rotate keys regularly
- Use different keys per environment
- Monitor key usage
- Implement proper access controls

## 🎉 **Your Project is Ready!**

With your credentials set up, you can now:

1. **Set up Redis**: Get free Redis from Upstash
2. **Run Database Setup**: Execute the SQL schema
3. **Start Development**: `npm run dev`
4. **Deploy to Production**: Use Vercel with environment variables

The Hair Try-On SaaS platform is ready to go live! 🚀
