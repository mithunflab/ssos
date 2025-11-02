# Vercel Production Fix - Data Fetching Issues

## Problem Summary

The application works perfectly on localhost but fails to fetch data from Supabase tables in production (Vercel), even though authentication works fine.

## Root Causes Identified

### 1. Multiple Supabase Client Instances

- **Issue**: Creating new Supabase client instances in each component can cause session/token inconsistencies
- **Impact**: Auth tokens might not be properly shared across requests in production
- **Fix**: Implemented singleton pattern in `src/lib/supabase.ts`

### 2. Inconsistent Client Usage

- **Issue**: Some components were creating their own Supabase clients instead of using the shared instance from AuthContext
- **Impact**: Different client instances may have different auth states
- **Fix**: Updated all pages to use the `supabase` client from `useAuth()` hook

### 3. Missing Auth Configuration

- **Issue**: Supabase client wasn't configured with explicit auth options
- **Impact**: Session persistence and token refresh might not work correctly
- **Fix**: Added explicit auth configuration:
  ```typescript
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
  ```

## Changes Made

### 1. Updated `src/lib/supabase.ts`

- Implemented singleton pattern to ensure only one Supabase client instance
- Added comprehensive logging for debugging
- Added explicit auth configuration

### 2. Updated `src/app/dashboard/page.tsx`

- Removed local `createBrowserClient()` call
- Now uses `supabase` from `useAuth()` hook
- Fixed TypeScript errors

### 3. Updated `supabase/schema.sql`

- Removed RLS policies for non-existent `projects` table
- This was causing potential policy evaluation errors

### 4. Created `vercel.json`

- Added Next.js framework configuration
- Added cache control headers for API routes

### 5. Created Diagnostics Page

- New route: `/diagnostics`
- Helps debug production issues
- Tests environment variables, auth status, and database connectivity

## Deployment Steps

### 1. Verify Vercel Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://zviakkdqtmhqfkxjjqvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
NEXT_PUBLIC_APP_URL=https://clienter25.vercel.app
```

**IMPORTANT**: Make sure these are set for **Production**, **Preview**, and **Development** environments.

### 2. Redeploy to Vercel

```bash
git add .
git commit -m "Fix: Supabase client singleton pattern and data fetching issues"
git push origin main
```

Vercel will automatically redeploy.

### 3. Clear Vercel Cache (if needed)

In Vercel Dashboard:

- Go to Deployments
- Click on the three dots (⋯) next to your deployment
- Select "Redeploy"
- Check "Use existing Build Cache" OFF

### 4. Test the Deployment

#### A. Check Environment Variables

Visit: `https://clienter25.vercel.app/api/env-check`

- Should show all environment variables are SET

#### B. Check Diagnostics Page

Visit: `https://clienter25.vercel.app/diagnostics`

- Login first
- Check all tests pass
- Use manual test buttons

#### C. Test Dashboard

Visit: `https://clienter25.vercel.app/dashboard`

- Should load without 30-second timeout
- Should display client data

## Additional Debugging

### If Issue Persists:

1. **Check Browser Console in Production**

   - Open DevTools → Console
   - Look for Supabase client initialization logs
   - Look for any fetch errors

2. **Check Network Tab**

   - Look for failed requests to Supabase
   - Check if JWT token is being sent in Authorization header
   - Look for CORS errors

3. **Verify Supabase RLS Policies**
   In Supabase Dashboard → SQL Editor, run:

   ```sql
   -- Check if policies exist
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public';

   -- Test a query as if you were the user
   SELECT * FROM clients WHERE user_id = 'your-user-id-here';
   ```

4. **Check Supabase Logs**

   - Go to Supabase Dashboard → Logs
   - Filter by "API" or "Auth"
   - Look for 401/403 errors

5. **Test API Route**
   Visit: `https://clienter25.vercel.app/api/env-check`
   - Should return environment variable status

## Common Issues & Solutions

### Issue: "Network connectivity error"

**Solution**: Check if Supabase is accessible from Vercel's region

```bash
# Test from local machine
curl -I https://zviakkdqtmhqfkxjjqvn.supabase.co/rest/v1/
```

### Issue: "403 Forbidden" or "401 Unauthorized"

**Solution**: RLS policies are too restrictive

- Temporarily disable RLS to test: `ALTER TABLE clients DISABLE ROW LEVEL SECURITY;`
- If that fixes it, review and update your RLS policies

### Issue: "Could not find the table 'public.clients'"

**Solution**: Schema not properly set up in Supabase

- Run `supabase/schema.sql` in Supabase SQL Editor

### Issue: Environment variables not working

**Solution**:

1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding/changing environment variables
3. Clear build cache and redeploy

## Testing Locally

To test the fixes locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

## Monitoring

### Production Logs

Check Vercel logs:

```bash
vercel logs clienter25.vercel.app --follow
```

### Supabase Logs

Monitor in Supabase Dashboard → Logs → API

## Contact & Support

If issues persist after following this guide:

1. Check `/diagnostics` page for specific error messages
2. Share screenshots of browser console errors
3. Share Vercel deployment logs
4. Share Supabase API logs

## Success Indicators

✅ `/api/env-check` returns all variables as SET
✅ `/diagnostics` shows green checks for all tests
✅ Dashboard loads within 2-3 seconds
✅ Client data displays correctly
✅ No console errors about Supabase connection
