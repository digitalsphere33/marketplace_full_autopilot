# Google OAuth Setup Guide for MzansiMart

This guide walks you through enabling Google "Sign in with Google" for the MzansiMart marketplace.

## Overview

The app uses Supabase Auth to handle Google OAuth. Users click "Continue with Google" on the login page, authenticate with Google, and Supabase returns their profile to our backend.

## Prerequisites

- Supabase project created (MzansiMart)
- Supabase credentials configured in `api/.env` and `frontend/.env`
- Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing project:
   - Click on project dropdown (top left)
   - Click "NEW PROJECT"
   - Name it "MzansiMart" or similar
   - Click "CREATE"

3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "ENABLE"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (for public access)
     - App name: "MzansiMart"
     - User support email: Your email
     - Developer contact: Your email
     - Click "SAVE AND CONTINUE"
     - Scopes: Skip (default email/profile is enough)
     - Test users: Skip for now
     - Click "SAVE AND CONTINUE"
   
5. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "MzansiMart Web"
   - Authorized JavaScript origins:
     - `https://cchbmxoxcbyzibgfxnou.supabase.co`
     - `http://localhost` (for local testing)
   - Authorized redirect URIs:
     - `https://cchbmxoxcbyzibgfxnou.supabase.co/auth/v1/callback`
     - `http://localhost/auth/v1/callback` (for local testing)
   - Click "CREATE"

6. Copy credentials:
   - You'll see a popup with "Client ID" and "Client Secret"
   - **IMPORTANT:** Save both values securely (you'll need them next)

## Step 2: Configure Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)

2. Select your project: **MzansiMart** (`cchbmxoxcbyzibgfxnou`)

3. Navigate to Authentication:
   - Click "Authentication" in left sidebar
   - Click "Providers" tab

4. Enable Google Provider:
   - Scroll to "Google" provider
   - Toggle "Enable Sign in with Google" to ON
   - Paste your Google OAuth credentials:
     - **Client ID:** (from Step 1.6)
     - **Client Secret:** (from Step 1.6)
   - Click "SAVE"

5. Verify redirect URL:
   - The redirect URL should be: `https://cchbmxoxcbyzibgfxnou.supabase.co/auth/v1/callback`
   - This should match what you added in Google Console

## Step 3: Create Supabase Storage Bucket for Images

1. Still in Supabase Dashboard, navigate to Storage:
   - Click "Storage" in left sidebar
   - Click "Create a new bucket"

2. Create the bucket:
   - Name: `images`
   - Public bucket: Toggle ON (so product images are publicly accessible)
   - Click "Create bucket"

3. Configure bucket policies (if needed):
   - The bucket should allow public reads by default
   - Upload/delete should be restricted to authenticated users (service role)

## Step 4: Test Google Login

1. Start your local development environment:
   ```bash
   cd E:\2026\ClickPaySA\marketplace_full_autopilot
   docker compose up -d
   ```

2. Open the frontend:
   - Navigate to `http://localhost` in your browser
   - You should see the Login page

3. Test Google OAuth:
   - Click "Continue with Google" button
   - You should be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions to MzansiMart
   - You should be redirected back to the app and logged in

4. Verify in Supabase:
   - Go to Supabase Dashboard > Authentication > Users
   - You should see your Google account listed
   - The user will have `provider: google` and Google profile data

## Step 5: Production Configuration

When deploying to production:

1. Update Google OAuth redirect URIs:
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth client ID
   - Add production redirect URI: `https://yourdomain.com/auth/v1/callback`
   - Or use your Supabase URL: `https://cchbmxoxcbyzibgfxnou.supabase.co/auth/v1/callback`

2. Update frontend environment:
   - Update `VITE_API_URL` in `frontend/.env` to your production API URL
   - Rebuild frontend: `cd frontend && npm run build`

3. Configure CORS (if needed):
   - Ensure your API allows requests from your frontend domain
   - Check `api/src/index.js` CORS configuration

## Troubleshooting

### "Redirect URI mismatch" error
- Verify the redirect URI in Google Console matches exactly: `https://cchbmxoxcbyzibgfxnou.supabase.co/auth/v1/callback`
- Check for trailing slashes or http vs https mismatches

### "OAuth client not found" error
- Verify you copied the correct Client ID and Secret to Supabase
- Try regenerating credentials in Google Console

### User created but not redirected
- Check browser console for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in `frontend/.env`
- Ensure Supabase project is not paused (free tier limitation)

### Images not uploading
- Verify the `images` bucket exists in Supabase Storage
- Check bucket permissions (should be public for reads)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `api/.env`

## Security Notes

1. **Never commit credentials to git:**
   - The `.env` files are gitignored
   - Use environment variables in production

2. **Use HTTPS in production:**
   - Set `ALLOW_HTTP_DEV=false` in production
   - Configure SSL/TLS on your web server

3. **Rotate secrets regularly:**
   - Regenerate JWT_SECRET periodically
   - Rotate OAuth client secrets if compromised

4. **OAuth consent screen:**
   - For production, verify your domain in Google Console
   - Submit for Google OAuth verification if needed (for public apps)

## Next Steps

After Google OAuth is working:

1. Test the full user flow: Login > Seller onboarding > Create listing > Checkout
2. Test image uploads to Supabase Storage
3. Configure PayFast sandbox for payment testing
4. Set up production deployment with HTTPS
5. Monitor Sentry for errors (optional)

## Reference Links

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [PayFast Integration](https://developers.payfast.co.za/)

---

**Your Current Configuration:**
- Supabase URL: `https://cchbmxoxcbyzibgfxnou.supabase.co`
- Supabase Anon Key: (configured in `frontend/.env`)
- Google OAuth: Needs Client ID/Secret from Google Console
- Storage Bucket: `images` (needs to be created)
