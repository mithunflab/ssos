# 🔍 Troubleshooting Flowchart

## Error: "PGRST205: Could not find the table 'public.clients'"

```
START: Getting error when trying to add a client
  │
  ├─ Question 1: Have you ever run supabase/schema.sql in Supabase?
  │
  ├─ YES ──────────────────────────────────────────────────┐
  │                                                         │
  │                                                         ▼
  │                   Question 2: Can you see 'clients'
  │                   table in Supabase Table Editor?
  │
  │                   ├─ YES ──────────────┐
  │                   │                    │
  │                   │                    ▼
  │                   │          Question 3: Are you logged
  │                   │          in to the app?
  │                   │
  │                   │          ├─ YES ──────────┐
  │                   │          │                │
  │                   │          │                ▼
  │                   │          │       Do a hard refresh:
  │                   │          │       Ctrl+Shift+R
  │                   │          │
  │                   │          │       Still broken?
  │                   │          │       ├─ YES → See "Advanced Debugging"
  │                   │          │       └─ NO → ✅ FIXED!
  │                   │          │
  │                   │          └─ NO ───────────┐
  │                   │                          │
  │                   │                          ▼
  │                   │              Log in first, then try
  │                   │              adding a client again
  │                   │
  │                   └─ NO ──────────────┐
  │                                       │
  │                                       ▼
  │                          ❌ ERROR: Tables don't exist
  │
  ├─ NO ──────────────────────────────────────────────────┐
  │                                                       │
  │                        ❌ MAIN PROBLEM FOUND
  │
  └─────────────────────────────────────────────────────────────┐
                                                                │
                                                                ▼
                                    🔧 TO FIX THIS:

                                    1. Go to: https://app.supabase.com
                                    2. Open your project
                                    3. Go to: SQL Editor
                                    4. Click: New Query
                                    5. Copy entire contents of: supabase/schema.sql
                                    6. Paste into SQL Editor
                                    7. Click: Run
                                    8. Wait for ✅ completion
                                    9. Verify in: Table Editor
                                    10. Restart: npm run dev

                                    Then try adding a client again

                                    Result:
                                    ├─ ✅ SUCCESS → Problem Fixed!
                                    └─ ❌ STILL ERROR → See "Advanced Debugging"
```

---

## 📊 Error Code Reference

| Error Code   | Meaning                              | Solution                                    |
| ------------ | ------------------------------------ | ------------------------------------------- |
| **PGRST205** | Table not found in schema cache      | Run schema.sql in Supabase                  |
| **PGRST204** | No rows found (when querying)        | This is normal, just means no data yet      |
| **PGRST400** | Bad request / Invalid query          | Check the query syntax                      |
| **42P01**    | Relation (table) does not exist      | Run schema.sql in Supabase                  |
| **42501**    | Permission denied (policy violation) | Check RLS policies and authentication       |
| **401**      | Unauthorized                         | Authentication failed - log out and back in |
| **403**      | Forbidden                            | RLS policy blocking access                  |

---

## 🛠️ Advanced Debugging

### Step 1: Check Browser Console

1. Press **F12** to open DevTools
2. Click **Console** tab
3. Try to add a client
4. Look for error messages
5. **Copy and save the error** for reference

### Step 2: Check Network Request

1. Press **F12** to open DevTools
2. Click **Network** tab
3. Try to add a client
4. Look for a **POST** request to `clients`
5. **Click on it** to see details
6. Look at the **Response** tab
7. You should see the error details

Example successful response:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "auth0|123",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
]
```

Example error response:

```json
{
  "code": "PGRST205",
  "message": "Could not find the table 'public.clients' in the schema cache"
}
```

### Step 3: Check Supabase Logs

1. Go to Supabase dashboard: https://app.supabase.com
2. Click your project
3. Click **Logs** (or **Analytics** → **API**)
4. Look for recent requests
5. Find the failed POST to `/clients`
6. **View the error details**

### Step 4: Verify RLS Policies

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Click the **clients** table
4. Click **RLS** button
5. You should see policies like:
   - "Users can view own clients"
   - "Users can insert own clients"
6. If you see ❌ errors here, the policies aren't set up correctly

### Step 5: Verify Your Auth Token

1. Press **F12** to open DevTools
2. Click **Application** tab
3. Click **Local Storage**
4. Look for entries like `sb-xxx-auth-token`
5. Click it and look at the value
6. It should be a long JSON-like string
7. If it's empty or missing, **log out and log back in**

---

## 💡 Common Issues & Fixes

### "Table already exists" error when running schema.sql

**Is this a problem?** NO! This is actually fine.

**Why?** Someone already ran the schema before (maybe during initial setup)

**What to do:** Continue running the script. The error just means it skipped that CREATE TABLE statement.

### "Permission denied" error

**Cause:** You're not logged into Supabase properly

**Fix:**

1. Log out of Supabase
2. Log back in
3. Try running the schema again

### Can see the clients table but get "401 Unauthorized"

**Cause:** Your app's authentication token is invalid

**Fix:**

1. Open DevTools (F12)
2. Go to **Application** → **Storage** → **Local Storage**
3. Delete all entries
4. Close DevTools
5. Log out of your app
6. Log back in
7. Try adding a client again

### Data shows up in Supabase but not in your app

**Cause:** Your query is wrong or RLS is blocking it

**Fix:**

1. Check that you're logged in as the same user who created the data
2. Restart your dev server
3. Do a hard browser refresh (Ctrl+Shift+R)

---

## 🚨 If You're Still Stuck

### Provide This Information:

1. **Screenshot** of the error message
2. **Screenshot** of Supabase Table Editor showing the tables
3. **Output** of this command:
   ```powershell
   node check-supabase.js
   ```
4. **Full error** from browser DevTools console
5. **URL** you're getting the error on
6. **Steps** you took to run the schema

### Questions to Answer:

- [ ] Did you run schema.sql in Supabase?
- [ ] Can you see the clients table in Supabase Table Editor?
- [ ] Are you logged in to the app?
- [ ] Does the error appear in the browser console?
- [ ] What does the Network tab show?

---

## ✅ Success Indicators

You know it's working when:

- ✅ You see the `clients` table in Supabase Table Editor
- ✅ You can fill out and submit the "Add Client" form
- ✅ No red error messages appear
- ✅ You see "Client created successfully!"
- ✅ The new client appears in your clients list
- ✅ You can view, edit, and delete clients

---

**🎯 Most likely: Just run the schema.sql in Supabase and you're done!**
