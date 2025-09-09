-- Fix Buzz Cut prompt to be more dramatic and effective
-- Run this in Supabase SQL Editor

UPDATE styles 
SET prompt = jsonb_build_object(
  'instruction', 
  'DRAMATIC HAIR TRANSFORMATION: Transform the subject into a BUZZ CUT - this is a COMPLETE HAIR MAKEOVER that must be EXTREMELY VISIBLE and OBVIOUS. 

CRITICAL REQUIREMENTS:
- CUT ALL HAIR TO 1-3mm LENGTH (almost bald)
- REMOVE 90% OF THE HAIR LENGTH  
- CREATE A MILITARY-STYLE BUZZ CUT
- MAKE THE SCALP CLEARLY VISIBLE
- ENSURE THE TRANSFORMATION IS SHOCKING AND DRAMATIC

MANDATORY CHANGES:
1. DRASTICALLY SHORTEN ALL HAIR to uniform buzz cut length
2. REMOVE all long hair completely
3. CREATE a clean, almost-bald appearance
4. MAKE the change so dramatic that the before/after looks like two different people
5. PRESERVE the persons face, skin, and features exactly

TRANSFORMATION INTENSITY: This must be a COMPLETE HAIR REMOVAL - not a trim, not a short cut, but an EXTREME BUZZ CUT where most hair is gone. The result should be shocking and dramatically different from the original.

Generate an image where the hair transformation is so dramatic and obvious that anyone can immediately see the massive change.'
)
WHERE id = '63e4106a-6b90-45c2-8048-2d503d4f4ea3' 
AND name = 'Buzz Cut' 
AND category = 'women_hairstyles';

-- Verify the update
SELECT name, category, prompt FROM styles 
WHERE id = '63e4106a-6b90-45c2-8048-2d503d4f4ea3';
