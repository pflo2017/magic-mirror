-- Check specifically the sessions table structure
-- Run this in your Supabase SQL Editor

-- 1. Check if sessions table exists and its structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 2. Check if UUID extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';

-- 3. Test UUID generation
SELECT uuid_generate_v4() as test_uuid;
