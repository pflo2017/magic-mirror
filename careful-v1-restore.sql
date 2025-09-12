-- CAREFUL V1 RESTORE - Only remove what we're sure was added after v1
-- This preserves salon_locations and other potentially important v1 components

-- First, let's only drop tables that we're SURE were added after v1
DROP TABLE IF EXISTS billing_history CASCADE;
DROP TABLE IF EXISTS image_cache CASCADE;
DROP TABLE IF EXISTS b2c_users CASCADE;
DROP TABLE IF EXISTS anonymous_usage CASCADE;
DROP TABLE IF EXISTS device_tracking CASCADE;
DROP TABLE IF EXISTS ip_usage CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS overage_purchases CASCADE;

-- Drop functions that were clearly added after v1 (based on the function list you showed)
DROP FUNCTION IF EXISTS auto_generate_referral_code CASCADE;
DROP FUNCTION IF EXISTS cleanup_anonymous_data CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions CASCADE;
DROP FUNCTION IF EXISTS create_salon_secure CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code CASCADE;
DROP FUNCTION IF EXISTS handle_new_salon_user CASCADE;
DROP FUNCTION IF EXISTS purchase_overage_images CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_billing_cycle CASCADE;

-- Drop enum types that were added after v1
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS billing_status CASCADE;
DROP TYPE IF EXISTS cache_status CASCADE;

-- Drop triggers that were added after v1
DROP TRIGGER IF EXISTS auto_generate_referral_code_trigger ON salons;
DROP TRIGGER IF EXISTS handle_new_salon_user_trigger ON auth.users;

-- Now let's make sure the v1 core tables have the correct structure
-- We'll only ALTER existing tables if needed, not DROP and recreate

-- Check if salons table needs any columns removed that were added after v1
-- (We'll be conservative and only add missing columns, not remove existing ones)

-- Ensure salons table has all v1 columns
DO $$
BEGIN
    -- Add columns that might be missing from v1 schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'session_duration') THEN
        ALTER TABLE salons ADD COLUMN session_duration INTEGER DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'max_ai_uses') THEN
        ALTER TABLE salons ADD COLUMN max_ai_uses INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'total_ai_generations_used') THEN
        ALTER TABLE salons ADD COLUMN total_ai_generations_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'free_trial_generations') THEN
        ALTER TABLE salons ADD COLUMN free_trial_generations INTEGER DEFAULT 10;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'qr_code_url') THEN
        ALTER TABLE salons ADD COLUMN qr_code_url TEXT;
    END IF;
END $$;

-- Ensure sessions table has all v1 columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'client_ip') THEN
        ALTER TABLE sessions ADD COLUMN client_ip TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE sessions ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- Ensure styles table has all v1 columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'styles' AND column_name = 'is_active') THEN
        ALTER TABLE styles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure ai_generations table has all v1 columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generations' AND column_name = 'processing_time_ms') THEN
        ALTER TABLE ai_generations ADD COLUMN processing_time_ms INTEGER;
    END IF;
END $$;

-- Make sure we have the v1 trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure v1 triggers exist
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure v1 indexes exist
CREATE INDEX IF NOT EXISTS idx_sessions_salon_id ON sessions(salon_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_salon_id ON analytics(salon_id);
CREATE INDEX IF NOT EXISTS idx_analytics_used_at ON analytics(used_at);
CREATE INDEX IF NOT EXISTS idx_ai_generations_session_id ON ai_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_style_id ON ai_generations(style_id);
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_is_active ON styles(is_active);

-- Clean up any RLS policies that might have been added after v1
-- We'll recreate the v1 policies to ensure they're correct

-- Drop all existing policies first
DROP POLICY IF EXISTS "Salons can view own data" ON salons;
DROP POLICY IF EXISTS "Salons can update own data" ON salons;
DROP POLICY IF EXISTS "Salons can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Salons can insert sessions" ON sessions;
DROP POLICY IF EXISTS "Salons can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Styles are viewable by everyone" ON styles;
DROP POLICY IF EXISTS "Salons can view own analytics" ON analytics;
DROP POLICY IF EXISTS "Analytics can be inserted" ON analytics;
DROP POLICY IF EXISTS "AI generations viewable by session salon" ON ai_generations;
DROP POLICY IF EXISTS "AI generations can be inserted" ON ai_generations;

-- Recreate v1 RLS policies
CREATE POLICY "Salons can view own data" ON salons FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Salons can update own data" ON salons FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Salons can view own sessions" ON sessions FOR SELECT USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Salons can insert sessions" ON sessions FOR INSERT WITH CHECK (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Salons can update own sessions" ON sessions FOR UPDATE USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);

CREATE POLICY "Styles are viewable by everyone" ON styles FOR SELECT USING (is_active = true);

CREATE POLICY "Salons can view own analytics" ON analytics FOR SELECT USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Analytics can be inserted" ON analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "AI generations viewable by session salon" ON ai_generations FOR SELECT USING (
    session_id IN (
        SELECT s.id FROM sessions s 
        JOIN salons sal ON s.salon_id = sal.id 
        WHERE auth.uid()::text = sal.id::text
    )
);
CREATE POLICY "AI generations can be inserted" ON ai_generations FOR INSERT WITH CHECK (true);

