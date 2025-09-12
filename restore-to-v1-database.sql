-- RESTORE DATABASE TO EXACT V1 STATE
-- This will drop EVERYTHING and recreate only what was in the v1 commit

-- Drop ALL existing tables (including ones added after v1)
DROP TABLE IF EXISTS billing_history CASCADE;
DROP TABLE IF EXISTS image_cache CASCADE;
DROP TABLE IF EXISTS salon_locations CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS usage_records CASCADE;
DROP TABLE IF EXISTS b2c_users CASCADE;
DROP TABLE IF EXISTS anonymous_usage CASCADE;
DROP TABLE IF EXISTS device_tracking CASCADE;
DROP TABLE IF EXISTS ip_usage CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS overage_purchases CASCADE;

-- Drop the v1 tables too so we can recreate them fresh
DROP TABLE IF EXISTS ai_generations CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS styles CASCADE;
DROP TABLE IF EXISTS salons CASCADE;

-- Drop ALL views
DROP VIEW IF EXISTS salon_locations_view CASCADE;
DROP VIEW IF EXISTS active_sessions_view CASCADE;
DROP VIEW IF EXISTS billing_summary_view CASCADE;

-- Drop ALL functions (including ones added after v1)
DROP FUNCTION IF EXISTS auto_generate_referral_code CASCADE;
DROP FUNCTION IF EXISTS cleanup_anonymous_data CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions CASCADE;
DROP FUNCTION IF EXISTS create_salon_secure CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code CASCADE;
DROP FUNCTION IF EXISTS handle_new_salon_user CASCADE;
DROP FUNCTION IF EXISTS purchase_overage_images CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_billing_cycle CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop ALL enum types
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS billing_status CASCADE;
DROP TYPE IF EXISTS cache_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS style_category CASCADE;

-- Drop ALL triggers
DROP TRIGGER IF EXISTS auto_generate_referral_code_trigger ON salons;
DROP TRIGGER IF EXISTS handle_new_salon_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;

-- NOW RECREATE THE EXACT V1 SCHEMA
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types (V1 ONLY)
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE style_category AS ENUM ('women', 'men', 'beard', 'color');

-- Salons table (V1 EXACT)
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subscription_status subscription_status DEFAULT 'inactive',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    session_duration INTEGER DEFAULT 30, -- minutes
    max_ai_uses INTEGER DEFAULT 5,
    total_ai_generations_used INTEGER DEFAULT 0, -- Track total AI generations used
    free_trial_generations INTEGER DEFAULT 10, -- Free trial allowance
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client sessions table (V1 EXACT)
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

-- Predefined styles table (V1 EXACT)
CREATE TABLE styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category style_category NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prompt JSONB NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for tracking usage (V1 EXACT)
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    category style_category,
    style_name TEXT,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generations table for caching results (V1 EXACT)
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    generated_image_url TEXT NOT NULL,
    prompt_used JSONB NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (V1 EXACT)
CREATE INDEX idx_sessions_salon_id ON sessions(salon_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_analytics_salon_id ON analytics(salon_id);
CREATE INDEX idx_analytics_used_at ON analytics(used_at);
CREATE INDEX idx_ai_generations_session_id ON ai_generations(session_id);
CREATE INDEX idx_ai_generations_style_id ON ai_generations(style_id);
CREATE INDEX idx_styles_category ON styles(category);
CREATE INDEX idx_styles_is_active ON styles(is_active);

-- Create updated_at trigger function (V1 EXACT)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (V1 EXACT)
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies (V1 EXACT)

-- Enable RLS on all tables
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Salons can only access their own data
CREATE POLICY "Salons can view own data" ON salons FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Salons can update own data" ON salons FOR UPDATE USING (auth.uid()::text = id::text);

-- Sessions are accessible by the salon that owns them
CREATE POLICY "Salons can view own sessions" ON sessions FOR SELECT USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Salons can insert sessions" ON sessions FOR INSERT WITH CHECK (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Salons can update own sessions" ON sessions FOR UPDATE USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);

-- Styles are readable by everyone (public)
CREATE POLICY "Styles are viewable by everyone" ON styles FOR SELECT USING (is_active = true);

-- Analytics are accessible by salon owners
CREATE POLICY "Salons can view own analytics" ON analytics FOR SELECT USING (
    salon_id IN (SELECT id FROM salons WHERE auth.uid()::text = id::text)
);
CREATE POLICY "Analytics can be inserted" ON analytics FOR INSERT WITH CHECK (true);

-- AI generations are accessible by session owners
CREATE POLICY "AI generations viewable by session salon" ON ai_generations FOR SELECT USING (
    session_id IN (
        SELECT s.id FROM sessions s 
        JOIN salons sal ON s.salon_id = sal.id 
        WHERE auth.uid()::text = sal.id::text
    )
);
CREATE POLICY "AI generations can be inserted" ON ai_generations FOR INSERT WITH CHECK (true);

