-- Add comprehensive transaction tracking to billing_history table

-- 1. Add missing Stripe transaction fields
ALTER TABLE billing_history 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'overage_purchase',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_billing_history_stripe_session ON billing_history(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_stripe_payment ON billing_history(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_salon_date ON billing_history(salon_id, created_at);
CREATE INDEX IF NOT EXISTS idx_billing_history_transaction_type ON billing_history(transaction_type);

-- 3. Create a comprehensive transactions view for reporting
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  bh.id,
  bh.salon_id,
  s.name as salon_name,
  s.email as salon_email,
  bh.transaction_type,
  bh.total_charge,
  bh.overage_charges,
  bh.overage_images,
  bh.currency,
  bh.payment_status,
  bh.stripe_checkout_session_id,
  bh.stripe_payment_intent_id,
  bh.payment_method_type,
  bh.description,
  bh.created_at,
  bh.processed_at,
  bh.refunded_at,
  bh.refund_amount,
  CASE 
    WHEN bh.refunded_at IS NOT NULL THEN 'refunded'
    WHEN bh.payment_status = 'completed' THEN 'completed'
    ELSE bh.payment_status
  END as final_status
FROM billing_history bh
LEFT JOIN salons s ON bh.salon_id = s.id
ORDER BY bh.created_at DESC;

-- 4. Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'billing_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Grant permissions on the new view
GRANT SELECT ON transaction_summary TO service_role, authenticated;

-- 6. Test query to show what we can now track
SELECT 
  'Transaction tracking enhanced!' as status,
  'Now storing: Stripe IDs, payment methods, metadata, refunds, and more' as details;

