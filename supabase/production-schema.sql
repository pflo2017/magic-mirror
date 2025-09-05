-- Production Hair Try-On SaaS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE style_category AS ENUM ('women', 'men', 'beard', 'color');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Salons table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subscription_status subscription_status DEFAULT 'active',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    session_duration INTEGER DEFAULT 30, -- minutes
    max_ai_uses INTEGER DEFAULT 5,
    total_ai_generations_used INTEGER DEFAULT 0,
    free_trial_generations INTEGER DEFAULT 10,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client sessions table
CREATE TABLE IF NOT EXISTS sessions (
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

-- Predefined styles table
CREATE TABLE IF NOT EXISTS styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category style_category NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prompt JSONB NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for tracking usage
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    category style_category,
    style_name TEXT,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generations table for caching results
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    generated_image_url TEXT NOT NULL,
    prompt_used JSONB NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salons_auth_user_id ON salons(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_salons_email ON salons(email);
CREATE INDEX IF NOT EXISTS idx_sessions_salon_id ON sessions(salon_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_salon_id ON analytics(salon_id);
CREATE INDEX IF NOT EXISTS idx_analytics_used_at ON analytics(used_at);
CREATE INDEX IF NOT EXISTS idx_ai_generations_session_id ON ai_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_style_id ON ai_generations(style_id);
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_is_active ON styles(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now to test (we'll enable it later)
ALTER TABLE salons DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE styles DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON salons TO anon, authenticated, service_role;
GRANT ALL ON sessions TO anon, authenticated, service_role;
GRANT ALL ON styles TO anon, authenticated, service_role;
GRANT ALL ON analytics TO anon, authenticated, service_role;
GRANT ALL ON ai_generations TO anon, authenticated, service_role;
