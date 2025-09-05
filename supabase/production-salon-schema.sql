-- Production salon schema with proper constraints and relationships
-- This creates the complete salon table structure for production use

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS public.salons CASCADE;

-- Create salons table with proper structure
CREATE TABLE public.salons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    city VARCHAR(255),
    address TEXT,
    
    -- Subscription management
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'cancelled')),
    subscription_plan VARCHAR(50) DEFAULT 'starter' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    
    -- Stripe integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_current_period_start TIMESTAMPTZ,
    subscription_current_period_end TIMESTAMPTZ,
    
    -- Usage limits and tracking
    max_ai_uses INTEGER DEFAULT 100,
    session_duration INTEGER DEFAULT 30, -- minutes
    total_ai_generations_used INTEGER DEFAULT 0,
    free_trial_generations INTEGER DEFAULT 10,
    
    -- Branding
    logo_url TEXT,
    qr_code_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(auth_user_id),
    UNIQUE(email),
    UNIQUE(stripe_customer_id)
);

-- Create indexes for performance
CREATE INDEX idx_salons_auth_user_id ON public.salons(auth_user_id);
CREATE INDEX idx_salons_email ON public.salons(email);
CREATE INDEX idx_salons_stripe_customer_id ON public.salons(stripe_customer_id);
CREATE INDEX idx_salons_subscription_status ON public.salons(subscription_status);

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read and manage their own salon data
CREATE POLICY "Users can manage their own salon" ON public.salons
    FOR ALL USING (auth.uid() = auth_user_id);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON public.salons
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salons_updated_at 
    BEFORE UPDATE ON public.salons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.salons TO authenticated;
GRANT ALL ON public.salons TO service_role;
