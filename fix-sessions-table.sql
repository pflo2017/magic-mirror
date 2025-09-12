-- Fix the sessions table to match what the API expects
-- Run this in your Supabase SQL Editor

-- First, check current sessions table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- Add the missing ai_uses column if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_uses INTEGER DEFAULT 0;

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if the id column has the correct default
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'id';

-- If the id column doesn't have a default, add it
-- (This might fail if there are existing records, but we'll handle that)
-- ALTER TABLE sessions ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Test creating a session manually
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
) RETURNING id, salon_id, expires_at;
