-- Add display_order column to videos table for custom ordering
ALTER TABLE videos ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);
