-- Create the PROFILE-PICTURES bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'PROFILE-PICTURES',
  'PROFILE-PICTURES',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;
