-- Fix permissions for salon signup
-- This script adds the necessary policies to allow the service role to create salons

-- First, let's add a policy that allows the service role to insert salons
-- The service role should be able to create new salon accounts
CREATE POLICY "Service role can insert salons" ON salons 
FOR INSERT 
WITH CHECK (true);

-- Allow service role to read all salons (needed for email uniqueness checks)
CREATE POLICY "Service role can read salons" ON salons 
FOR SELECT 
USING (true);

-- Allow service role to update salons (needed for QR code updates)
CREATE POLICY "Service role can update salons" ON salons 
FOR UPDATE 
USING (true);

-- Grant necessary permissions to the service role
-- Note: In Supabase, the service role typically has these permissions already,
-- but we're being explicit here

-- Make sure the service role can bypass RLS when needed
-- This is usually handled automatically by Supabase for the service role

-- Alternative approach: Create a function that bypasses RLS for salon creation
CREATE OR REPLACE FUNCTION create_salon_account(
  salon_name TEXT,
  salon_email TEXT,
  salon_phone TEXT DEFAULT NULL,
  salon_address TEXT DEFAULT NULL
)
RETURNS salons
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
DECLARE
  new_salon salons;
BEGIN
  -- Check if salon already exists
  IF EXISTS (SELECT 1 FROM salons WHERE email = salon_email) THEN
    RAISE EXCEPTION 'A salon with this email already exists';
  END IF;
  
  -- Insert new salon
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
    'active',
    30,
    5,
    0,
    10
  ) RETURNING * INTO new_salon;
  
  RETURN new_salon;
END;
$$;

-- Grant execute permission on the function to the service role
GRANT EXECUTE ON FUNCTION create_salon_account TO service_role;

-- Also grant to anon role for API access
GRANT EXECUTE ON FUNCTION create_salon_account TO anon;
