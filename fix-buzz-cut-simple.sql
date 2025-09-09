-- Remove "military-style" from Buzz Cut prompt - keep everything else the same
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  'Transform the subject into a buzz cut hairstyle. Create very short, uniform hair length all over the head (typically 1-6mm), giving a clean, neat appearance. Use the reference image as a guide for the exact length and style. Preserve the person''s face, skin tone, and all facial features exactly as they are.'
)
WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';

-- Verify the update
SELECT name, prompt FROM styles WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';
