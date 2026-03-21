-- Add awards column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS awards TEXT;
