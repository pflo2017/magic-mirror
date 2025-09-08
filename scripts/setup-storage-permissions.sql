-- Ensure storage buckets and permissions are properly configured
-- Run this in your Supabase SQL Editor

-- 1. Create hair-tryon-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hair-tryon-images',
  'hair-tryon-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view hair tryon images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload hair tryon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their hair tryon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their hair tryon images" ON storage.objects;

-- 3. Create permissive policies for hair-tryon-images bucket
CREATE POLICY "Public read access for hair tryon images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hair-tryon-images');

CREATE POLICY "Public upload access for hair tryon images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hair-tryon-images');

CREATE POLICY "Public update access for hair tryon images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'hair-tryon-images');

CREATE POLICY "Public delete access for hair tryon images" ON storage.objects
  FOR DELETE USING (bucket_id = 'hair-tryon-images');

-- 4. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'hair-tryon-images';

-- 6. Check policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%hair tryon%';
