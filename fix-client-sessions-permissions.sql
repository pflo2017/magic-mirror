-- Fix permissions for client_sessions table
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users (your API)
GRANT ALL ON public.client_sessions TO authenticated;
GRANT ALL ON public.client_sessions TO service_role;

-- Grant usage on the sequence (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create policies for Row Level Security
-- Allow service role to do everything (for your API)
CREATE POLICY "Service role can manage client sessions" ON public.client_sessions
FOR ALL USING (auth.role() = 'service_role');

-- Allow reading active sessions (for the frontend)
CREATE POLICY "Allow reading active client sessions" ON public.client_sessions
FOR SELECT USING (is_active = true AND expires_at > NOW());

-- Test permissions by creating a session
INSERT INTO public.client_sessions (
    salon_id,
    expires_at,
    max_ai_uses
) VALUES (
    'b7f114af-215e-4818-a3ac-aeb298d076f1',
    NOW() + INTERVAL '30 minutes',
    5
) RETURNING id, salon_id, expires_at;
