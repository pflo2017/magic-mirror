-- Subscription and billing system for Magic Mirror Hair Try-On SaaS
-- Supports $49/month base plan with 200 images + $20 overage packages

-- 1. Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  images_included INTEGER NOT NULL,
  max_images_per_session INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plan
INSERT INTO subscription_plans (name, price_monthly, images_included, max_images_per_session) 
VALUES ('Standard Plan', 49.00, 200, 5)
ON CONFLICT DO NOTHING;

-- 2. Create overage packages table
CREATE TABLE IF NOT EXISTS overage_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images_included INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default overage package
INSERT INTO overage_packages (name, price, images_included) 
VALUES ('Extra 100 Images', 20.00, 100)
ON CONFLICT DO NOTHING;

-- 3. Add subscription fields to salons table
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS billing_cycle_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS billing_cycle_end DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
ADD COLUMN IF NOT EXISTS images_used_this_cycle INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_remaining_this_cycle INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS overage_images_purchased INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_images_available INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS max_images_per_session INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_billing_date DATE DEFAULT CURRENT_DATE;

-- 4. Create billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  base_plan_charge DECIMAL(10,2) NOT NULL,
  overage_charges DECIMAL(10,2) DEFAULT 0,
  total_charge DECIMAL(10,2) NOT NULL,
  images_used INTEGER NOT NULL,
  images_included INTEGER NOT NULL,
  overage_images INTEGER DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create overage purchases table
CREATE TABLE IF NOT EXISTS overage_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  overage_package_id UUID NOT NULL REFERENCES overage_packages(id),
  images_purchased INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  billing_cycle_start DATE NOT NULL,
  billing_cycle_end DATE NOT NULL
);

-- 6. Update existing salons with default subscription
UPDATE salons 
SET 
  subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'Standard Plan' LIMIT 1),
  images_remaining_this_cycle = 200,
  total_images_available = 200,
  max_images_per_session = 5
WHERE subscription_plan_id IS NULL;

-- 7. Create function to reset monthly billing cycle
CREATE OR REPLACE FUNCTION reset_monthly_billing_cycle()
RETURNS void AS $$
BEGIN
  -- Reset all salons that have reached their billing cycle end
  UPDATE salons 
  SET 
    billing_cycle_start = billing_cycle_end,
    billing_cycle_end = billing_cycle_end + INTERVAL '1 month',
    images_used_this_cycle = 0,
    images_remaining_this_cycle = (
      SELECT images_included 
      FROM subscription_plans 
      WHERE id = salons.subscription_plan_id
    ),
    overage_images_purchased = 0,
    total_images_available = (
      SELECT images_included 
      FROM subscription_plans 
      WHERE id = salons.subscription_plan_id
    ),
    last_billing_date = CURRENT_DATE
  WHERE billing_cycle_end <= CURRENT_DATE;
  
  -- Create billing history records for completed cycles
  INSERT INTO billing_history (
    salon_id, 
    billing_period_start, 
    billing_period_end, 
    base_plan_charge, 
    overage_charges, 
    total_charge, 
    images_used, 
    images_included, 
    overage_images
  )
  SELECT 
    s.id,
    s.billing_cycle_start - INTERVAL '1 month',
    s.billing_cycle_start,
    sp.price_monthly,
    COALESCE(overage_total.total_overage, 0),
    sp.price_monthly + COALESCE(overage_total.total_overage, 0),
    s.images_used_this_cycle,
    sp.images_included,
    s.overage_images_purchased
  FROM salons s
  JOIN subscription_plans sp ON s.subscription_plan_id = sp.id
  LEFT JOIN (
    SELECT 
      salon_id,
      SUM(price_paid) as total_overage
    FROM overage_purchases 
    WHERE billing_cycle_end = CURRENT_DATE
    GROUP BY salon_id
  ) overage_total ON s.id = overage_total.salon_id
  WHERE s.last_billing_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to purchase overage images
CREATE OR REPLACE FUNCTION purchase_overage_images(
  p_salon_id UUID,
  p_images_needed INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_salon salons%ROWTYPE;
  v_overage_package overage_packages%ROWTYPE;
  v_packages_needed INTEGER;
  v_total_cost DECIMAL(10,2);
  v_total_images INTEGER;
BEGIN
  -- Get salon info
  SELECT * INTO v_salon FROM salons WHERE id = p_salon_id;
  
  -- Get default overage package
  SELECT * INTO v_overage_package FROM overage_packages WHERE is_active = true LIMIT 1;
  
  -- Calculate packages needed (round up)
  v_packages_needed := CEIL(p_images_needed::DECIMAL / v_overage_package.images_included);
  v_total_cost := v_packages_needed * v_overage_package.price;
  v_total_images := v_packages_needed * v_overage_package.images_included;
  
  -- Record the purchase
  INSERT INTO overage_purchases (
    salon_id, 
    overage_package_id, 
    images_purchased, 
    price_paid,
    billing_cycle_start,
    billing_cycle_end
  ) VALUES (
    p_salon_id,
    v_overage_package.id,
    v_total_images,
    v_total_cost,
    v_salon.billing_cycle_start,
    v_salon.billing_cycle_end
  );
  
  -- Update salon's available images
  UPDATE salons 
  SET 
    overage_images_purchased = overage_images_purchased + v_total_images,
    total_images_available = total_images_available + v_total_images
  WHERE id = p_salon_id;
  
  RETURN json_build_object(
    'success', true,
    'packages_purchased', v_packages_needed,
    'images_added', v_total_images,
    'cost', v_total_cost,
    'new_total_available', v_salon.total_images_available + v_total_images
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_salons_billing_cycle ON salons(billing_cycle_end);
CREATE INDEX IF NOT EXISTS idx_billing_history_salon_period ON billing_history(salon_id, billing_period_start);
CREATE INDEX IF NOT EXISTS idx_overage_purchases_salon_cycle ON overage_purchases(salon_id, billing_cycle_start);

-- 10. Verification queries
SELECT 'Subscription system created successfully!' as status;

-- Show current salon subscription status
SELECT 
  s.name as salon_name,
  sp.name as plan_name,
  s.images_used_this_cycle,
  s.images_remaining_this_cycle,
  s.total_images_available,
  s.max_images_per_session,
  s.billing_cycle_start,
  s.billing_cycle_end,
  s.subscription_status
FROM salons s
LEFT JOIN subscription_plans sp ON s.subscription_plan_id = sp.id
LIMIT 5;
