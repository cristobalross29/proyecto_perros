# Dog Feeding Tracker

A Next.js application for tracking your dog's feeding schedule, built with React, TypeScript, TailwindCSS, and Supabase.

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase Auth
- 🐕 **Dog Management**: Add dogs with names and optional photos
- 🍽️ **Feeding Tracking**: Log feedings with timestamps
- 📊 **Dashboard**: View all dogs with today's feeding count
- 📅 **History**: View feeding history grouped by day for each dog
- 🎨 **Clean UI**: Minimal, functional design with TailwindCSS

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL schema from `supabase-schema.sql` to create the required tables and policies
4. Go to Settings > API to get your project URL and anon key

### 2. Environment Variables

1. Copy `.env.local` and update with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

### Dogs Table
- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `photo_url` (Text, Optional)
- `created_at` (Timestamp)
- `user_id` (UUID, Foreign Key to auth.users)

### Feedings Table
- `id` (UUID, Primary Key)
- `dog_id` (UUID, Foreign Key to dogs)
- `timestamp` (Timestamp, Default: now())
- `user_id` (UUID, Foreign Key to auth.users)

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Add Dogs**: Click "Add New Dog" to register your dogs
3. **Track Feedings**: Use the "Fed Now" button to log feedings
4. **View History**: Click "View History" to see feeding records grouped by day

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── add-dog/           # Add new dog page
│   ├── dog/[id]/          # Dog history page
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page (auth/dashboard)
├── components/            # React components
│   ├── AddDogForm.tsx     # Form to add new dogs
│   ├── AuthForm.tsx       # Login/signup form
│   ├── Dashboard.tsx      # Main dashboard
│   └── DogHistory.tsx     # Feeding history view
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utilities
    └── supabase.ts        # Supabase client and types
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authentication required for all operations
- Secure API keys stored in environment variables