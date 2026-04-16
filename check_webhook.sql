-- Check if appointments exist
SELECT 
  a.*,
  c.first_name as coach_first_name,
  c.last_name as coach_last_name
FROM appointments a
JOIN profiles c ON a.coach_id = c.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Check coaches with calendly links
SELECT id, first_name, last_name, calendly_link 
FROM profiles 
WHERE calendly_link IS NOT NULL;
