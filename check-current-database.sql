-- Check current database structure to understand what exists
-- Run this in your Supabase SQL Editor

-- 1. List all tables in the database
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check sessions table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 3. Check salons table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'salons' 
ORDER BY ordinal_position;

-- 4. Check if UUID extension is enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 5. Check existing data in sessions table (if any)
SELECT COUNT(*) as session_count FROM sessions;

-- 6. Check existing data in salons table
SELECT id, name, email FROM salons LIMIT 3;

-- 7. Check styles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'styles' 
ORDER BY ordinal_position;
