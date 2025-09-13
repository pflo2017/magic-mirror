-- Fix Buzz Cut to create accurate transformations based on reference image
-- Run this in Supabase SQL Editor

UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  'Transform the subject into a buzz cut hairstyle. A buzz cut is a very short hairstyle where the hair is cut to a uniform length of 1-6mm all over the head, creating a clean, military-style appearance. 

KEY CHARACTERISTICS:
- Very short hair length (1-6mm) - much shorter than a regular short haircut
- Uniform length all over the head
- Clean, neat military-style appearance  
- Hair should be short enough that the scalp is visible through the hair
- Creates a dramatic change from longer hairstyles

TRANSFORMATION REQUIREMENTS:
- Cut the hair to match the buzz cut reference image exactly
- Create the same short, uniform length shown in the reference
- The result should clearly show a buzz cut hairstyle
- Preserve the person''s face, skin tone, and all facial features exactly

Use the reference image as your guide for the exact buzz cut length and appearance. The user has selected this specific short hairstyle and expects to see an accurate buzz cut transformation.'
)
WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';

-- Verify the update
SELECT name, category, prompt->'instruction' as instruction 
FROM styles 
WHERE name = 'Buzz Cut' AND category = 'women_hairstyles';
