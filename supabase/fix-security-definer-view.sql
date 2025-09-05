-- Fix Security Definer View Issue
-- Run this in your Supabase SQL Editor

-- First, let's see the current view definition
SELECT definition FROM pg_views WHERE viewname = 'salon_locations' AND schemaname = 'public';

-- Drop and recreate the view without SECURITY DEFINER
-- (You'll need to replace this with your actual view definition)
DROP VIEW IF EXISTS public.salon_locations;

-- Recreate the view without SECURITY DEFINER property
-- Example (replace with your actual view logic):
CREATE VIEW public.salon_locations AS
SELECT 
  id,
  name,
  city,
  address,
  -- Add your actual columns here
FROM public.salons
WHERE is_active = true;

-- Enable RLS on the view if needed
-- ALTER VIEW public.salon_locations ENABLE ROW LEVEL SECURITY;
