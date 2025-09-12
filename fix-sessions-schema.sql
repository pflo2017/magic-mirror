-- Fix sessions table schema to match API expectations
-- Run this in your Supabase SQL Editor

-- Add the missing ai_uses column that the API expects
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_uses INTEGER DEFAULT 0;

-- Verify the sessions table now has all required columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;
