-- Fix Security Definer View Issue for salon_locations
-- Run this in your Supabase SQL Editor

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.salon_locations;

-- Recreate the view without SECURITY DEFINER property
CREATE VIEW public.salon_locations AS
SELECT 
    id,
    name,
    city,
    address,
    latitude,
    longitude,
    subscription_status,
    created_at
FROM salons
WHERE (
    (latitude IS NOT NULL) 
    AND (longitude IS NOT NULL) 
    AND ((subscription_status)::text = 'active'::text) 
    AND (name IS NOT NULL) 
    AND (city IS NOT NULL)
);

-- Verify the view was created successfully
SELECT * FROM public.salon_locations LIMIT 5;
