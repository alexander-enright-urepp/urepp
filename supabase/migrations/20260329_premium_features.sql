-- Premium Features Migration for UREPP
-- Run this in Supabase SQL Editor

-- Add premium fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS custom_theme JSONB DEFAULT '{
  "banner_color": "#1a1a1a",
  "accent_color": "#3b82f6",
  "layout": "standard"
}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{
  "twitter": null,
  "instagram": null,
  "youtube": null,
  "hudl": null
}';

-- Create subscriptions table for Stripe
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'inactive', -- active, inactive, canceled
    plan TEXT DEFAULT 'free', -- free, premium
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Add advanced stats fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS advanced_stats JSONB DEFAULT '{
  "points_per_game": null,
  "assists_per_game": null,
  "rebounds_per_game": null,
  "forty_yard_dash": null,
  "vertical_jump": null,
  "wingspan": null,
  "season_averages": {},
  "game_logs": []
}';

-- Update videos table to support premium features
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_source TEXT DEFAULT 'upload'; -- upload, youtube, hudl

-- Create featured_athletes table for search boosting
CREATE TABLE IF NOT EXISTS featured_athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    featured_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shareable_cards table for tracking shares
CREATE TABLE IF NOT EXISTS shareable_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    card_data JSONB NOT NULL,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update RLS policies for premium content
-- Only premium users can have advanced stats visible
CREATE POLICY "Allow premium advanced stats" ON profiles
    FOR SELECT USING (
        advanced_stats IS NULL OR 
        is_premium = true OR 
        auth.uid() = user_id
    );

-- Add function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = user_uuid 
        AND is_premium = true 
        AND (premium_until IS NULL OR premium_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics table for tracking
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    viewer_user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);

-- Enable RLS on profile views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Only profile owners can see their analytics
CREATE POLICY "Profile owners can view analytics" ON profile_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_views.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Insert trigger to log profile views
CREATE OR REPLACE FUNCTION log_profile_view()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profile_views (profile_id, viewer_ip, viewer_user_agent)
    VALUES (NEW.id, NEW.viewer_ip, NEW.viewer_user_agent);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON videos TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_videos_profile_id ON videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_featured ON videos(is_featured);
