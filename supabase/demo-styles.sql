-- Insert basic demo styles for testing
INSERT INTO styles (category, name, description, prompt, is_active) VALUES
-- Women's Hairstyles
('women_hairstyles', 'Classic Bob', 'Timeless chin-length bob cut', '{"instruction": "Transform the subject''s hairstyle into a classic bob cut: straight hair cut to chin length with blunt ends, maintaining the person''s natural face shape and features. Keep the original skin tone, eye color, and facial structure exactly the same."}', true),
('women_hairstyles', 'Long Layers', 'Flowing layered long hair', '{"instruction": "Create long layered hair with soft, flowing layers that frame the face. Maintain the person''s natural hair color and facial features. Only change the hair length and layering, keeping everything else identical."}', true),
('women_hairstyles', 'Pixie Cut', 'Short and chic pixie style', '{"instruction": "Transform into a modern pixie cut: very short hair with textured layers, slightly longer on top. Preserve all facial features, skin tone, and eye color. Only modify the hairstyle."}', true),
('women_hairstyles', 'Beach Waves', 'Relaxed wavy hair style', '{"instruction": "Create natural beach waves: medium-length hair with loose, tousled waves. Keep the person''s face, skin, and all features exactly the same. Only change the hair texture and style."}', true),

-- Women's Colors
('women_colors', 'Platinum Blonde', 'Light platinum blonde hair', '{"instruction": "Change only the hair color to platinum blonde while keeping the exact same hairstyle and cut. Preserve all facial features, skin tone, eye color, and bone structure. Only modify hair color."}', true),
('women_colors', 'Auburn Red', 'Rich reddish-brown color', '{"instruction": "Transform hair color to rich auburn red with natural highlights. Keep the hairstyle, face shape, skin tone, and all facial features identical. Only change the hair color."}', true),
('women_colors', 'Chocolate Brown', 'Deep chocolate brown hair', '{"instruction": "Change hair color to deep chocolate brown. Maintain the exact same hairstyle, face shape, skin tone, eye color, and all facial features. Only modify the hair color."}', true),

-- Men's Hairstyles  
('men_hairstyles', 'Classic Fade', 'Clean fade with longer top', '{"instruction": "Create a classic fade haircut: short sides that gradually fade up, longer hair on top styled back. Keep all facial features, skin tone, eye color, and bone structure exactly the same. Only change the hairstyle."}', true),
('men_hairstyles', 'Textured Crop', 'Modern textured crop cut', '{"instruction": "Transform into a textured crop: short sides, textured longer top with a slight fringe. Preserve the person''s face shape, skin tone, and all facial features. Only modify the hairstyle."}', true),
('men_hairstyles', 'Pompadour', 'Classic pompadour style', '{"instruction": "Create a modern pompadour: sides shorter, top hair swept back and up with volume. Keep facial features, skin tone, eye color, and bone structure identical. Only change the hair."}', true),

-- Men's Colors
('men_colors', 'Salt & Pepper', 'Distinguished gray blend', '{"instruction": "Transform hair color to salt and pepper gray with natural aging. Keep the hairstyle, face shape, skin tone, and all facial features exactly the same. Only change hair color."}', true),
('men_colors', 'Dark Brown', 'Rich dark brown color', '{"instruction": "Change hair color to rich dark brown. Maintain the exact same hairstyle, face, skin tone, eye color, and all features. Only modify the hair color."}', true),

-- Men's Beards
('men_beards', 'Full Beard', 'Well-groomed full beard', '{"instruction": "Add a well-groomed full beard that complements the face shape. Keep all facial features, skin tone, eye color, and bone structure exactly the same. Only add facial hair."}', true),
('men_beards', 'Goatee', 'Classic goatee style', '{"instruction": "Add a neat goatee (chin beard with mustache). Preserve the person''s face shape, skin tone, eye color, and all facial features. Only add the goatee facial hair."}', true),
('men_beards', 'Stubble', 'Light stubble beard', '{"instruction": "Add light stubble across the jaw and chin area. Keep all facial features, skin tone, eye color, and bone structure identical. Only add the stubble effect."}', true);

