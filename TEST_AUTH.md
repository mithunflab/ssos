# Authentication Testing Guide

## Quick Test Steps

### 1. Start the Development Server

```powershell
npm run dev
```

### 2. Test Signup Flow

1. **Navigate to Signup**
   - Go to `http://localhost:3000/signup`
2. **Fill Out Form**
   - Full Name: Test User
   - Email: your-email@example.com
   - Password: testpass123 (min 6 chars)
3. **Submit Form**

   - **Expected Result**: See "Check Your Email" screen

4. **Check Your Email**
   - Look for Supabase confirmation email
   - Click the confirmation link
5. **Verify Auto-Login**
   - **Expected Result**: Automatically redirected to `/dashboard`
   - **Expected Result**: You're logged in without manually entering credentials

### 3. Test Login Flow

1. **Sign Out First**
   - Click your profile/avatar
   - Click "Sign Out"
2. **Navigate to Login**
   - Go to `http://localhost:3000/login`
3. **Enter Credentials**
   - Email: your-email@example.com
   - Password: testpass123
4. **Submit Form**
   - **Expected Result**: Redirected to `/dashboard`
   - **Expected Result**: You're logged in

### 4. Test Google OAuth (Optional)

1. **Navigate to Login or Signup**
   - Go to `http://localhost:3000/login`
2. **Click "Sign in with Google"**
   - **Expected Result**: Redirected to Google consent screen
3. **Authorize with Google**
   - Select your Google account
   - Grant permissions
4. **Verify Auto-Login**
   - **Expected Result**: Redirected back to app
   - **Expected Result**: Automatically logged in to `/dashboard`

### 5. Test Protected Routes

1. **Sign Out**
   - Make sure you're logged out
2. **Try Accessing Protected Route**
   - Go to `http://localhost:3000/dashboard`
   - **Expected Result**: Redirected to `/login`
3. **Login Again**
   - Enter credentials and login
   - **Expected Result**: Redirected back to `/dashboard`

### 6. Test Session Persistence

1. **Login to the App**
2. **Refresh the Page**
   - Press F5 or reload
   - **Expected Result**: Still logged in
3. **Open in New Tab**
   - Open `http://localhost:3000/dashboard` in new tab
   - **Expected Result**: Logged in (session shared across tabs)
4. **Close and Reopen Browser**
   - Close all browser windows
   - Reopen and go to `http://localhost:3000/dashboard`
   - **Expected Result**: Still logged in (session persisted)

## Debugging Tips

### Check Browser Console

Open Developer Tools (F12) and check Console for:

- ✅ "Initial session check: [email]" - Session loaded
- ✅ "Auth state change: SIGNED_IN [email]" - Login successful
- ✅ "✅ Login successful, redirecting..." - Login flow working
- ❌ Any error messages

### Check Network Tab

Look for:

- ✅ POST to `/auth/v1/token` - Authentication requests
- ✅ GET to `/auth/callback?code=...` - OAuth callback
- ✅ 200 status codes on auth requests
- ❌ 400/401/403 errors indicate auth problems

### Check Application Storage

In Developer Tools → Application tab:

1. **Cookies** - Should see:

   - `sb-access-token`
   - `sb-refresh-token`
   - `sb-session`

2. **Local Storage** - Should see:
   - `supabase.auth.token` - Session data

### Check Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Verify your test user appears in the list
3. Check if email is confirmed (green checkmark)

## Common Issues

### ❌ "No code provided in callback"

- **Problem**: Email confirmation link or OAuth redirect not working
- **Fix**: Check URL configuration in Supabase settings

### ❌ "Invalid redirect URL"

- **Problem**: Callback URL not whitelisted
- **Fix**: Add `http://localhost:3000/auth/callback` to Supabase → Authentication → URL Configuration

### ❌ Google OAuth doesn't redirect back

- **Problem**: Google OAuth not configured correctly
- **Fix**:
  1. Check Google credentials in Supabase
  2. Verify redirect URLs in Google Console
  3. Make sure Google provider is enabled

### ❌ Email confirmation required but no email received

- **Problem**: Email settings not configured
- **Fix**:
  1. Check Supabase → Project Settings → API → SMTP settings
  2. For dev, you can disable email confirmation: Authentication → Settings → "Enable email confirmations" OFF

### ❌ "Session not found" or redirected to login repeatedly

- **Problem**: Cookies not being set or cleared
- **Fix**:
  1. Clear browser cookies and local storage
  2. Make sure no browser extensions blocking cookies
  3. Check that callback route is setting cookies correctly

## Success Criteria ✅

- [ ] Can create new account via email/password
- [ ] Receive confirmation email
- [ ] Click confirmation link → automatically logged in
- [ ] Can login with email/password
- [ ] Can login with Google (if configured)
- [ ] Protected routes redirect to login when not authenticated
- [ ] After login, redirected to originally requested page
- [ ] Session persists across page refreshes
- [ ] Session persists across browser tabs
- [ ] Can sign out successfully
- [ ] After sign out, cannot access protected routes

## Performance Checks

1. **Auth State Loading**
   - Should see loading state briefly on initial page load
   - Should resolve within 1-2 seconds max
2. **Redirect Speed**
   - Login → Dashboard redirect should be instant
   - Callback → Dashboard redirect should be < 1 second
3. **Session Refresh**
   - Session should auto-refresh before expiration
   - No interruption to user experience

---

**If all tests pass, your authentication is working perfectly! 🎉**
