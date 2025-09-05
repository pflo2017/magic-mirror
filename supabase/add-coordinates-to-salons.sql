-- Add latitude and longitude columns to salons table for map feature
-- This will enable showing all contracted salons on a map on the landing page

-- Add coordinate columns
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries (for efficient map searches)
CREATE INDEX IF NOT EXISTS idx_salons_coordinates 
ON public.salons (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment explaining the purpose
COMMENT ON COLUMN public.salons.latitude IS 'Latitude coordinate for salon location (for map display)';
COMMENT ON COLUMN public.salons.longitude IS 'Longitude coordinate for salon location (for map display)';

-- Create a view for public salon locations (for the landing page map)
CREATE OR REPLACE VIEW public.salon_locations AS
SELECT 
  id,
  name,
  city,
  address,
  latitude,
  longitude,
  subscription_status,
  created_at
FROM public.salons
WHERE 
  latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND subscription_status = 'active'
  AND name IS NOT NULL 
  AND city IS NOT NULL;

-- Enable RLS on the view (allow public read access for map)
ALTER VIEW public.salon_locations OWNER TO postgres;

-- Grant public read access to salon locations for the map feature
GRANT SELECT ON public.salon_locations TO anon;
GRANT SELECT ON public.salon_locations TO authenticated;

-- Add RLS policy for public salon locations
-- Drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Public salon locations are viewable by everyone" ON public.salons;

CREATE POLICY "Public salon locations are viewable by everyone" 
ON public.salons FOR SELECT 
USING (
  latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND subscription_status = 'active'
  AND name IS NOT NULL
);
