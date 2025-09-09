-- Fix security issues for subscription system tables
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on all subscription tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE overage_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "Allow read access to subscription plans" ON subscription_plans
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- 3. Create RLS policies for overage_packages (read-only for all authenticated users)
CREATE POLICY "Allow read access to overage packages" ON overage_packages
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- 4. Create RLS policies for billing_history (salon owners can only see their own records)
CREATE POLICY "Salon owners can view their own billing history" ON billing_history
  FOR SELECT 
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons 
      WHERE auth_user_id = auth.uid()
    )
  );

-- 5. Create RLS policy for billing_history inserts (service role only)
CREATE POLICY "Service role can insert billing records" ON billing_history
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- 6. Grant necessary permissions (keeping existing grants)
GRANT SELECT ON subscription_plans TO service_role, authenticated, anon;
GRANT SELECT ON overage_packages TO service_role, authenticated, anon;
GRANT ALL ON billing_history TO service_role;
GRANT SELECT ON billing_history TO authenticated;

-- 7. Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'overage_packages', 'billing_history')
AND schemaname = 'public';

-- 8. Show created policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'overage_packages', 'billing_history')
ORDER BY tablename, policyname;
