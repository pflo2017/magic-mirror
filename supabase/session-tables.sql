-- Session Management - Additional columns and functions
-- Run this in Supabase SQL Editor after the main schema

-- Add missing columns to existing sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_uses_count INTEGER DEFAULT 0;

-- Update sessions table to use salons table reference instead of auth.users
-- First, let's check if we need to update the foreign key
DO $$
BEGIN
    -- Drop the old constraint if it exists and references auth.users
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sessions_salon_id_fkey' 
        AND table_name = 'sessions'
    ) THEN
        -- Check if it references auth.users (we want it to reference salons)
        IF EXISTS (
            SELECT 1 FROM information_schema.referential_constraints r
            JOIN information_schema.key_column_usage k ON r.constraint_name = k.constraint_name
            WHERE r.constraint_name = 'sessions_salon_id_fkey'
            AND k.referenced_table_name = 'users'
        ) THEN
            ALTER TABLE sessions DROP CONSTRAINT sessions_salon_id_fkey;
            ALTER TABLE sessions ADD CONSTRAINT sessions_salon_id_fkey 
                FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- RLS Policies for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies (allow public access for client sessions)
DROP POLICY IF EXISTS "Allow public session creation" ON sessions;
CREATE POLICY "Allow public session creation" ON sessions
  FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public session read" ON sessions;
CREATE POLICY "Allow public session read" ON sessions
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "Allow public session update" ON sessions;
CREATE POLICY "Allow public session update" ON sessions
  FOR UPDATE TO public
  USING (true);

-- AI generations policies (allow public access for client transformations)
DROP POLICY IF EXISTS "Allow public ai_generation creation" ON ai_generations;
CREATE POLICY "Allow public ai_generation creation" ON ai_generations
  FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public ai_generation read" ON ai_generations;
CREATE POLICY "Allow public ai_generation read" ON ai_generations
  FOR SELECT TO public
  USING (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;
