# Fix: "Could not find the table 'public.clients'" Error

## Problem

When trying to add a new client, you're getting error:

```
PGRST205: Could not find the table 'public.clients' in the schema cache
```

## Root Causes

1. **Schema not created**: The database schema.sql hasn't been run in Supabase
2. **Schema cache issue**: Supabase's schema cache needs refreshing
3. **RLS policy blocking**: Row-level security policies are preventing INSERT

## Solution

### Step 1: Run the Database Schema (REQUIRED)

**⚠️ This is the most likely cause of your issue**

1. Go to your Supabase project dashboard: https://app.supabase.com
2. In the left sidebar, click **SQL Editor**
3. Click the **"New Query"** button
4. Copy the entire contents of `supabase/schema.sql` from your project
5. Paste it into the SQL Editor
6. Click **Run** button (or press Ctrl+Enter)
7. Wait for the script to complete (you should see ✅ success messages)

### Step 2: Verify Tables Were Created

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ profiles
   - ✅ clients
   - ✅ projects
   - ✅ meetings
   - ✅ reminders

If you don't see the clients table, the schema.sql didn't run successfully.

### Step 3: Check Row-Level Security (RLS)

1. In **Table Editor**, click on the **clients** table
2. Click the **RLS** button at the top
3. You should see these policies:
   - "Users can view own clients" (SELECT)
   - "Users can insert own clients" (INSERT)
   - "Users can update own clients" (UPDATE)
   - "Users can delete own clients" (DELETE)

If RLS is ON but policies are missing, re-run the schema.sql script.

### Step 4: Refresh Supabase Schema Cache

Sometimes Supabase needs to refresh its cache:

1. In Supabase, go to **Settings** → **API**
2. Find the section "API Documentation"
3. Click **"Reset..."** if available, or try the next step

4. Alternatively, go back to your app and do a hard refresh:
   - Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
   - This clears cache and reloads everything

### Step 5: Test the Fix

1. Go to your app: http://localhost:3000
2. Navigate to **Clients** page
3. Click **"Add Client"** button
4. Fill in the form:
   - Name: `Test Client`
   - Email: `test@example.com`
   - Company: `Test Corp`
5. Click **Save Client**

✅ If it works, you're done!

## If It Still Doesn't Work

### Check Your Database Connection

1. Verify your `.env.local` file has correct credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Restart your dev server:

   ```powershell
   npm run dev
   ```

3. Check the browser console for connection errors (F12 → Console)

### Check RLS Policies

If you can see the table but still can't insert:

1. Go to **Authentication** → **Policies** in Supabase
2. Make sure you have an active session (you're logged in)
3. Check that your user ID is being passed correctly:
   - Open browser DevTools (F12)
   - Go to **Application** tab
   - Look for the auth token in localStorage

### Run Schema Script Step-by-Step

If the full script fails, run these commands one at a time to find the issue:

```sql
-- First, check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- If clients doesn't exist, run this to see what error you get:
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Quick Troubleshooting Checklist

- [ ] Ran schema.sql in Supabase SQL Editor
- [ ] clients table appears in Table Editor
- [ ] RLS is enabled with policies
- [ ] Restarted dev server after schema creation
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Logged out and back in
- [ ] .env.local has correct Supabase URL and key
- [ ] Checked browser console for error details

## Need More Help?

1. Check **Browser DevTools** (F12):

   - Click **Network** tab
   - Try to add a client
   - Look at the failed POST request
   - Check the response for error details

2. Check **Supabase Logs**:

   - In Supabase dashboard, go to **Logs** or **API** section
   - Look for errors related to your request

3. Review the error message:
   - "PGRST205" = table not found in schema cache
   - "Policy violation" = RLS policy issue
   - "401 Unauthorized" = authentication issue
