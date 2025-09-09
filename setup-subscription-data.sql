-- Setup script to initialize subscription system with test data
-- Run this in Supabase SQL Editor after running create-subscription-system.sql

-- 1. Insert default subscription plan if it doesn't exist
INSERT INTO subscription_plans (name, price_monthly, images_included, max_images_per_session)
SELECT 'Standard Plan', 49.00, 200, 5
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Standard Plan');

-- 2. Insert overage packages if they don't exist
INSERT INTO overage_packages (name, price, images_included)
SELECT 'Small Package', 20.00, 100
WHERE NOT EXISTS (SELECT 1 FROM overage_packages WHERE name = 'Small Package');

INSERT INTO overage_packages (name, price, images_included)
SELECT 'Large Package', 45.00, 250
WHERE NOT EXISTS (SELECT 1 FROM overage_packages WHERE name = 'Large Package');

-- 3. Update existing salon with subscription data
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

-- 4. Verify the setup
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
WHERE s.subscription_status = 'active';

-- 5. Show available plans and packages
SELECT 'Subscription Plans' as type, name, price_monthly as price, images_included as images, 'Standard salon plan' as description
FROM subscription_plans
UNION ALL
SELECT 'Overage Packages' as type, name, price, images_included as images, 'Additional images package' as description
FROM overage_packages
ORDER BY type, price;
