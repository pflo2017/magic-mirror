-- Ensure salons table has all required columns for the setup flow
-- Add missing columns if they don't exist

-- Add name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'name') THEN
        ALTER TABLE salons ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- Add location column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'location') THEN
        ALTER TABLE salons ADD COLUMN location VARCHAR(500);
    END IF;
END $$;

-- Add auth_user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'auth_user_id') THEN
        ALTER TABLE salons ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add subscription columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'subscription_status') THEN
        ALTER TABLE salons ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'subscription_plan') THEN
        ALTER TABLE salons ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'starter';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'max_ai_uses') THEN
        ALTER TABLE salons ADD COLUMN max_ai_uses INTEGER DEFAULT 100;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'session_duration') THEN
        ALTER TABLE salons ADD COLUMN session_duration INTEGER DEFAULT 30;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'total_ai_generations_used') THEN
        ALTER TABLE salons ADD COLUMN total_ai_generations_used INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salons' AND column_name = 'free_trial_generations') THEN
        ALTER TABLE salons ADD COLUMN free_trial_generations INTEGER DEFAULT 10;
    END IF;
END $$;

-- Add unique constraint on auth_user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'salons' AND constraint_name = 'salons_auth_user_id_key') THEN
        ALTER TABLE salons ADD CONSTRAINT salons_auth_user_id_key UNIQUE (auth_user_id);
    END IF;
END $$;

-- Update RLS policy to allow users to manage their own salon data
DROP POLICY IF EXISTS "Users can manage their own salon" ON salons;
CREATE POLICY "Users can manage their own salon" ON salons
    FOR ALL USING (auth.uid() = auth_user_id);

-- Ensure RLS is enabled
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
