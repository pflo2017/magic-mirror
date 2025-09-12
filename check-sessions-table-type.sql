-- Check what type of sessions table this is
-- Run this in your Supabase SQL Editor

-- Check if this is the auth.sessions table (Supabase Auth)
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'sessions';

-- Check if there's a custom sessions table in public schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we should create our own sessions table
-- Let's see what other custom tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%session%';

-- Check for any client or user session related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%client%' OR table_name LIKE '%user%');
