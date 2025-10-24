# SETUP INSTRUCTIONS

Follow these steps to set up and run Clienter locally.

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages including Next.js, React, Supabase, Tailwind CSS, and other dependencies.

## Step 2: Create Supabase Project

1. Go to https://supabase.com and sign up/log in
2. Click "New Project"
3. Fill in:
   - Project name: `clienter`
   - Database password: (choose a strong password and save it)
   - Region: (choose closest to you)
4. Wait for the project to be created (2-3 minutes)

## Step 3: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** to execute the script
6. Verify tables were created: Go to **Table Editor** and you should see:
   - profiles
   - clients
   - projects
   - meetings
   - reminders

## Step 4: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 5: Configure Environment Variables

1. In the project root, create a file named `.env.local`
2. Add these lines (replace with your actual values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

## Step 6: (Optional) Enable Google OAuth

To allow sign-in with Google:

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**

8. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Google**
   - Enable it
   - Paste Client ID and Client Secret
   - Save

## Step 7: Run the Application

Start the development server:

```powershell
npm run dev
```

Open your browser to: http://localhost:3000

## Step 8: Create Your Account

1. Click **Sign up**
2. Enter your email and password (or use Google if configured)
3. You'll be redirected to the dashboard
4. Follow the onboarding prompt to add your first client!

## Troubleshooting

### "Module not found" errors

Delete node_modules and reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Can't connect to Supabase

- Check `.env.local` has correct URL and key
- Verify the file is named exactly `.env.local` (not `.env.local.txt`)
- Restart the dev server after changing env variables

### Database errors

- Verify you ran the entire `schema.sql` script
- Check table editor to confirm all tables exist
- Make sure RLS policies are enabled

### Authentication not working

- For Google: verify redirect URL matches exactly
- Check Supabase logs: **Authentication** → **Logs**
- Clear browser cookies and try again

## What's Included

Your application now has:

✅ Email + Google authentication
✅ Personal dashboard
✅ Client management (CRUD)
✅ Project tracking
✅ Meeting scheduler with Google Meet integration
✅ In-app reminders and notifications
✅ Search and filtering
✅ CSV/JSON export
✅ User settings
✅ Responsive mobile design

## Next Steps

1. **Add your first client**: Dashboard → "Add Client"
2. **Schedule a test meeting**: Set it for 5 minutes from now to test reminders
3. **Customize settings**: Settings → adjust timezone and default reminder time
4. **Explore features**: Try searching, filtering, exporting data

## Deployment

To deploy to production:

1. Push code to GitHub
2. Connect to Vercel: https://vercel.com
3. Set environment variables in Vercel dashboard
4. Update Supabase redirect URLs to include your Vercel domain
5. Deploy!

For detailed deployment instructions, see README.md

## Need Help?

- Check README.md for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs

---

**You're all set! Start managing your freelance clients like a pro. 🚀**
