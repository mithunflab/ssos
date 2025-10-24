# Client Update Instructions

## Database Migration Required

The client profile has been simplified. You need to run migrations in your Supabase database.

### Steps to Update Database:

1. **Go to your Supabase Dashboard**

   - Navigate to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**

   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run BOTH Migrations in Order**

   **First, add new fields:**

   - Copy the contents of `supabase/migration_add_client_fields.sql`
   - Paste it into the SQL editor
   - Click "Run"

   **Then, remove old fields:**

   - Copy the contents of `supabase/migration_remove_old_client_fields.sql`
   - Paste it into the SQL editor
   - Click "Run"

---

## What's Changed:

### ✅ Fixed Issues:

1. **Client Detail Page Routing**
   - Fixed redirect issue when clicking on a client
   - Improved error handling

### ✅ Simplified Client Fields

Clients now have only these fields:

1. **Name** (required) - Client's full name
2. **Phone Number** (optional) - Contact phone number
3. **Project Description** (optional) - Details about the project
4. **Budget** (optional) - Project budget amount
5. **Status** (required, default: "important"):
   - **General** - Regular clients (gray badge)
   - **Important** - High-priority clients (orange badge, default)
   - **Working** - Active projects (blue badge)
   - **Finished** - Completed projects (green badge)

### ❌ Removed Fields:

- Email
- Company Name
- Tags
- Notes

---

## Updated Pages:

### 1. New Client Form (`/clients/new`)

- Clean, simple form with only essential fields
- Phone number field
- Project description textarea
- Budget input
- Status dropdown (defaults to "Important")

### 2. Client Detail Page (`/clients/[id]`)

- Status badge next to client name
- Budget displayed prominently
- Project description in highlighted box
- Phone number with clickable link
- Edit form with same simplified fields

### 3. Clients List Page (`/clients`)

- Status badges on each card
- Budget shown on cards
- Project description preview (2 lines)
- Phone number displayed
- Search by name only

---

## Testing Checklist:

- [ ] Run both migrations in your Supabase dashboard
- [ ] Create a new client with all fields
- [ ] Click on a client card to view details
- [ ] Edit an existing client
- [ ] Search for clients by name
- [ ] Verify status badges show correct colors

---

## Migration Files:

1. `supabase/migration_add_client_fields.sql` - Adds new fields (run first)
2. `supabase/migration_remove_old_client_fields.sql` - Removes old fields (run second)
