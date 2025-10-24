# Quick Start Guide

Welcome to **Clienter**! This guide will get you up and running in under 10 minutes.

## What You're Building

A complete SaaS application with:

- 🔐 User authentication (email + Google)
- 👥 Client management
- 📊 Project tracking
- 📅 Meeting scheduler with reminders
- 🔔 In-app notifications
- 📱 Mobile-responsive design

## Prerequisites

✅ **Node.js 18+** installed ([Download here](https://nodejs.org))  
✅ **Supabase account** (free tier is fine - [Sign up here](https://supabase.com))  
✅ **10 minutes** of your time

## Quick Start (5 Steps)

### 1️⃣ Install Dependencies (1 minute)

```powershell
npm install
```

Or run the setup script:

```powershell
.\setup.ps1
```

### 2️⃣ Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name and password
3. Wait for creation (~2 minutes)

### 3️⃣ Set Up Database (2 minutes)

1. In Supabase dashboard → **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy & paste the entire file
4. Click **Run**
5. Verify tables appear in **Table Editor**

### 4️⃣ Configure Environment (1 minute)

1. In Supabase → **Settings** → **API**
2. Copy **Project URL** and **anon key**
3. Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5️⃣ Start the App (30 seconds)

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Sign up** → Start using!

---

## 🎉 You're Done!

Your app is now running with:

- ✅ Full authentication
- ✅ Database with security policies
- ✅ All features ready to use

## First Steps in the App

1. **Sign up** with your email
2. **Add your first client** (use the dashboard prompt)
3. **Schedule a test meeting** for 5 minutes from now
4. **Wait for the reminder** to pop up!

## Need More Detail?

- **Full setup guide**: See [SETUP.md](./SETUP.md)
- **Complete documentation**: See [README.md](./README.md)
- **Troubleshooting**: Check README.md troubleshooting section

## Optional: Enable Google Sign-In

See SETUP.md "Step 6" for instructions on adding Google OAuth.

---

## Common Issues

**"Module not found"?**  
→ Run `npm install` again

**"Can't connect to Supabase"?**  
→ Check your `.env.local` file has the correct credentials

**Database errors?**  
→ Make sure you ran the entire `schema.sql` in Supabase SQL Editor

---

**Questions?** Check the full [README.md](./README.md) or [SETUP.md](./SETUP.md)

**Ready to go?** Run `npm run dev` and open http://localhost:3000! 🚀
