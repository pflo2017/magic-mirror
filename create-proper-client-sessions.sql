-- Create a proper client sessions table for hair try-on functionality
-- Run this in your Supabase SQL Editor

-- First, check what's in the current public.sessions table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the existing problematic public.sessions table if it exists
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Create a clean client_sessions table for hair try-on functionality
CREATE TABLE public.client_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_uses_count INTEGER DEFAULT 0,
    max_ai_uses INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    client_ip INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX idx_client_sessions_salon_id ON public.client_sessions(salon_id);
CREATE INDEX idx_client_sessions_active ON public.client_sessions(is_active, expires_at);

-- Test creating a session
INSERT INTO public.client_sessions (
    salon_id,
    expires_at,
    max_ai_uses
) VALUES (
    'b7f114af-215e-4818-a3ac-aeb298d076f1',
    NOW() + INTERVAL '30 minutes',
    5
) RETURNING id, salon_id, expires_at, ai_uses_count;
