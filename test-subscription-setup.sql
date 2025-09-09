-- Test script to verify subscription system setup
-- Run this in Supabase SQL Editor

-- 1. Check if subscription tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'overage_packages', 'billing_history');

-- 2. Check if salon has subscription columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salons' 
AND column_name IN (
  'subscription_status', 
  'subscription_plan_id', 
  'images_used_this_cycle', 
  'images_remaining_this_cycle',
  'total_images_available',
  'billing_cycle_start',
  'billing_cycle_end'
);

-- 3. Check current salon data
SELECT 
  id, 
  name, 
  subscription_status,
  images_used_this_cycle,
  images_remaining_this_cycle,
  total_images_available,
  billing_cycle_start,
  billing_cycle_end
FROM salons 
LIMIT 1;

-- 4. If salon exists but no subscription data, update it
UPDATE salons 
SET 
  subscription_status = 'active',
  subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'Standard Plan' LIMIT 1),
  images_used_this_cycle = 0,
  images_remaining_this_cycle = 200,
  total_images_available = 200,
  billing_cycle_start = CURRENT_DATE,
  billing_cycle_end = CURRENT_DATE + INTERVAL '30 days'
WHERE id = (SELECT id FROM salons LIMIT 1);

-- 5. Verify the update
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
  sp.price_per_month,
  sp.included_images
FROM salons s
LEFT JOIN subscription_plans sp ON s.subscription_plan_id = sp.id
LIMIT 1;
