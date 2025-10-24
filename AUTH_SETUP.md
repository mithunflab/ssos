# Authentication Setup Guide

## Overview

The authentication system has been fully configured with support for:

- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Server-side session management
- ✅ Cookie-based authentication
- ✅ Protected routes with middleware

## Quick Setup

### 1. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Configure Supabase Authentication

#### Enable Email Authentication

1. In Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates if needed

#### Enable Google OAuth

1. In Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. You'll need to set up a Google Cloud OAuth client:

**Google Cloud Console Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. Application type: "Web application"
7. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
8. Copy the Client ID and Client Secret
9. Paste them in Supabase Dashboard → Authentication → Providers → Google

#### Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Add your site URL: `http://localhost:3000` (development)
- Add redirect URLs:
  ```
  http://localhost:3000/auth/callback
  ```

For production, add your production URL as well.

### 3. Set Up Database

Make sure your Supabase database has the required tables. Run the SQL in `supabase/schema.sql`:

```sql
-- The profiles table should have a trigger to create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, timezone, default_reminder_minutes)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'UTC',
    15
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and you should see the app redirect to `/login`.

## How It Works

### Authentication Flow

#### Email/Password Login

1. User enters credentials on `/login`
2. Supabase validates and returns session
3. Client sets cookies (`sb-access-token`, `sb-refresh-token`)
4. User is redirected to `/dashboard`
5. Middleware checks cookies on protected routes

#### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google for authentication
3. Google redirects to `/auth/callback` with code
4. Server exchanges code for session
5. Cookies are set in the response
6. User is redirected to `/dashboard`

### Protected Routes

The middleware (`src/middleware.ts`) protects these routes:

- `/dashboard/*`
- `/clients/*`
- `/meetings/*`
- `/settings/*`

If no valid session cookie exists, users are redirected to `/login`.

### Session Management

- **Client-side**: `AuthContext` manages user state and profile
- **Server-side**: Middleware validates tokens on each request
- **Cookies**: Used to share session between client and server
- **Auto-refresh**: Supabase automatically refreshes expired tokens

## Troubleshooting

### "Authentication failed" error

- Check that your Supabase URL and anon key are correct
- Verify the project is not paused in Supabase dashboard
- Check browser console for detailed error messages

### Google OAuth not working

- Verify redirect URL is correctly configured in both Google Cloud Console and Supabase
- Make sure Google provider is enabled in Supabase
- Check that your Google OAuth credentials are correct
- Ensure your app is not on localhost for production OAuth (use ngrok for testing)

### Cookies not being set

- Check browser console for cookie errors
- Verify `SameSite` and `Secure` settings match your environment
- For HTTPS sites, cookies need `Secure` flag
- Clear browser cookies and try again

### Middleware redirecting logged-in users

- Check that cookies are being set properly after login
- Verify cookie names match in all files (`sb-access-token`, `sb-refresh-token`)
- Check cookie expiration times
- Try hard refresh (Ctrl+Shift+R) to clear cached redirects

### Session not persisting on refresh

- Verify Supabase client has `persistSession: true`
- Check localStorage for Supabase session data
- Ensure cookies are not being blocked by browser
- Check for third-party cookie blockers

## Key Files

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/auth-helpers.ts` - Cookie management utilities
- `src/contexts/AuthContext.tsx` - Client-side auth state
- `src/middleware.ts` - Server-side route protection
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/login/page.tsx` - Login page
- `src/app/signup/page.tsx` - Signup page

## Testing Checklist

- [ ] Email/password signup creates account
- [ ] Email/password login works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Protected routes redirect to login when not authenticated
- [ ] Dashboard loads after successful login
- [ ] Session persists on page refresh
- [ ] Logout clears session and redirects to login
- [ ] Can access login/signup pages when logged out
- [ ] Login/signup pages redirect to dashboard when already logged in

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use environment variables** for all sensitive data
3. **Enable RLS** (Row Level Security) in Supabase for all tables
4. **Set up email verification** in Supabase if required
5. **Use HTTPS in production** - Required for secure cookies
6. **Regularly rotate** your Supabase service role key (not the anon key)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
