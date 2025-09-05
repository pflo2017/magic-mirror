-- Hair Styles with AI Prompts for Face Preservation
-- Run this in Supabase SQL Editor

INSERT INTO styles (category, name, description, prompt, is_active) VALUES
-- Women's Styles with detailed AI prompts
('women', 'Classic Bob', 'Timeless chin-length bob', '{"instruction": "Transform the subjects hairstyle into a classic bob cut: straight hair cut to chin length with blunt ends, maintaining the persons natural face shape and features. Keep the original skin tone, eye color, and facial structure exactly the same."}', true),
('women', 'Pixie Cut', 'Short chic style', '{"instruction": "Transform the subjects hairstyle into a short pixie cut: cropped close around the ears and back, with soft textured layers on top for a chic, modern look. Preserve the persons original facial features, skin tone, and bone structure completely."}', true),
('women', 'Long Layers', 'Flowing layered hair', '{"instruction": "Transform the subjects hairstyle into long layered hair: flowing layers that frame the face naturally, with movement and texture. Keep the persons face, skin tone, eye color, and all facial features identical to the original."}', true),
('women', 'Beach Waves', 'Relaxed wavy texture', '{"instruction": "Transform the subjects hairstyle into relaxed beach waves: medium-length hair with natural-looking waves and texture, as if styled by ocean air. Maintain the persons original facial structure and features exactly."}', true),
('women', 'Lob', 'Long bob style', '{"instruction": "Transform the subjects hairstyle into a long bob (lob): shoulder-length hair with subtle layers and a modern finish. Preserve all original facial features, skin tone, and bone structure of the person."}', true),

-- Men's Styles with detailed AI prompts
('men', 'Modern Fade', 'Clean fade cut', '{"instruction": "Transform the subjects hairstyle into a modern fade: short sides that gradually blend into longer hair on top, with a clean, professional finish. Keep the persons facial features, skin tone, and bone structure completely unchanged."}', true),
('men', 'Pompadour', 'Classic pompadour', '{"instruction": "Transform the subjects hairstyle into a classic pompadour: hair swept back and up from the forehead with volume, styled with a slight shine. Maintain the persons original face shape and all facial characteristics."}', true),
('men', 'Undercut', 'Trendy undercut', '{"instruction": "Transform the subjects hairstyle into a trendy undercut: very short or shaved sides with longer hair on top that can be styled forward or to the side. Preserve the persons natural facial features and skin tone exactly."}', true),
('men', 'Buzz Cut', 'Very short cut', '{"instruction": "Transform the subjects hairstyle into a buzz cut: very short hair all over, uniform length with clippers. Keep the persons face shape, facial features, and skin tone identical to the original image."}', true),
('men', 'Quiff', 'Styled quiff', '{"instruction": "Transform the subjects hairstyle into a styled quiff: hair brushed upward and back from the forehead with volume and texture. Maintain all original facial characteristics and bone structure of the person."}', true),

-- Beard Styles with detailed AI prompts
('beard', 'Full Beard', 'Classic full beard', '{"instruction": "Add a full beard to the subject: well-groomed facial hair covering the chin, jaw, and connecting to a mustache, with natural thickness and color matching their hair. Keep all facial features and skin tone exactly the same."}', true),
('beard', 'Goatee', 'Chin goatee', '{"instruction": "Add a goatee to the subject: facial hair only on the chin area, well-trimmed and shaped, without connecting to a mustache. Preserve the persons original facial structure and features completely."}', true),
('beard', 'Stubble', 'Light stubble', '{"instruction": "Add light stubble to the subject: short, even facial hair growth across the jaw and chin area, giving a casual, masculine look. Keep the persons face shape and all features identical to the original."}', true),

-- Hair Colors with detailed AI prompts
('color', 'Platinum Blonde', 'Very light blonde', '{"instruction": "Change the subjects hair color to platinum blonde: very light, almost white blonde with cool undertones, while keeping their current hairstyle and all facial features exactly the same."}', true),
('color', 'Chocolate Brown', 'Rich brown', '{"instruction": "Change the subjects hair color to rich chocolate brown: deep, warm brown with natural shine, maintaining their existing hairstyle and preserving all original facial characteristics."}', true),
('color', 'Auburn Red', 'Reddish brown', '{"instruction": "Change the subjects hair color to auburn red: reddish-brown with warm copper highlights, keeping their current hairstyle and all facial features identical to the original."}', true),
('color', 'Jet Black', 'Deep black', '{"instruction": "Change the subjects hair color to jet black: deep, rich black with natural shine, while maintaining their existing hairstyle and preserving the persons face and features exactly."}', true);
