-- Debug script to check salon data
-- Run this in Supabase SQL Editor

-- 1. Check if salons table exists and has data
SELECT COUNT(*) as salon_count FROM salons;

-- 2. Check salon structure and data
SELECT 
  id,
  name,
  subscription_status,
  max_ai_uses,
  images_used_this_cycle,
  images_remaining_this_cycle,
  total_images_available,
  billing_cycle_start,
  billing_cycle_end
FROM salons 
LIMIT 3;

-- 3. Check if subscription_plans table has data
SELECT COUNT(*) as plans_count FROM subscription_plans;

-- 4. Check subscription plans
SELECT id, name, price_monthly, images_included FROM subscription_plans;

-- 5. Check if salon has subscription_plan_id set
SELECT 
  s.id,
  s.name,
  s.subscription_plan_id,
  sp.name as plan_name
FROM salons s
LEFT JOIN subscription_plans sp ON s.subscription_plan_id = sp.id
LIMIT 3;

