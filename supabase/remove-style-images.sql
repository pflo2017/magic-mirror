-- Remove the poor quality style images
-- Set all image_url fields to NULL so cards show icons instead

UPDATE styles SET image_url = NULL WHERE image_url IS NOT NULL;

-- This will make all style cards show the sparkles icon instead of bad stock photos
-- When you provide the proper style database, we can update these with good images

