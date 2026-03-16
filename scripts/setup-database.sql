-- UREPP Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    username text UNIQUE NOT NULL,
    profile_picture_url text,
    city text,
    state text,
    high_school text NOT NULL,
    teams_played_for text,
    primary_position text NOT NULL,
    secondary_position text,
    bats text,
    throws text,
    grad_year integer NOT NULL,
    height text,
    weight text,
    exit_velocity integer,
    pitch_velocity integer,
    sixty_time decimal,
    gpa decimal,
    instagram text,
    twitter text,
    youtube text,
    bio text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_grad_year ON profiles(grad_year);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_position ON profiles(primary_position);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
    ON profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Profile pictures are viewable by everyone" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'profile-pictures');

CREATE POLICY "Authenticated users can upload profile pictures" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile pictures" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'profile-pictures' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own profile pictures" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'profile-pictures' AND auth.uid() = owner);