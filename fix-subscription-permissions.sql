-- Fix permissions for subscription system tables
-- Run this in Supabase SQL Editor

-- Grant permissions on subscription_plans table
GRANT SELECT ON subscription_plans TO service_role;
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON subscription_plans TO anon;

-- Grant permissions on overage_packages table  
GRANT SELECT ON overage_packages TO service_role;
GRANT SELECT ON overage_packages TO authenticated;
GRANT SELECT ON overage_packages TO anon;

-- Grant permissions on billing_history table
GRANT ALL ON billing_history TO service_role;
GRANT SELECT ON billing_history TO authenticated;

-- Verify permissions
SELECT 
  schemaname,
  tablename,
  grantor,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('subscription_plans', 'overage_packages', 'billing_history')
AND grantee IN ('service_role', 'authenticated', 'anon')
ORDER BY table_name, grantee;
