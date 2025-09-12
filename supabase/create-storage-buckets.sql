-- Create storage buckets for Magic Mirror images

-- 1. Hair Try-On Images Bucket (for user uploads and AI results)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hair-tryon-images',
  'hair-tryon-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Style Reference Images Bucket (for style preview cards)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'style-references',
  'style-references',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. Salon Logos Bucket (for salon branding)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-logos',
  'salon-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for hair-tryon-images bucket
CREATE POLICY "Anyone can view hair tryon images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hair-tryon-images');

CREATE POLICY "Anyone can upload hair tryon images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hair-tryon-images');

CREATE POLICY "Users can update their hair tryon images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'hair-tryon-images');

CREATE POLICY "Users can delete their hair tryon images" ON storage.objects
  FOR DELETE USING (bucket_id = 'hair-tryon-images');

-- Set up RLS policies for style-references bucket
CREATE POLICY "Anyone can view style references" ON storage.objects
  FOR SELECT USING (bucket_id = 'style-references');

CREATE POLICY "Authenticated users can upload style references" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'style-references' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update style references" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'style-references' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete style references" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'style-references' AND 
    auth.role() = 'authenticated'
  );

-- Set up RLS policies for salon-logos bucket
CREATE POLICY "Anyone can view salon logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'salon-logos');

CREATE POLICY "Salon owners can upload their logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'salon-logos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Salon owners can update their logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'salon-logos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Salon owners can delete their logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'salon-logos' AND 
    auth.role() = 'authenticated'
  );


