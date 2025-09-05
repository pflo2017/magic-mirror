-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE style_category AS ENUM ('women', 'men', 'beard', 'color');

-- Salons table
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

-- Client sessions table
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

-- Predefined styles table
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

-- Analytics table for tracking usage
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    category style_category,
    style_name TEXT,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generations table for caching results
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

-- Create indexes for better performance
CREATE INDEX idx_sessions_salon_id ON sessions(salon_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_analytics_salon_id ON analytics(salon_id);
CREATE INDEX idx_analytics_used_at ON analytics(used_at);
CREATE INDEX idx_ai_generations_session_id ON ai_generations(session_id);
CREATE INDEX idx_ai_generations_style_id ON ai_generations(style_id);
CREATE INDEX idx_styles_category ON styles(category);
CREATE INDEX idx_styles_is_active ON styles(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

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
