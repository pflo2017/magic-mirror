-- Add 5 new fade styles to men's hairstyles
-- These will be inserted after "Fade Cut" to group all fade-related styles together

INSERT INTO styles (category, name, description, prompt, is_active) VALUES
('men_hairstyles', 'Classic Fade', 'Clean fade with longer top', '{"instruction": "Transform the subjects hairstyle into a classic fade: short sides that gradually fade up to longer hair on top, styled back. The fade should be clean and professional with a smooth transition from short to long. Keep all facial features, skin tone, eye color, and bone structure exactly the same. Only change the hairstyle."}', true),

('men_hairstyles', 'Taper Fade', 'Gradual fade from long to short', '{"instruction": "Transform the subjects hairstyle into a taper fade: gradual transition from longer hair on top to progressively shorter hair on the sides and back. The fade should be subtle and natural-looking. Preserve the persons face shape, skin tone, and all facial features. Only modify the hairstyle."}', true),

('men_hairstyles', 'Skin Fade', 'Fade down to skin level', '{"instruction": "Transform the subjects hairstyle into a skin fade: hair fades down to skin level on the sides and back, creating a sharp contrast with longer hair on top. The fade should be precise and clean. Keep facial features, skin tone, eye color, and bone structure identical. Only change the hair."}', true),

('men_hairstyles', 'Mid Fade', 'Fade starting at temple level', '{"instruction": "Transform the subjects hairstyle into a mid fade: fade starting around temple level, blending from longer hair on top to shorter on sides. The transition should be smooth and balanced. Maintain the persons original facial features and skin tone completely. Only modify the hairstyle."}', true),

('men_hairstyles', 'Low Fade', 'Subtle fade starting low', '{"instruction": "Transform the subjects hairstyle into a low fade: subtle fade starting low around the ears, creating a gentle transition from longer to shorter hair. The fade should be conservative and professional. Preserve all original facial characteristics exactly. Only change the hair styling."}', true);
