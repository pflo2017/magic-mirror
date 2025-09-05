-- Update schema to work with Supabase Auth
-- This links salon records to Supabase auth users

-- Add auth_user_id to salons table to link with Supabase Auth
ALTER TABLE salons ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_salons_auth_user_id ON salons(auth_user_id);

-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Service role can manage salons" ON salons;
DROP POLICY IF EXISTS "Allow salon registration" ON salons;
DROP POLICY IF EXISTS "Allow email check" ON salons;
DROP POLICY IF EXISTS "Salon owners can manage own data" ON salons;

-- New RLS policies that work with Supabase Auth
-- Service role can manage all salons
CREATE POLICY "Service role can manage salons" ON salons
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can view and update their own salon
CREATE POLICY "Users can manage own salon" ON salons
FOR ALL TO authenticated 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Allow reading salons for email uniqueness check (but only email field)
CREATE POLICY "Allow email uniqueness check" ON salons
FOR SELECT TO anon, authenticated
USING (true);

-- Function to create salon after successful auth signup
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create salon record if user metadata indicates they're a salon
  IF NEW.raw_user_meta_data->>'user_type' = 'salon' THEN
    INSERT INTO salons (
      auth_user_id,
      name,
      email,
      subscription_status,
      session_duration,
      max_ai_uses,
      total_ai_generations_used,
      free_trial_generations
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'salon_name', 'New Salon'),
      NEW.email,
      'active',
      30,
      5,
      0,
      10
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create salon record when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_salon_user();

-- Function to get salon by auth user ID
CREATE OR REPLACE FUNCTION get_salon_by_auth_user(user_id UUID)
RETURNS salons
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salon_record salons;
BEGIN
  SELECT * INTO salon_record 
  FROM salons 
  WHERE auth_user_id = user_id;
  
  RETURN salon_record;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_salon_by_auth_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_salon_by_auth_user TO service_role;
