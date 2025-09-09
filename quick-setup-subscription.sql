-- Quick setup script - Run this in Supabase SQL Editor
-- This will create the subscription system and initialize your salon

-- 1. First, run the main subscription system creation script
-- (Copy and paste the entire contents of supabase/create-subscription-system.sql)

-- 2. Then run this quick setup:

-- Insert default subscription plan
INSERT INTO subscription_plans (name, price_monthly, images_included, max_images_per_session)
SELECT 'Standard Plan', 49.00, 200, 5
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Standard Plan');

-- Insert overage packages
INSERT INTO overage_packages (name, price, images_included)
SELECT 'Small Package', 20.00, 100
WHERE NOT EXISTS (SELECT 1 FROM overage_packages WHERE name = 'Small Package');

INSERT INTO overage_packages (name, price, images_included)
SELECT 'Large Package', 45.00, 250
WHERE NOT EXISTS (SELECT 1 FROM overage_packages WHERE name = 'Large Package');

-- Update all existing salons with subscription data
UPDATE salons 
SET 
  subscription_status = 'active',
  subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'Standard Plan' LIMIT 1),
  images_used_this_cycle = 0,
  images_remaining_this_cycle = 200,
  total_images_available = 200,
  billing_cycle_start = CURRENT_DATE,
  billing_cycle_end = CURRENT_DATE + INTERVAL '30 days'
WHERE subscription_status IS NULL OR subscription_status = '';

-- Verify the setup
SELECT 
  s.id, 
  s.name, 
  s.subscription_status,
  s.images_used_this_cycle,
  s.images_remaining_this_cycle,
  s.total_images_available,
  s.billing_cycle_start,
  s.billing_cycle_end,
  sp.name as plan_name,
  sp.price_monthly,
  sp.images_included
FROM salons s
LEFT JOIN subscription_plans sp ON s.subscription_plan_id = sp.id
LIMIT 5;
