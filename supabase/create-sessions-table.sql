-- Create sessions table for client try-on sessions
-- This table manages temporary sessions for clients using the QR code

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Create sessions table
CREATE TABLE public.sessions (
    id VARCHAR(255) PRIMARY KEY, -- Session token (UUID)
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    
    -- Session timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Usage limits
    max_ai_uses INTEGER DEFAULT 5,
    ai_uses_count INTEGER DEFAULT 0,
    
    -- Session status
    is_active BOOLEAN DEFAULT true,
    
    -- Additional metadata
    client_ip INET,
    user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_sessions_salon_id ON public.sessions(salon_id);
CREATE INDEX idx_sessions_expires_at ON public.sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON public.sessions(is_active);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for client sessions
CREATE POLICY "Allow public session creation" ON public.sessions
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow public session read" ON public.sessions
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow public session update" ON public.sessions
    FOR UPDATE TO public
    USING (true);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON public.sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.sessions TO anon; -- Allow anonymous access for client sessions

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;
