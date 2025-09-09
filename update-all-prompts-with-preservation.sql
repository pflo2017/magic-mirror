-- Update all AI prompts to include face/feature preservation instruction
-- This ensures consistent behavior across all hairstyles, colors, and beards

-- 1. Update Women's Hairstyles (25 styles)
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  CASE 
    WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' 
    THEN prompt->>'instruction'
    ELSE CONCAT(prompt->>'instruction', ' Preserve the person''s face, skin tone, and all facial features exactly as they are.')
  END
)
WHERE category = 'women_hairstyles' 
AND prompt IS NOT NULL 
AND prompt->>'instruction' IS NOT NULL
AND prompt->>'instruction' NOT LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%';

-- 2. Update Men's Hairstyles (25 styles)  
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  CASE 
    WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' 
    THEN prompt->>'instruction'
    ELSE CONCAT(prompt->>'instruction', ' Preserve the person''s face, skin tone, and all facial features exactly as they are.')
  END
)
WHERE category = 'men_hairstyles' 
AND prompt IS NOT NULL 
AND prompt->>'instruction' IS NOT NULL
AND prompt->>'instruction' NOT LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%';

-- 3. Update Women's Hair Colors (13 styles)
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  CASE 
    WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' 
    THEN prompt->>'instruction'
    WHEN prompt->>'instruction' IS NOT NULL 
    THEN CONCAT(prompt->>'instruction', ' Preserve the person''s face, skin tone, and all facial features exactly as they are.')
    ELSE CONCAT('Transform the hair color to ', name, '. Preserve the person''s face, skin tone, and all facial features exactly as they are.')
  END
)
WHERE category = 'women_colors';

-- 4. Update Men's Hair Colors (11 styles)
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  CASE 
    WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' 
    THEN prompt->>'instruction'
    WHEN prompt->>'instruction' IS NOT NULL 
    THEN CONCAT(prompt->>'instruction', ' Preserve the person''s face, skin tone, and all facial features exactly as they are.')
    ELSE CONCAT('Transform the hair color to ', name, '. Preserve the person''s face, skin tone, and all facial features exactly as they are.')
  END
)
WHERE category = 'men_colors';

-- 5. Update Men's Beards (20 styles)
UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  CASE 
    WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' 
    THEN prompt->>'instruction'
    WHEN prompt->>'instruction' IS NOT NULL 
    THEN CONCAT(prompt->>'instruction', ' Preserve the person''s face, skin tone, and all facial features exactly as they are.')
    ELSE CONCAT('Transform the facial hair to a ', name, ' style. Preserve the person''s face, skin tone, and all facial features exactly as they are.')
  END
)
WHERE category = 'men_beards';

-- Verification: Check how many styles were updated
SELECT 
  category,
  COUNT(*) as total_styles,
  COUNT(CASE WHEN prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%' THEN 1 END) as styles_with_preservation
FROM styles 
WHERE category IN ('women_hairstyles', 'men_hairstyles', 'women_colors', 'men_colors', 'men_beards')
GROUP BY category
ORDER BY category;

-- Show a few examples to verify the updates
SELECT name, category, prompt->>'instruction' as instruction 
FROM styles 
WHERE category IN ('women_hairstyles', 'men_hairstyles', 'women_colors', 'men_colors', 'men_beards')
AND prompt->>'instruction' LIKE '%Preserve the person''s face, skin tone, and all facial features exactly as they are.%'
LIMIT 10;
