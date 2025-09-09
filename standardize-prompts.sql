-- Standardize all hairstyle prompts to be consistent and professional
-- This creates a uniform approach that relies on reference images + clear instructions

-- Fix Buzz Cut back to normal, professional prompt
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  'Transform the subject into a buzz cut hairstyle. Create very short, uniform hair length all over the head (typically 1-6mm), giving a clean, military-style appearance. Use the reference image as a guide for the exact length and style. Preserve the person''s face, skin tone, and all facial features exactly as they are.'
)
WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';

-- Verify the update
SELECT name, category, prompt->'instruction' as instruction FROM styles 
WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';

-- Example of how ALL prompts should be structured:
-- 1. Clear transformation instruction
-- 2. Specific style details
-- 3. Reference to using the reference image
-- 4. Preserve facial features instruction

-- Template for future prompts:
/*
'Transform the subject into a [STYLE NAME]. [SPECIFIC STYLE DESCRIPTION]. Use the reference image as a guide for the exact cut, length, and styling. Preserve the person''s face, skin tone, and all facial features exactly as they are.'
*/
