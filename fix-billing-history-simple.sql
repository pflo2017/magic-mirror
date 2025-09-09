-- Simple fix for billing_history permissions (no sequences needed - uses UUID)

-- 1. Grant necessary permissions to service_role
GRANT ALL ON billing_history TO service_role;

-- 2. Ensure RLS is enabled
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage billing_history" ON billing_history;
DROP POLICY IF EXISTS "Salon owners can view their billing history" ON billing_history;

-- 4. Create policies for billing_history
CREATE POLICY "Service role can manage billing_history" ON billing_history
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Salon owners can view their billing history" ON billing_history
FOR SELECT 
TO authenticated
USING (
  salon_id IN (
    SELECT id FROM salons 
    WHERE auth_user_id = auth.uid()
  )
);

-- 5. Verify permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'billing_history'
ORDER BY grantee, privilege_type;

-- 6. Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'billing_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Test that service_role can insert (uncomment to test)
-- INSERT INTO billing_history (
--   salon_id, 
--   billing_period_start, 
--   billing_period_end, 
--   base_plan_charge, 
--   total_charge, 
--   images_used, 
--   images_included
-- ) VALUES (
--   (SELECT id FROM salons LIMIT 1),
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '1 month',
--   49.00,
--   49.00,
--   0,
--   200
-- ) ON CONFLICT DO NOTHING;
