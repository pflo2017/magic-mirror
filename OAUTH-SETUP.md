# OAuth Setup Guide

The Google and Facebook login buttons are now functional, but you need to configure OAuth providers in your Supabase project first.

## 🔧 Setting up Google OAuth

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://mrcjuhmprzklwqaoiifu.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback` (for development)

### 2. Configure in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Save the configuration

### 3. Update Site URL (Important!)

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add `http://localhost:3000/api/auth/callback`

## 🔧 Setting up Facebook OAuth (Optional)

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. In Facebook Login settings, add redirect URI:
   - `https://mrcjuhmprzklwqaoiifu.supabase.co/auth/v1/callback`

### 2. Configure in Supabase

1. In Supabase Dashboard → Authentication → Providers
2. Enable Facebook provider
3. Add your Facebook App credentials:
   - **App ID**: From Facebook App Dashboard
   - **App Secret**: From Facebook App Dashboard

## 🚀 Testing OAuth

Once configured:

1. Visit `http://localhost:3000/salon/login`
2. Click "Google" or "Facebook" button
3. Complete OAuth flow
4. You'll be redirected to `/dashboard`

## 🔍 Troubleshooting

**Common Issues:**

1. **"OAuth provider not configured"**
   - Make sure you've enabled the provider in Supabase
   - Check that credentials are correctly entered

2. **"Redirect URI mismatch"**
   - Verify redirect URIs match exactly in both Google/Facebook and Supabase
   - Include both development and production URLs

3. **"Site URL not allowed"**
   - Update Site URL in Supabase Authentication settings
   - Add your domain to allowed redirect URLs

## 📝 For Production

When deploying to production:

1. Update Google/Facebook OAuth settings with production URLs
2. Update Supabase Site URL to your production domain
3. Add production redirect URIs

## 🎯 Current Status

✅ **OAuth code is implemented and ready**  
⚠️ **Requires Supabase OAuth configuration to work**  
✅ **Regular email/password login works without additional setup**

The OAuth buttons will show error messages until you complete the Supabase configuration above.

