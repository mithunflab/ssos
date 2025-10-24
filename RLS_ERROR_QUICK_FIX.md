# 🚨 RLS POLICY ERROR - QUICK FIX

## The Error

```
Error 42501: new row violates row-level security policy for table "clients"
```

## What This Means

Supabase is rejecting your attempt to add a client because the security policy says you're not allowed to.

## The Fix (90 Seconds)

1. **Go to:** https://app.supabase.com
2. **Open:** Your project
3. **Click:** SQL Editor (left sidebar)
4. **Click:** New Query
5. **Copy & Paste** this entire code:

```sql
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

INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
```

6. **Click:** Run
7. **Back in your app:** Refresh the page (Ctrl+Shift+R)
8. **Try adding a client** → ✅ Should work!

---

## If It Still Doesn't Work

**Step 1:** Log out and log back in

- Click your profile icon
- Click Sign Out
- Log back in

**Step 2:** Try again

---

## Why This Happens

Supabase has security rules (RLS policies) that say:

- "Only the person who created a client can see/edit/delete it"

The problem was that the rule wasn't written clearly enough, so Supabase was confused about whether to allow it.

The fix rewrites the rule so it's crystal clear:

- "You can only insert a client if the `user_id` field matches your authenticated user ID"

---

## That's It!

The above fix should resolve the error. Your app now allows you to add clients while keeping your data secure.
