# 🔒 RLS Policy Errors - Complete Reference

## Error 42501: Row-Level Security Policy Violation

### The Error Message

```
Error 42501: new row violates row-level security policy for table "clients"
```

Or variations:

- "new row violates row-level security policy for table [table_name]"
- "policy violates row-level security"
- "permission denied" (similar)

### What This Means

Supabase rejected your request because:

1. You're trying to INSERT/UPDATE/DELETE data
2. The RLS policy says you're not allowed to
3. The security check failed

### Why It Happens

**Reason 1: RLS Policy Not Written Clearly (Most Common)**

Bad policy:

```sql
WITH CHECK (auth.uid() = user_id)
```

Good policy:

```sql
WITH CHECK (user_id = auth.uid())
```

Both should work, but Supabase may have trouble with the first form in certain situations.

**Reason 2: Profile Not Created**

The RLS policy assumes you have a profile row, but:

- New users haven't had their profile created yet
- The auth trigger didn't fire
- There's a mismatch between auth.users and profiles

**Reason 3: User ID Mismatch**

You're inserting with:

```typescript
user_id: user.id // auth.users.id
```

But the RLS policy checks:

```sql
user_id = auth.uid()  // also auth.users.id
```

They should match, but something is wrong.

---

## Quick Fixes

### Fix 1: Update RLS Policies (Recommended)

**In Supabase SQL Editor:**

```sql
-- For clients table
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- For other tables, do the same
-- Replace "clients" with: projects, meetings, reminders, etc.
```

### Fix 2: Ensure Profile Exists

**In Supabase SQL Editor:**

```sql
-- Create profiles for users without them
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
```

### Fix 3: Log Out and Back In

Often the issue is just a stale session:

1. Click your profile
2. Click Sign Out
3. Log back in
4. Try again

---

## By Table

### clients Table

**Error when:** Trying to add/edit/delete a client

**RLS Policy Should Be:**

```sql
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**Why:** Ensure the `user_id` field matches your authenticated user ID

**Quick Fix:**

```sql
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### projects Table

**Error when:** Trying to add/edit/delete a project

**RLS Policy Should Be:**

```sql
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### meetings Table

**Error when:** Trying to schedule a meeting

**RLS Policy Should Be:**

```sql
CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### reminders Table

**Error when:** Trying to set a reminder

**RLS Policy Should Be:**

```sql
CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

---

## Advanced Debugging

### Check 1: Verify Your Auth ID

**In browser console:**

```javascript
// This should print your auth user ID
const {
  data: { session },
} = await supabase.auth.getSession()
console.log(session?.user?.id)
```

### Check 2: Verify Your Profile Exists

**In Supabase SQL Editor:**

```sql
SELECT * FROM public.profiles WHERE id = '<YOUR_ID>';
```

Replace `<YOUR_ID>` with your auth user ID from Check 1.

**Expected result:** One row with your profile

**If no results:** Your profile wasn't created. Create it manually:

```sql
INSERT INTO public.profiles (id, email, full_name)
VALUES ('<YOUR_ID>', 'your@email.com', 'Your Name');
```

### Check 3: Verify RLS Policy Syntax

**In Supabase Table Editor:**

1. Click the table (e.g., "clients")
2. Click the **RLS** button
3. Look at the "INSERT" policy
4. It should show: `user_id = auth.uid()`

**If you see:** `auth.uid() = user_id` (reversed order) - that's fine, but update to be consistent

### Check 4: Test RLS Policy Directly

**In Supabase SQL Editor:**

```sql
-- This should return your user ID
SELECT auth.uid();

-- This should show your data
SELECT * FROM clients WHERE user_id = auth.uid();
```

If the second query returns no rows, check:

1. Do you have any clients? (try inserting one via app first)
2. Is the RLS policy allowing reads?

---

## Common Scenarios

### Scenario 1: New User Tries to Add Client

**Problem:**

- User signs up
- Tries to add a client immediately
- Gets RLS error

**Cause:** Profile wasn't created

**Solution:**

1. Log out
2. Log back in (forces profile creation)
3. Try again

Or run:

```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
```

### Scenario 2: Adding Client Works, But Editing Doesn't

**Problem:**

- INSERT succeeds
- UPDATE fails with RLS error

**Cause:** UPDATE policy is wrong

**Solution:**

```sql
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());
```

### Scenario 3: Can Add Client But Can't See It

**Problem:**

- INSERT succeeds
- SELECT fails or returns empty

**Cause:** SELECT policy is wrong

**Solution:**

```sql
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());
```

### Scenario 4: Can't Delete Client

**Problem:**

- DELETE fails with RLS error

**Cause:** DELETE policy is wrong

**Solution:**

```sql
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());
```

---

## Complete Fix (All Tables)

Run this to fix all RLS policies at once:

```sql
-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;

-- Recreate them correctly
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ensure all profiles exist
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
```

---

## Error Code Reference

| Code      | Name                           | Meaning                           | When It Happens                                                   |
| --------- | ------------------------------ | --------------------------------- | ----------------------------------------------------------------- |
| **42501** | insufficient_privilege         | RLS policy blocked your operation | Trying to INSERT/UPDATE/DELETE that you don't have permission for |
| 42P01     | undefined_table                | Table doesn't exist               | RLS policy references a table that doesn't exist                  |
| 42704     | undefined_object               | Function doesn't exist            | RLS policy calls a function that doesn't exist                    |
| 22000     | integrity_constraint_violation | Data violates a constraint        | Trying to insert duplicate, null in NOT NULL field, etc.          |

---

## Prevention

### For New Projects

Use this schema instead (with corrected RLS):

```sql
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

Instead of:

```sql
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### For Existing Projects

The `supabase/schema.sql` file has been updated with the correct policies. Run it again to update.

---

## Testing

After fixing, test each operation:

```typescript
// Test INSERT
const { data: newClient } = await supabase
  .from('clients')
  .insert([{ user_id, name: 'Test', ... }])
  .select()

console.log('INSERT worked:', newClient)

// Test SELECT
const { data: allClients } = await supabase
  .from('clients')
  .select('*')

console.log('SELECT worked:', allClients)

// Test UPDATE
const { data: updated } = await supabase
  .from('clients')
  .update({ name: 'Updated' })
  .eq('id', clientId)
  .select()

console.log('UPDATE worked:', updated)

// Test DELETE
const { error } = await supabase
  .from('clients')
  .delete()
  .eq('id', clientId)

console.log('DELETE worked:', !error)
```

---

## Summary

| Issue                    | Fix                                                 |
| ------------------------ | --------------------------------------------------- |
| Error 42501 on INSERT    | Update RLS policy: `user_id = auth.uid()`           |
| No profile for new users | Create profile manually or have user log in again   |
| Wrong auth ID            | Check you're passing `user.id` (not something else) |
| Stale session            | Log out and log back in                             |
| Policy syntax wrong      | Use correct order: `user_id = auth.uid()`           |

---

**👉 Most common fix: Run the SQL from "Complete Fix (All Tables)" section above in Supabase SQL Editor**
