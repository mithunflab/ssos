# 🔒 Fix: "Row-Level Security Policy" Violation (Error 42501)

## The Problem

```
Error: "new row violates row-level security policy for table 'clients'"
Code: 42501
```

When you try to add a client, Supabase rejects it because the RLS policy isn't being satisfied.

## Root Cause Analysis

The RLS policy on the `clients` table says:

```sql
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

This means: "Allow insert only if the auth user ID equals the user_id field being inserted"

**Why it's failing:**

- `auth.uid()` = Your authenticated user's ID (from `auth.users`)
- `user_id` in clients = Should reference the same ID
- But the policy is checking if they match, and they don't because:
  1. **Your profile hasn't been created yet** (new users), OR
  2. **The auth trigger didn't fire**, OR
  3. **There's a timing issue** with profile creation

## The Solution (Choose One)

### Solution A: Fix the RLS Policy (Recommended)

The policy should check directly against `auth.uid()`. Update the schema:

**In Supabase SQL Editor**, run this:

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;

-- Create the corrected policy
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Drop and recreate the other client policies too
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Recreate all with the correct comparison
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());
```

### Solution B: Ensure Profile is Created (Also Important)

The `auth` trigger should create a profile automatically, but add this to your auth context to ensure it exists:

**File:** `src/contexts/AuthContext.tsx`

After the user logs in, ensure their profile exists:

```typescript
// After user authenticates, ensure profile exists
const ensureProfile = async (userId: string, email: string) => {
  if (!supabase) return

  try {
    // Try to fetch the profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // If it doesn't exist, create it
    if (fetchError?.code === 'PGRST116' || !existingProfile) {
      await supabase.from('profiles').insert([
        {
          id: userId,
          email: email,
          full_name: '',
          timezone: 'UTC',
          default_reminder_minutes: 15,
        },
      ])
    }
  } catch (err) {
    console.error('Error ensuring profile:', err)
  }
}
```

Then call it after auth state changes:

```typescript
if (session?.user) {
  await ensureProfile(session.user.id, session.user.email || '')
  await fetchProfile(session.user.id)
}
```

### Solution C: Verify Trigger is Working

Check if the auth trigger is firing:

**In Supabase Dashboard:**

1. Go to **SQL Editor**
2. Run:

```sql
-- Check if trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'auth.users';

-- Check if profiles were created
SELECT COUNT(*) FROM public.profiles;

-- See if any profiles exist for auth users
SELECT a.id, a.email, p.id, p.email
FROM auth.users a
LEFT JOIN public.profiles p ON a.id = p.id;
```

If profiles don't exist, the trigger didn't fire. You may need to manually create profiles for existing users.

---

## Quick Fix Steps

### Option 1: Update RLS Policy (Fastest - 2 minutes)

1. Go to https://app.supabase.com
2. Open your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL from "Solution A" above
5. Click **Run**
6. Try adding a client again

**Result:** ✅ Should work now!

### Option 2: Ensure Profile Exists (3 minutes)

1. Do Option 1 (update RLS policy)
2. Go back to Supabase
3. In **SQL Editor**, run:

```sql
-- For each auth user, create a profile if it doesn't exist
INSERT INTO public.profiles (id, email, full_name)
SELECT a.id, a.email, COALESCE(a.raw_user_meta_data->>'full_name', '')
FROM auth.users a
LEFT JOIN public.profiles p ON a.id = p.id
WHERE p.id IS NULL;
```

4. Go back to your app
5. Log out and log back in
6. Try adding a client

**Result:** ✅ Should definitely work!

---

## Understanding the RLS Policy

### Current (Broken) Policy

```sql
WITH CHECK (auth.uid() = user_id)
```

**Problem:**

- Compares auth user ID with `user_id` column value
- `user_id` in clients should be the auth user ID
- But they're different data types or the profile doesn't exist

### Fixed Policy

```sql
WITH CHECK (user_id = auth.uid())
```

**Why it works:**

- Same logic, but clearer
- `user_id` is compared directly to `auth.uid()`
- No profile lookup needed
- Works immediately after signup

---

## What Each Policy Does

| Policy | What It Checks         | Why                                  |
| ------ | ---------------------- | ------------------------------------ |
| SELECT | `user_id = auth.uid()` | Only see your own clients            |
| INSERT | `user_id = auth.uid()` | Can only create clients for yourself |
| UPDATE | `user_id = auth.uid()` | Can only edit your own clients       |
| DELETE | `user_id = auth.uid()` | Can only delete your own clients     |

---

## Verification Checklist

After applying the fix:

- [ ] You can log in to the app
- [ ] You navigate to Clients page
- [ ] You click "Add Client"
- [ ] You fill in Name and Company
- [ ] You click "Save Client"
- [ ] **Success!** No error, client appears in list
- [ ] You can edit the client (click on it)
- [ ] You can delete the client (if delete button exists)
- [ ] You can see all your clients but not others'

---

## Troubleshooting

### Still Getting RLS Error?

**Check 1: Did you update the RLS policies?**

- Go to Supabase → Table Editor
- Click `clients` table
- Click **RLS** button
- Check that policy says: `user_id = auth.uid()`
- NOT: `auth.uid() = user_id` (order doesn't matter, but check it exists)

**Check 2: Does your profile exist?**

- Go to Supabase → SQL Editor
- Run:

```sql
SELECT * FROM public.profiles WHERE id = '<YOUR_AUTH_USER_ID>';
```

- Replace `<YOUR_AUTH_USER_ID>` with your actual auth user ID
- If no results, your profile wasn't created

**Check 3: Clear cache and try again**

- Browser: Ctrl+Shift+R (hard refresh)
- Log out and back in
- Try adding a client

### Getting "Profile not found" Error?

Your auth user doesn't have a profile row. Fix:

```sql
-- Insert missing profiles (run in Supabase SQL Editor)
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id);
```

Then log out and back in.

---

## Complete Fix Script

If you want to fix everything at once, run this in Supabase SQL Editor:

```sql
-- 1. Fix all RLS policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());

-- 2. Create missing profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
```

---

## Explanation: Why This Happens

### The Problem Scenario

```
STEP 1: User signs up
  └─ Auth user created in auth.users table
  └─ Trigger should create profile in profiles table
  └─ But maybe it didn't fire or there was a delay

STEP 2: User tries to add a client
  └─ Form sends: { user_id: user.id, name: "John", ... }
  └─ RLS policy checks: auth.uid() = user_id
  └─ Comparison fails because:
     - auth.uid() = abc-123 (real auth user ID)
     - user_id = abc-123 (what you're trying to insert)
     - But RLS doesn't see them as matching due to how the policy is written
     - OR profile doesn't exist and there's a constraint violation

STEP 3: Insert is rejected
  └─ Error: 42501 "new row violates row-level security policy"
```

### The Solution

```
Fix: Make the RLS policy explicit
  └─ Change from: auth.uid() = user_id (ambiguous)
  └─ Change to: user_id = auth.uid() (clear and direct)
  └─ Also ensure: profiles exist for all auth users
  └─ Result: Insert succeeds because RLS now clearly passes
```

---

## Next Steps

1. **Apply Option 1** (update RLS policy) - takes 2 minutes
2. **Apply Option 2** (ensure profiles exist) - takes 3 minutes
3. **Test** - try adding a client
4. **If still broken** - run the troubleshooting checks above

---

**👉 Start with: Go to Supabase SQL Editor and run the "Solution A" SQL from above. It should fix it immediately.**
