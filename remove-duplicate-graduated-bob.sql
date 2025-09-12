-- Remove the duplicate "Graduated Bob" style, keeping "Graduated Bob Bangs"
-- Run this in your Supabase SQL Editor

DELETE FROM styles 
WHERE name = 'Graduated Bob' 
AND id = 'cb734169-49d1-413f-87ef-194b4c4aa56d';

-- Verify the deletion - this should only show "Graduated Bob Bangs"
SELECT name, id FROM styles WHERE name LIKE '%Graduated Bob%';
