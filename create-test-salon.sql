-- Create a test salon for testing the QR code functionality
-- Run this in your Supabase SQL Editor

-- First, let's see if there are any existing salons
SELECT id, name, email FROM salons LIMIT 5;

-- Create a test salon if none exist
INSERT INTO salons (
  id,
  name, 
  email, 
  subscription_status, 
  session_duration, 
  max_ai_uses,
  images_remaining_this_cycle,
  total_images_available
) VALUES (
  'test-salon-123',
  'Test Beauty Salon',
  'test@salon.com',
  'active',
  30,
  5,
  100,
  100
) ON CONFLICT (id) DO NOTHING;

-- Verify the salon was created
SELECT id, name, email, subscription_status FROM salons WHERE id = 'test-salon-123';
