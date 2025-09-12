-- Debug the sessions table structure and test insertion
-- Run this in your Supabase SQL Editor

-- Check if sessions table exists and its structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- Check if there are any existing sessions
SELECT COUNT(*) as session_count FROM sessions;

-- Try to manually create a test session to see what fails
INSERT INTO sessions (
  salon_id,
  expires_at,
  max_ai_uses,
  ai_uses,
  client_ip,
  user_agent
) VALUES (
  'b7f114af-215e-4818-a3ac-aeb298d076f1',
  NOW() + INTERVAL '30 minutes',
  5,
  0,
  NULL,
  NULL
) RETURNING *;
