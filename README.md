# Clienter - Freelancer Client Management Platform

A polished SaaS web application for freelancers to manage clients, projects, and meetings. Built with Next.js 14 and Supabase.

## 🎯 Features

- **Authentication**: Email + Google OAuth via Supabase
- **Client Management**: Full CRUD operations with tags, notes, and contact details
- **Project Tracking**: Manage multiple projects per client with budget and status tracking
- **Meeting Scheduler**: Schedule meetings with Google Meet integration
- **In-App Reminders**: Never miss a meeting with customizable reminders
- **Dashboard**: Overview of upcoming meetings, recent clients, and quick actions
- **Data Export**: Export your client data as CSV or JSON
- **Responsive Design**: Works beautifully on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd clienter
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** and copy:

   - Project URL
   - Anon/Public key

3. Run the database schema:

   - Open **SQL Editor** in your Supabase dashboard
   - Copy and paste the entire content from `supabase/schema.sql`
   - Click **Run** to create all tables, policies, and functions

4. Enable Google OAuth (optional):
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add your OAuth credentials (from Google Cloud Console)
   - Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the values with your actual Supabase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### First Time Setup

1. **Sign Up**: Create an account using email or Google
2. **Add Your First Client**: Click "Add Client" on the dashboard
3. **Create a Project**: Navigate to the client detail page and add a project
4. **Schedule a Meeting**: Add a meeting with a reminder (try 5 minutes for testing)
5. **Test Reminders**: Wait for the reminder time - you'll see a toast notification!

### Managing Clients

- **Add Client**: Dashboard → "Add Client" button
- **View Clients**: Navigation → "Clients"
- **Edit Client**: Click on any client → "Edit" button
- **Delete Client**: Client detail page → "Delete" (this also deletes associated projects/meetings)
- **Export Data**: Clients page → "Export" → Choose CSV or JSON

### Scheduling Meetings

- **From Dashboard**: Click "Schedule Meeting" quick action
- **From Client**: Go to client detail → "Schedule Meeting"
- **From Meetings Page**: Navigation → "Meetings" → "New Meeting"

**Meeting Options**:

- Date and time
- Duration (default 60 minutes)
- Google Meet link (optional - paste existing link or leave blank)
- Reminder lead time (5, 15, 30 minutes, or custom)

### Google Meet Integration

**Option 1**: Create meeting in Google Meet first

1. Go to [meet.google.com](https://meet.google.com)
2. Click "New meeting"
3. Copy the meeting link
4. Paste into Clienter's "Meeting Link" field

**Option 2**: Leave link blank

- Schedule meeting without a link
- Click "Open Google Meet" button when it's time
- Creates meeting on the spot

### Reminders

Reminders appear in three places:

1. **Toast Notifications**: Pop-up when you're active on the site
2. **Notification Center**: Bell icon in navigation (shows all active reminders)
3. **Dashboard**: "Upcoming Reminders" section

**Reminder Behavior**:

- Triggers at the specified lead time before meetings
- Stays visible for 5 minutes
- Can be dismissed manually
- Automatically dismissed after meeting time passes

## 🏗️ Project Structure

```
clienter/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Auth callback route
│   │   ├── dashboard/         # Main dashboard
│   │   ├── clients/           # Client management pages
│   │   ├── meetings/          # Meeting pages
│   │   ├── settings/          # User settings
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── Navigation.tsx     # Main navigation
│   │   ├── ReminderEngine.tsx # Reminder system
│   │   └── NotificationCenter.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Auth state management
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase.ts       # Supabase client
│   │   ├── date-utils.ts     # Date formatting
│   │   └── utils.ts          # General utilities
│   ├── store/                 # Zustand stores
│   │   └── reminderStore.ts  # Reminder state
│   └── types/                 # TypeScript types
│       └── database.ts        # Database types
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Sample data (optional)
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this)
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🗄️ Database Schema

The application uses these main tables:

- **profiles**: User profiles (created automatically on signup)
- **clients**: Client information
- **projects**: Projects linked to clients
- **meetings**: Scheduled meetings
- **reminders**: Meeting reminders (auto-created with meetings)

All tables have Row Level Security (RLS) enabled - users can only access their own data.

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Change these values
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  },
}
```

### Adjust Default Reminder Time

Edit user settings or modify `supabase/schema.sql`:

```sql
default_reminder_minutes INTEGER DEFAULT 15  -- Change default here
```

### Add Custom Fields

1. Modify database schema in Supabase SQL Editor
2. Update TypeScript types in `src/types/database.ts`
3. Update forms in relevant page components

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Configure environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

4. Update Supabase auth settings:

   - Go to Supabase → **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Redirect URLs**

5. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- Render
- AWS Amplify
- Digital Ocean App Platform

Make sure to:

- Set environment variables
- Update Supabase redirect URLs
- Use Node.js 18+

## 📊 Seeding Demo Data

To add sample data for testing:

1. Sign up and note your user ID:

   ```sql
   SELECT id FROM auth.users WHERE email = 'your@email.com';
   ```

2. Edit `supabase/seed.sql` and replace `YOUR_USER_ID`

3. Run the seed script in Supabase SQL Editor

## 🔒 Security Features

- **Row Level Security**: All database queries are automatically scoped to the current user
- **Secure Authentication**: Powered by Supabase Auth with industry-standard security
- **No API Keys in Frontend**: All sensitive operations use Supabase RLS
- **HTTPS Only**: Production deployments should always use HTTPS

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Client components (`'use client'`) for interactivity

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Authentication not working

- Check environment variables are set correctly
- Verify Supabase URL and key in `.env.local`
- Check browser console for errors

### Reminders not appearing

- Ensure meeting time is in the future
- Check notification center (bell icon)
- Verify reminder lead time settings
- Check browser console for errors

### Database errors

- Verify schema was run completely
- Check RLS policies are enabled
- Ensure user is authenticated

## 📝 Environment Variables

| Variable                        | Description                      | Required |
| ------------------------------- | -------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL        | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key      | Yes      |
| `NEXT_PUBLIC_APP_URL`           | Your application URL (for OAuth) | Yes      |

## 🤝 Contributing

This is a complete production-ready application. Feel free to:

- Fork and customize for your needs
- Report bugs or issues
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built with:

- [Next.js 14](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## 💡 Tips for Freelancers

1. **Add clients immediately** after closing a deal
2. **Schedule meetings right away** to get reminders
3. **Use tags** to organize clients by service type
4. **Export data regularly** as a backup
5. **Set realistic reminder times** (15 min usually works well)
6. **Update project status** to track your workload

## 📧 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check browser console for errors
4. Verify all setup steps were completed

---

**Made for freelancers, by developers. Happy freelancing! 🚀**
