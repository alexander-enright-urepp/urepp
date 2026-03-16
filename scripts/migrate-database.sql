-- UREPP Database Migration - Fix all constraints
-- Run this in your Supabase SQL Editor

-- Make ALL old columns nullable
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN hometown DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN sat_score DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN act_score DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN position DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN slug DROP NOT NULL;

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture_url text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS teams_played_for text,
ADD COLUMN IF NOT EXISTS primary_position text,
ADD COLUMN IF NOT EXISTS secondary_position text,
ADD COLUMN IF NOT EXISTS exit_velocity integer,
ADD COLUMN IF NOT EXISTS pitch_velocity integer,
ADD COLUMN IF NOT EXISTS sixty_time decimal,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS twitter text,
ADD COLUMN IF NOT EXISTS youtube text;

-- Copy data from old columns to new ones
UPDATE profiles SET primary_position = position WHERE primary_position IS NULL;
UPDATE profiles SET city = hometown WHERE city IS NULL AND hometown IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_grad_year ON profiles(grad_year);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_position ON profiles(primary_position);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
DROP POLICY IF EXISTS "Profile pictures are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

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

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

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