# 🚀 Deployment Checklist for Vercel

## ✅ Pre-Deployment Checklist

### 1. Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Ensure these are set for **ALL** environments (Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://zviakkdqtmhqfkxjjqvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://clienter25.vercel.app
```

**⚠️ IMPORTANT**:

- Variable names MUST start with `NEXT_PUBLIC_` to be accessible in browser
- Values should have NO quotes or extra spaces
- Click "Save" after adding each variable

### 2. Git Commit and Push

```bash
# Check what's changed
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix: Implement Supabase singleton pattern to fix production data fetching

- Convert Supabase client to singleton pattern for consistent auth state
- Update all pages to use shared supabase client from AuthContext
- Remove duplicate client instances across components
- Clean up schema.sql (remove non-existent projects table policies)
- Add diagnostics page for production debugging
- Add vercel.json for better configuration"

# Push to main branch
git push origin main
```

### 3. Monitor Deployment

- Vercel will automatically start deployment
- Watch the deployment logs in Vercel Dashboard
- Wait for deployment to complete (usually 2-3 minutes)

---

## 🧪 Post-Deployment Testing

### Test 1: Environment Variables ✓

```
URL: https://clienter25.vercel.app/api/env-check
Expected: All variables show as "SET"
```

**If it fails:**

- Double-check environment variables in Vercel Dashboard
- Make sure they're set for Production environment
- Redeploy with "Clear Build Cache" option

---

### Test 2: Diagnostics Page ✓

```
URL: https://clienter25.vercel.app/diagnostics
Steps:
1. Login first
2. Check all sections show green checks
3. Click "Test Fetch Clients" button
4. Click "Test Get Session" button
```

**If it fails:**

- Check browser console for errors
- Look at the specific error messages in each section
- Take screenshot and refer to VERCEL_PRODUCTION_FIX.md

---

### Test 3: Dashboard Page ✓

```
URL: https://clienter25.vercel.app/dashboard
Expected:
- Loads within 2-3 seconds (not 30 seconds)
- Shows stats (clients count, meetings, revenue)
- Shows recent clients list
- Shows upcoming reminders
- No error banners
```

**If it fails:**

- Open browser DevTools → Console
- Look for error messages
- Check Network tab for failed requests
- Check if auth is working (shows user email in sidebar)

---

### Test 4: Clients Page ✓

```
URL: https://clienter25.vercel.app/clients
Expected:
- Loads quickly
- Shows kanban columns (Uncertain, Potential, Ongoing)
- Can search for clients
- Can drag and drop clients between columns
```

---

### Test 5: Meetings Page ✓

```
URL: https://clienter25.vercel.app/meetings
Expected:
- Loads meetings list
- Can create new meeting
- Shows upcoming and past meetings
```

---

### Test 6: Settings Page ✓

```
URL: https://clienter25.vercel.app/settings
Expected:
- Shows user profile
- Can update settings
- Can see timezone and currency settings
```

---

## 🐛 If Issues Persist

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for Supabase-related errors
4. Take screenshot

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Try loading dashboard
4. Look for failed requests (red)
5. Click on failed request → Headers → Check Authorization header
6. Take screenshot

### Step 3: Check Supabase Directly

Visit: https://zviakkdqtmhqfkxjjqvn.supabase.co/rest/v1/clients

Should see:

```json
{"hint":"No apikey found in request", ...}
```

This is GOOD - it means Supabase is accessible.

### Step 4: Test Supabase with JWT

1. Login to your app
2. Open DevTools → Console
3. Run this:

```javascript
console.log(await supabase.auth.getSession())
```

4. Copy the access_token
5. Test with curl (replace TOKEN):

```bash
curl 'https://zviakkdqtmhqfkxjjqvn.supabase.co/rest/v1/clients?user_id=eq.YOUR_USER_ID' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer TOKEN"
```

### Step 5: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Filter by "API"
4. Look for 401/403 errors
5. Check if requests are even reaching Supabase

### Step 6: Verify RLS Policies

In Supabase SQL Editor:

```sql
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test as your user (replace USER_ID)
SELECT * FROM clients WHERE user_id = 'your-user-id-here' LIMIT 5;
```

### Step 7: Temporary RLS Disable (TESTING ONLY)

```sql
-- TESTING ONLY - DO NOT LEAVE THIS WAY
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
```

- If data shows up now, RLS policies are the issue
- Re-enable immediately: `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`

---

## 🔧 Quick Fixes

### Fix 1: Redeploy with Cache Clear

1. Go to Vercel Dashboard → Deployments
2. Click three dots (⋯) next to latest deployment
3. Click "Redeploy"
4. **UNCHECK** "Use existing Build Cache"
5. Click "Redeploy"

### Fix 2: Update Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Delete existing variables
3. Re-add them one by one
4. Make sure NO extra spaces or quotes
5. Redeploy

### Fix 3: Check Supabase Service Role Key

If you accidentally used Service Role Key instead of Anon Key:

- Service Role Key bypasses RLS (dangerous!)
- Anon Key should be public-facing
- In Supabase Dashboard → Settings → API
- Make sure you're using "anon public" key, not "service_role"

---

## 📞 Getting Help

If you've tried everything above and it still doesn't work:

1. **Gather Information:**

   - Screenshot of /diagnostics page
   - Screenshot of browser console errors
   - Screenshot of Vercel deployment logs
   - Screenshot of Supabase API logs

2. **Check Common Issues:**

   - Are you using the correct Supabase project?
   - Is the project in the same region as Vercel?
   - Are there any Supabase outages? (status.supabase.com)

3. **Create Minimal Test:**
   Try this in browser console:
   ```javascript
   const { createClient } = await import('@supabase/supabase-js')
   const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY')
   const { data, error } = await supabase.from('clients').select('count')
   console.log({ data, error })
   ```

---

## ✨ Success Indicators

You'll know everything works when:

- ✅ Dashboard loads in under 3 seconds
- ✅ All data displays correctly
- ✅ No errors in browser console
- ✅ No red "Error Loading" banners
- ✅ Can create/edit/delete clients
- ✅ Can create meetings
- ✅ Drag and drop works on clients page
- ✅ Settings page loads and saves

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **Vercel Docs**: https://vercel.com/docs/environment-variables
- **Next.js Docs**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

## 🎉 Deployment Complete!

Once all tests pass, your app is ready to use in production!

**Share the URL**: https://clienter25.vercel.app
