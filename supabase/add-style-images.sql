-- Add image_url column to styles table for reference images
ALTER TABLE styles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing styles with placeholder reference images
-- These will be replaced with actual style reference images later

-- Women's Hairstyles
UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Classic Bob' AND category = 'women_hairstyles';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Long Layers' AND category = 'women_hairstyles';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1595475038665-8d17c8c2c0d4?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Pixie Cut' AND category = 'women_hairstyles';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Beach Waves' AND category = 'women_hairstyles';

-- Women's Colors
UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Platinum Blonde' AND category = 'women_colors';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1494790108755-2616c27b9e5b?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Auburn Red' AND category = 'women_colors';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Chocolate Brown' AND category = 'women_colors';

-- Men's Hairstyles
UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Classic Fade' AND category = 'men_hairstyles';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Textured Crop' AND category = 'men_hairstyles';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Pompadour' AND category = 'men_hairstyles';

-- Men's Colors
UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Salt & Pepper' AND category = 'men_colors';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Dark Brown' AND category = 'men_colors';

-- Men's Beards
UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Full Beard' AND category = 'men_beards';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Goatee' AND category = 'men_beards';

UPDATE styles SET image_url = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face' 
WHERE name = 'Stubble' AND category = 'men_beards';


