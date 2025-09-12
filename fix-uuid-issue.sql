-- Fix UUID generation issue in sessions table
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check current sessions table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'id';

-- Drop and recreate the sessions table with proper UUID defaults
-- First backup any existing sessions (if any)
CREATE TABLE IF NOT EXISTS sessions_backup AS SELECT * FROM sessions;

-- Drop the problematic table
DROP TABLE IF EXISTS sessions CASCADE;

-- Recreate sessions table with proper UUID generation
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_uses INTEGER DEFAULT 0,
    max_ai_uses INTEGER NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test UUID generation
SELECT uuid_generate_v4() as test_uuid;

-- Test session creation
INSERT INTO sessions (
    salon_id,
    expires_at,
    max_ai_uses
) VALUES (
    'b7f114af-215e-4818-a3ac-aeb298d076f1',
    NOW() + INTERVAL '30 minutes',
    5
) RETURNING id, salon_id;
