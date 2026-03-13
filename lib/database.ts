// Supabase setup instructions and SQL schema

/*

## SETUP INSTRUCTIONS

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Project Settings → API
4. Copy the URL and anon key
5. Create a .env.local file with:

NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

## DATABASE SCHEMA

Run this SQL in the Supabase SQL Editor:

*/

export const sqlSchema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    grad_year INTEGER NOT NULL,
    position TEXT NOT NULL,
    height TEXT,
    weight TEXT,
    throws TEXT,
    bats TEXT,
    high_school TEXT NOT NULL,
    hometown TEXT,
    state TEXT,
    gpa TEXT,
    sat_score TEXT,
    act_score TEXT,
    bio TEXT,
    stats_json JSONB DEFAULT '{}',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    video_type TEXT DEFAULT 'highlight',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles
CREATE POLICY "Allow public read access" ON profiles
    FOR SELECT USING (true);

-- Allow anyone to read videos
CREATE POLICY "Allow public read access" ON videos
    FOR SELECT USING (true);

-- Only allow authenticated users to create their own profile
CREATE POLICY "Allow users to create their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Only allow users to delete their own profile
CREATE POLICY "Allow users to delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Only allow users to create videos for their own profile
CREATE POLICY "Allow users to create videos for their profile" ON videos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = videos.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Only allow users to update videos for their own profile
CREATE POLICY "Allow users to update their videos" ON videos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = videos.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Only allow users to delete their own videos
CREATE POLICY "Allow users to delete their videos" ON videos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = videos.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );
`;

/*

## RUNNING THE APP

1. Install dependencies:
   npm install

2. Set up environment variables:
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials

3. Run the development server:
   npm run dev

4. Open http://localhost:3000

## DEPLOYING TO VERCEL

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

*/
