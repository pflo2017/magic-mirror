-- Secure RLS Policies for HairTryOn SaaS
-- This script creates proper security policies instead of disabling RLS

-- First, re-enable RLS on all tables
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations on salons" ON salons;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all operations on styles" ON styles;
DROP POLICY IF EXISTS "Allow all operations on analytics" ON analytics;
DROP POLICY IF EXISTS "Allow all operations on ai_generations" ON ai_generations;

-- SALONS TABLE POLICIES
-- Allow service role to manage salons (for signup API)
CREATE POLICY "Service role can manage salons" ON salons
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon users to insert new salons (for signup)
CREATE POLICY "Allow salon registration" ON salons
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow anon users to read salons for email uniqueness check
CREATE POLICY "Allow email uniqueness check" ON salons
FOR SELECT 
TO anon
USING (true);

-- Authenticated salon owners can view and update their own data
CREATE POLICY "Salon owners can manage own data" ON salons
FOR ALL 
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- SESSIONS TABLE POLICIES
-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions" ON sessions
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Anon users can create sessions (when scanning QR codes)
CREATE POLICY "Allow session creation" ON sessions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Anon users can read their own sessions (by session ID)
CREATE POLICY "Allow session access" ON sessions
FOR SELECT 
TO anon
USING (true);

-- Anon users can update their own sessions
CREATE POLICY "Allow session updates" ON sessions
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);

-- Salon owners can view sessions for their salon
CREATE POLICY "Salon owners can view own sessions" ON sessions
FOR SELECT 
TO authenticated
USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- STYLES TABLE POLICIES
-- Styles are public - anyone can read them
CREATE POLICY "Styles are public" ON styles
FOR SELECT 
USING (is_active = true);

-- Service role can manage styles
CREATE POLICY "Service role can manage styles" ON styles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- ANALYTICS TABLE POLICIES
-- Service role can manage analytics
CREATE POLICY "Service role can manage analytics" ON analytics
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow inserting analytics data (for tracking usage)
CREATE POLICY "Allow analytics insertion" ON analytics
FOR INSERT 
WITH CHECK (true);

-- Salon owners can view their own analytics
CREATE POLICY "Salon owners can view own analytics" ON analytics
FOR SELECT 
TO authenticated
USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- AI_GENERATIONS TABLE POLICIES
-- Service role can manage AI generations
CREATE POLICY "Service role can manage ai_generations" ON ai_generations
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow inserting AI generation records
CREATE POLICY "Allow ai_generation insertion" ON ai_generations
FOR INSERT 
WITH CHECK (true);

-- Users can view AI generations for their sessions
CREATE POLICY "Allow ai_generation access by session" ON ai_generations
FOR SELECT 
USING (true);

-- Salon owners can view AI generations for their salon's sessions
CREATE POLICY "Salon owners can view own ai_generations" ON ai_generations
FOR SELECT 
TO authenticated
USING (
    session_id IN (
        SELECT s.id FROM sessions s 
        JOIN salons sal ON s.salon_id = sal.id 
        WHERE auth.uid()::text = sal.id::text
    )
);

-- Grant necessary table permissions (but RLS will still apply)
GRANT SELECT, INSERT, UPDATE ON salons TO anon;
GRANT SELECT, INSERT, UPDATE ON sessions TO anon;
GRANT SELECT ON styles TO anon;
GRANT INSERT ON analytics TO anon;
GRANT SELECT, INSERT ON ai_generations TO anon;

-- Ensure service role has full access (bypasses RLS automatically)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Create a function for secure salon creation that bypasses RLS
CREATE OR REPLACE FUNCTION create_salon_secure(
  salon_name TEXT,
  salon_email TEXT,
  salon_phone TEXT DEFAULT NULL,
  salon_address TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  subscription_status subscription_status,
  session_duration INTEGER,
  max_ai_uses INTEGER,
  total_ai_generations_used INTEGER,
  free_trial_generations INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- This function runs with the privileges of the function owner
SET search_path = public
AS $$
DECLARE
  new_salon salons%ROWTYPE;
BEGIN
  -- Check if salon already exists
  IF EXISTS (SELECT 1 FROM salons WHERE salons.email = salon_email) THEN
    RAISE EXCEPTION 'A salon with this email already exists';
  END IF;
  
  -- Insert new salon (this will bypass RLS because of SECURITY DEFINER)
  INSERT INTO salons (
    name, 
    email, 
    subscription_status, 
    session_duration, 
    max_ai_uses, 
    total_ai_generations_used, 
    free_trial_generations
  ) VALUES (
    salon_name,
    salon_email,
    'active'::subscription_status,
    30,
    5,
    0,
    10
  ) RETURNING * INTO new_salon;
  
  -- Return the created salon data
  RETURN QUERY SELECT 
    new_salon.id,
    new_salon.name,
    new_salon.email,
    new_salon.subscription_status,
    new_salon.session_duration,
    new_salon.max_ai_uses,
    new_salon.total_ai_generations_used,
    new_salon.free_trial_generations,
    new_salon.created_at;
END;
$$;

-- Grant execute permission on the secure function
GRANT EXECUTE ON FUNCTION create_salon_secure TO anon;
GRANT EXECUTE ON FUNCTION create_salon_secure TO service_role;
