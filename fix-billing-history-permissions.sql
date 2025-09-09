-- Fix billing_history table permissions for payment processing

-- 1. Grant necessary permissions to service_role (for API operations)
GRANT ALL ON billing_history TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Ensure RLS is enabled
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage billing_history" ON billing_history;
DROP POLICY IF EXISTS "Salon owners can view their billing history" ON billing_history;

-- 4. Create comprehensive policies for billing_history
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

-- 5. Grant sequence permissions specifically (check actual sequence name)
-- First, let's find the correct sequence name
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    SELECT sequence_name INTO seq_name
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public' 
    AND sequence_name LIKE '%billing_history%';
    
    IF seq_name IS NOT NULL THEN
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || seq_name || ' TO service_role';
        RAISE NOTICE 'Granted permissions on sequence: %', seq_name;
    ELSE
        RAISE NOTICE 'No billing_history sequence found - table might use different ID strategy';
    END IF;
END $$;

-- 6. Show all sequences (for debugging)
SELECT sequence_name, sequence_schema 
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- 7. Verify table permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'billing_history';

-- 7. Test insert (this should work for service_role)
-- Uncomment to test:
-- INSERT INTO billing_history (salon_id, transaction_type, amount, description, images_purchased, stripe_payment_intent_id)
-- VALUES ('test-salon-id', 'test', 1.00, 'Test transaction', 1, 'test_pi_123')
-- ON CONFLICT DO NOTHING;
