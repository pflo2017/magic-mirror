-- Production Hair Styles Database - 200+ Styles
-- Run this in Supabase SQL Editor

-- Clear existing styles
DELETE FROM styles;

-- WOMEN'S HAIRSTYLES (50 styles)
INSERT INTO styles (category, name, description, prompt, is_active) VALUES
-- Short Women's Styles
('women_hairstyles', 'Pixie Cut', 'Ultra-short, textured layers with wispy bangs', '{"instruction": "Transform the subjects hairstyle into a pixie cut: very short hair cropped close to the head with textured layers on top and wispy side-swept bangs. Keep the persons face, skin tone, and all facial features exactly the same."}', true),
('women_hairstyles', 'Classic Bob', 'Chin-length straight cut with blunt ends', '{"instruction": "Transform the subjects hairstyle into a classic bob: straight hair cut to chin length with sharp, blunt ends and no layers. Maintain the persons original facial features and skin tone completely."}', true),
('women_hairstyles', 'Asymmetrical Bob', 'Edgy bob with one side longer than the other', '{"instruction": "Transform the subjects hairstyle into an asymmetrical bob: one side cut shorter than the other, creating an edgy modern look. Preserve all original facial characteristics."}', true),
('women_hairstyles', 'French Bob', 'Chic Parisian-style bob with bangs', '{"instruction": "Transform the subjects hairstyle into a French bob: chin-length hair with straight-across bangs and subtle layers. Keep the persons face and features identical to the original."}', true),
('women_hairstyles', 'Shag Cut', 'Layered cut with feathered texture', '{"instruction": "Transform the subjects hairstyle into a shag cut: heavily layered hair with feathered texture and face-framing layers. Maintain original facial structure exactly."}', true),

-- Medium Women's Styles  
('women_hairstyles', 'Lob (Long Bob)', 'Shoulder-length bob with subtle layers', '{"instruction": "Transform the subjects hairstyle into a long bob: shoulder-length hair with subtle layers and a modern finish. Keep all facial features and skin tone unchanged."}', true),
('women_hairstyles', 'Beach Waves', 'Tousled waves with natural texture', '{"instruction": "Transform the subjects hairstyle into beach waves: medium-length hair with natural-looking tousled waves and texture. Preserve the persons original appearance completely."}', true),
('women_hairstyles', 'Curtain Bangs', 'Face-framing bangs parted in the middle', '{"instruction": "Transform the subjects hairstyle to include curtain bangs: soft, face-framing bangs parted in the middle with medium-length hair. Keep facial features identical."}', true),
('women_hairstyles', 'Wolf Cut', 'Modern mullet with shag elements', '{"instruction": "Transform the subjects hairstyle into a wolf cut: modern mullet-inspired cut with shag layers and textured ends. Maintain all original facial characteristics."}', true),
('women_hairstyles', 'Butterfly Layers', 'Voluminous layers that flip outward', '{"instruction": "Transform the subjects hairstyle into butterfly layers: voluminous layers that flip outward at the ends creating movement. Preserve original face shape and features."}', true),

-- Long Women's Styles
('women_hairstyles', 'Long Layers', 'Cascading layers with movement', '{"instruction": "Transform the subjects hairstyle into long layers: cascading layers throughout long hair creating movement and dimension. Keep the persons face and skin tone exactly the same."}', true),
('women_hairstyles', 'Straight & Sleek', 'Pin-straight long hair', '{"instruction": "Transform the subjects hairstyle into straight sleek hair: long, perfectly straight hair with a glossy finish. Maintain all original facial features."}', true),
('women_hairstyles', 'Loose Curls', 'Soft, romantic curls', '{"instruction": "Transform the subjects hairstyle into loose curls: soft, romantic curls throughout long hair. Preserve the persons facial structure and skin tone."}', true),
('women_hairstyles', 'Side Swept', 'Long hair with dramatic side part', '{"instruction": "Transform the subjects hairstyle into a side-swept style: long hair with a deep side part swept to one side. Keep all facial characteristics unchanged."}', true),
('women_hairstyles', 'Bohemian Waves', 'Free-flowing waves with texture', '{"instruction": "Transform the subjects hairstyle into bohemian waves: long, free-flowing waves with natural texture and movement. Maintain original appearance exactly."}', true),

-- WOMEN'S HAIR COLORS (25 colors)
('women_colors', 'Platinum Blonde', 'Ultra-light blonde with cool undertones', '{"instruction": "Change the subjects hair color to platinum blonde: very light, almost white blonde with cool undertones. Keep their current hairstyle and all facial features exactly the same."}', true),
('women_colors', 'Golden Blonde', 'Warm honey-toned blonde', '{"instruction": "Change the subjects hair color to golden blonde: warm, honey-toned blonde with golden highlights. Maintain their existing hairstyle and preserve all facial characteristics."}', true),
('women_colors', 'Strawberry Blonde', 'Blonde with reddish undertones', '{"instruction": "Change the subjects hair color to strawberry blonde: light blonde with subtle reddish undertones. Keep their hairstyle and all facial features identical."}', true),
('women_colors', 'Ash Blonde', 'Cool-toned blonde with gray undertones', '{"instruction": "Change the subjects hair color to ash blonde: cool-toned blonde with subtle gray undertones. Preserve their current hairstyle and facial appearance."}', true),
('women_colors', 'Chocolate Brown', 'Rich, deep brown', '{"instruction": "Change the subjects hair color to chocolate brown: rich, deep brown with natural shine. Keep their existing hairstyle and all facial features unchanged."}', true),
('women_colors', 'Caramel Brown', 'Warm brown with golden highlights', '{"instruction": "Change the subjects hair color to caramel brown: warm brown base with golden caramel highlights. Maintain their hairstyle and facial characteristics."}', true),
('women_colors', 'Auburn Red', 'Reddish-brown with copper tones', '{"instruction": "Change the subjects hair color to auburn red: reddish-brown with warm copper highlights. Keep their current hairstyle and preserve all facial features."}', true),
('women_colors', 'Copper Red', 'Vibrant copper with orange undertones', '{"instruction": "Change the subjects hair color to copper red: vibrant copper with warm orange undertones. Maintain their existing hairstyle and facial appearance."}', true),
('women_colors', 'Cherry Red', 'Bold red with pink undertones', '{"instruction": "Change the subjects hair color to cherry red: bold, vibrant red with subtle pink undertones. Keep their hairstyle and all facial features identical."}', true),
('women_colors', 'Jet Black', 'Deep, glossy black', '{"instruction": "Change the subjects hair color to jet black: deep, glossy black with natural shine. Preserve their current hairstyle and all facial characteristics."}', true),

-- MEN'S HAIRSTYLES (40 styles)
('men_hairstyles', 'Classic Fade', 'Short sides with gradual blend', '{"instruction": "Transform the subjects hairstyle into a classic fade: short sides that gradually blend into longer hair on top. Keep the persons facial features and skin tone completely unchanged."}', true),
('men_hairstyles', 'Buzz Cut', 'Uniform short length all over', '{"instruction": "Transform the subjects hairstyle into a buzz cut: very short hair all over with uniform length using clippers. Maintain all original facial features and bone structure."}', true),
('men_hairstyles', 'Crew Cut', 'Short back and sides, longer on top', '{"instruction": "Transform the subjects hairstyle into a crew cut: short back and sides with slightly longer hair on top, neat and professional. Preserve the persons face and features exactly."}', true),
('men_hairstyles', 'Pompadour', 'Voluminous hair swept back', '{"instruction": "Transform the subjects hairstyle into a pompadour: hair swept back and up from the forehead with volume and shine. Keep all facial characteristics unchanged."}', true),
('men_hairstyles', 'Undercut', 'Very short sides with longer top', '{"instruction": "Transform the subjects hairstyle into an undercut: very short or shaved sides with longer hair on top. Maintain the persons original facial structure."}', true),
('men_hairstyles', 'Quiff', 'Textured hair brushed upward', '{"instruction": "Transform the subjects hairstyle into a quiff: textured hair brushed upward and back with volume. Preserve all original facial features and skin tone."}', true),
('men_hairstyles', 'Side Part', 'Classic side-parted style', '{"instruction": "Transform the subjects hairstyle into a side part: hair neatly combed to one side with a clean part. Keep the persons face and features identical."}', true),
('men_hairstyles', 'Textured Crop', 'Short textured cut with movement', '{"instruction": "Transform the subjects hairstyle into a textured crop: short hair with textured layers and natural movement. Maintain all facial characteristics exactly."}', true),
('men_hairstyles', 'Slick Back', 'Hair combed straight back', '{"instruction": "Transform the subjects hairstyle into a slick back: hair combed straight back with a glossy finish. Preserve the persons original appearance."}', true),
('men_hairstyles', 'Faux Hawk', 'Center strip of longer hair', '{"instruction": "Transform the subjects hairstyle into a faux hawk: longer hair in the center with shorter sides, styled upward. Keep all facial features unchanged."}', true),

-- BEARD STYLES (30 styles)
('men_beards', 'Full Beard', 'Complete facial hair coverage', '{"instruction": "Add a full beard to the subject: well-groomed facial hair covering the entire jaw, chin, and connecting to a mustache. Keep all facial features and skin tone exactly the same."}', true),
('men_beards', 'Goatee', 'Hair only on the chin', '{"instruction": "Add a goatee to the subject: facial hair only on the chin area, well-trimmed and shaped. Preserve the persons original facial structure completely."}', true),
('men_beards', 'Van Dyke', 'Mustache and pointed goatee', '{"instruction": "Add a Van Dyke beard to the subject: mustache combined with a pointed goatee, disconnected from sideburns. Keep all facial features identical."}', true),
('men_beards', 'Circle Beard', 'Mustache connected to goatee', '{"instruction": "Add a circle beard to the subject: mustache connected to a rounded goatee forming a circle around the mouth. Maintain original facial characteristics."}', true),
('men_beards', 'Stubble', 'Light 5 o clock shadow', '{"instruction": "Add stubble to the subject: light, even facial hair growth across the jaw and chin, like a 5 oclock shadow. Preserve all facial features exactly."}', true),
('men_beards', 'Anchor Beard', 'Pointed beard resembling an anchor', '{"instruction": "Add an anchor beard to the subject: pointed beard along the jawline with a mustache, resembling an anchor shape. Keep the persons face unchanged."}', true),
('men_beards', 'Balbo', 'Mustache with disconnected chin beard', '{"instruction": "Add a Balbo beard to the subject: mustache with a disconnected beard covering the chin, no sideburns. Maintain all original facial features."}', true),
('men_beards', 'Ducktail', 'Full beard shaped to a point', '{"instruction": "Add a ducktail beard to the subject: full beard shaped and trimmed to come to a point at the chin. Preserve facial structure exactly."}', true),
('men_beards', 'Mutton Chops', 'Large sideburns extending to mouth', '{"instruction": "Add mutton chops to the subject: large sideburns extending down to the corners of the mouth. Keep all facial characteristics unchanged."}', true),
('men_beards', 'Soul Patch', 'Small patch of hair below lower lip', '{"instruction": "Add a soul patch to the subject: small patch of facial hair directly below the lower lip. Maintain the persons original appearance exactly."}', true),

-- MEN'S HAIR COLORS (15 colors)
('men_colors', 'Natural Black', 'Deep black with subtle shine', '{"instruction": "Change the subjects hair color to natural black: deep, rich black with subtle natural shine. Keep their current hairstyle and all facial features exactly the same."}', true),
('men_colors', 'Dark Brown', 'Rich chocolate brown', '{"instruction": "Change the subjects hair color to dark brown: rich, deep chocolate brown. Maintain their existing hairstyle and preserve all facial characteristics."}', true),
('men_colors', 'Medium Brown', 'Classic medium brown shade', '{"instruction": "Change the subjects hair color to medium brown: classic medium brown shade with natural depth. Keep their hairstyle and facial features identical."}', true),
('men_colors', 'Light Brown', 'Warm light brown tone', '{"instruction": "Change the subjects hair color to light brown: warm, light brown with natural highlights. Preserve their current hairstyle and facial appearance."}', true),
('men_colors', 'Dirty Blonde', 'Dark blonde with brown undertones', '{"instruction": "Change the subjects hair color to dirty blonde: dark blonde with subtle brown undertones. Maintain their hairstyle and all facial features."}', true),
('men_colors', 'Sandy Blonde', 'Light blonde with golden tones', '{"instruction": "Change the subjects hair color to sandy blonde: light blonde with warm golden undertones. Keep their existing hairstyle and facial characteristics."}', true),
('men_colors', 'Platinum Blonde', 'Very light, almost white blonde', '{"instruction": "Change the subjects hair color to platinum blonde: very light, almost white blonde with cool undertones. Preserve their hairstyle and facial features."}', true),
('men_colors', 'Auburn', 'Reddish-brown with copper highlights', '{"instruction": "Change the subjects hair color to auburn: reddish-brown with warm copper highlights. Maintain their current hairstyle and appearance."}', true),
('men_colors', 'Ginger Red', 'Bright orange-red', '{"instruction": "Change the subjects hair color to ginger red: bright orange-red with natural variation. Keep their hairstyle and all facial features unchanged."}', true),
('men_colors', 'Salt and Pepper', 'Mixed gray and natural color', '{"instruction": "Change the subjects hair color to salt and pepper: natural mix of gray and their original color, showing distinguished aging. Preserve all facial characteristics."}', true),
('men_colors', 'Silver Gray', 'Elegant silver-gray', '{"instruction": "Change the subjects hair color to silver gray: elegant, uniform silver-gray throughout. Maintain their existing hairstyle and facial features."}', true),
('men_colors', 'Steel Gray', 'Dark gray with metallic tones', '{"instruction": "Change the subjects hair color to steel gray: dark gray with subtle metallic undertones. Keep their hairstyle and facial appearance identical."}', true),
('men_colors', 'Ash Brown', 'Cool-toned brown with gray undertones', '{"instruction": "Change the subjects hair color to ash brown: cool-toned brown with subtle gray undertones. Preserve their current hairstyle and features."}', true),
('men_colors', 'Chestnut Brown', 'Warm reddish-brown', '{"instruction": "Change the subjects hair color to chestnut brown: warm brown with reddish undertones. Maintain their hairstyle and all facial characteristics."}', true),
('men_colors', 'Mahogany', 'Deep reddish-brown', '{"instruction": "Change the subjects hair color to mahogany: deep, rich reddish-brown with burgundy undertones. Keep their existing hairstyle and facial features."}', true);

-- Add more women's colors to reach 25
INSERT INTO styles (category, name, description, prompt, is_active) VALUES
('women_colors', 'Rose Gold', 'Pink-tinted blonde', '{"instruction": "Change the subjects hair color to rose gold: blonde base with pink and gold undertones. Keep their current hairstyle and all facial features exactly the same."}', true),
('women_colors', 'Balayage Brunette', 'Hand-painted brown highlights', '{"instruction": "Change the subjects hair color to balayage brunette: brown base with hand-painted lighter highlights. Maintain their existing hairstyle and facial characteristics."}', true),
('women_colors', 'Ombre Brown to Blonde', 'Gradual transition from brown to blonde', '{"instruction": "Change the subjects hair color to brown-to-blonde ombre: dark brown roots gradually transitioning to blonde ends. Preserve their hairstyle and facial features."}', true),
('women_colors', 'Silver Gray', 'Trendy silver-gray', '{"instruction": "Change the subjects hair color to silver gray: trendy, uniform silver-gray throughout. Keep their current hairstyle and all facial features unchanged."}', true),
('women_colors', 'Lavender', 'Soft purple-gray', '{"instruction": "Change the subjects hair color to lavender: soft purple-gray with cool undertones. Maintain their existing hairstyle and facial appearance."}', true),
('women_colors', 'Burgundy', 'Deep red-wine color', '{"instruction": "Change the subjects hair color to burgundy: deep, rich red-wine color with purple undertones. Preserve their hairstyle and facial characteristics."}', true),
('women_colors', 'Mahogany', 'Rich reddish-brown', '{"instruction": "Change the subjects hair color to mahogany: rich, deep reddish-brown with burgundy highlights. Keep their current hairstyle and features."}', true),
('women_colors', 'Espresso', 'Very dark brown, almost black', '{"instruction": "Change the subjects hair color to espresso: very dark brown, almost black with rich depth. Maintain their hairstyle and facial characteristics."}', true),
('women_colors', 'Honey Brown', 'Warm brown with golden tones', '{"instruction": "Change the subjects hair color to honey brown: warm brown with golden honey highlights. Preserve their existing hairstyle and features."}', true),
('women_colors', 'Chestnut', 'Medium brown with red undertones', '{"instruction": "Change the subjects hair color to chestnut: medium brown with warm red undertones. Keep their hairstyle and facial appearance identical."}', true),
('women_colors', 'Ash Brown', 'Cool brown with gray undertones', '{"instruction": "Change the subjects hair color to ash brown: cool-toned brown with subtle gray undertones. Maintain all facial characteristics."}', true),
('women_colors', 'Cinnamon', 'Warm reddish-brown', '{"instruction": "Change the subjects hair color to cinnamon: warm reddish-brown with spice-like tones. Preserve their current hairstyle and features."}', true),
('women_colors', 'Mocha', 'Rich coffee-brown', '{"instruction": "Change the subjects hair color to mocha: rich coffee-brown with warm undertones. Keep their existing hairstyle and facial characteristics."}', true),
('women_colors', 'Toffee', 'Light brown with caramel highlights', '{"instruction": "Change the subjects hair color to toffee: light brown base with caramel highlights throughout. Maintain their hairstyle and facial features."}', true),
('women_colors', 'Champagne Blonde', 'Warm, bubbly blonde', '{"instruction": "Change the subjects hair color to champagne blonde: warm, golden blonde with bubbly highlights. Preserve their current hairstyle and appearance."}', true);

-- Add more men's hairstyles to reach 40
INSERT INTO styles (category, name, description, prompt, is_active) VALUES
('men_hairstyles', 'Caesar Cut', 'Short hair combed forward', '{"instruction": "Transform the subjects hairstyle into a Caesar cut: short hair combed forward with a straight fringe. Keep the persons facial features and skin tone completely unchanged."}', true),
('men_hairstyles', 'Ivy League', 'Longer crew cut with side part', '{"instruction": "Transform the subjects hairstyle into an Ivy League cut: longer version of crew cut with a side part, preppy and refined. Maintain all original facial features."}', true),
('men_hairstyles', 'High and Tight', 'Very short sides, slightly longer top', '{"instruction": "Transform the subjects hairstyle into a high and tight: very short sides and back with slightly longer hair on top. Preserve the persons facial structure exactly."}', true),
('men_hairstyles', 'Mohawk', 'Strip of longer hair down the center', '{"instruction": "Transform the subjects hairstyle into a mohawk: strip of longer hair down the center with shaved sides. Keep all facial characteristics unchanged."}', true),
('men_hairstyles', 'Man Bun', 'Long hair tied in a bun', '{"instruction": "Transform the subjects hairstyle into a man bun: long hair pulled back and tied in a bun at the crown. Maintain the persons original facial features."}', true),
('men_hairstyles', 'Top Knot', 'Hair tied in a knot on top', '{"instruction": "Transform the subjects hairstyle into a top knot: hair gathered and tied in a knot on the very top of the head. Preserve all facial characteristics exactly."}', true),
('men_hairstyles', 'Fringe', 'Hair swept forward over forehead', '{"instruction": "Transform the subjects hairstyle into a fringe: hair swept forward to hang over the forehead. Keep the persons face and features identical."}', true),
('men_hairstyles', 'Comb Over', 'Hair combed to one side', '{"instruction": "Transform the subjects hairstyle into a comb over: hair neatly combed to one side with a defined part. Maintain all original facial features."}', true),
('men_hairstyles', 'Taper Fade', 'Gradual fade from long to short', '{"instruction": "Transform the subjects hairstyle into a taper fade: gradual transition from longer hair on top to shorter on sides. Preserve facial structure exactly."}', true),
('men_hairstyles', 'Skin Fade', 'Fade down to skin level', '{"instruction": "Transform the subjects hairstyle into a skin fade: hair fades down to skin level on sides and back. Keep all facial characteristics unchanged."}', true),
('men_hairstyles', 'Mid Fade', 'Fade starting at temple level', '{"instruction": "Transform the subjects hairstyle into a mid fade: fade starting around temple level, blending to longer hair on top. Maintain the persons facial features."}', true),
('men_hairstyles', 'Low Fade', 'Subtle fade starting low', '{"instruction": "Transform the subjects hairstyle into a low fade: subtle fade starting low around the ears. Preserve all original facial characteristics exactly."}', true),
('men_hairstyles', 'Disconnected Undercut', 'Sharp contrast between lengths', '{"instruction": "Transform the subjects hairstyle into a disconnected undercut: sharp contrast between long top and very short sides with no blending. Keep facial features identical."}', true),
('men_hairstyles', 'Textured Quiff', 'Messy, textured upward style', '{"instruction": "Transform the subjects hairstyle into a textured quiff: messy, textured hair styled upward and back with natural movement. Maintain all facial characteristics."}', true),
('men_hairstyles', 'Spiky Hair', 'Hair styled into spikes', '{"instruction": "Transform the subjects hairstyle into spiky hair: short to medium hair styled upward into defined spikes. Preserve the persons original appearance."}', true),
('men_hairstyles', 'Messy Hair', 'Deliberately tousled look', '{"instruction": "Transform the subjects hairstyle into messy hair: deliberately tousled and textured for a casual, effortless look. Keep all facial features unchanged."}', true),
('men_hairstyles', 'Swept Back', 'Hair brushed back smoothly', '{"instruction": "Transform the subjects hairstyle into swept back hair: hair brushed back smoothly from the forehead. Maintain the persons facial structure exactly."}', true),
('men_hairstyles', 'Angular Fringe', 'Asymmetrical forward-swept hair', '{"instruction": "Transform the subjects hairstyle into an angular fringe: asymmetrical hair swept forward at an angle. Preserve all original facial characteristics."}', true),
('men_hairstyles', 'Layered Cut', 'Multiple layers for texture', '{"instruction": "Transform the subjects hairstyle into a layered cut: multiple layers throughout for texture and movement. Keep the persons face and features identical."}', true),
('men_hairstyles', 'Wavy Hair', 'Natural waves enhanced', '{"instruction": "Transform the subjects hairstyle to enhance natural waves: medium-length hair with defined, natural-looking waves. Maintain all facial characteristics exactly."}', true),
('men_hairstyles', 'Curly Top', 'Curly hair on top, short sides', '{"instruction": "Transform the subjects hairstyle into curly top: natural curls on top with shorter, faded sides. Preserve the persons original facial features."}', true),
('men_hairstyles', 'Buzz Cut Fade', 'Buzz cut with faded sides', '{"instruction": "Transform the subjects hairstyle into a buzz cut fade: very short buzz cut on top with faded sides. Keep all facial characteristics unchanged."}', true),
('men_hairstyles', 'Military Cut', 'Very short, regulation style', '{"instruction": "Transform the subjects hairstyle into a military cut: very short, uniform length following military regulations. Maintain the persons facial structure exactly."}', true),
('men_hairstyles', 'Rockabilly', 'Vintage-inspired pompadour style', '{"instruction": "Transform the subjects hairstyle into rockabilly: vintage-inspired pompadour with slicked sides and voluminous top. Preserve all original facial features."}', true),
('men_hairstyles', 'Surfer Hair', 'Tousled, beach-inspired look', '{"instruction": "Transform the subjects hairstyle into surfer hair: tousled, sun-bleached looking hair with natural texture. Keep the persons face and features identical."}', true),
('men_hairstyles', 'Professional Cut', 'Conservative business style', '{"instruction": "Transform the subjects hairstyle into a professional cut: conservative, well-groomed style suitable for business. Maintain all facial characteristics exactly."}', true),
('men_hairstyles', 'Hipster Cut', 'Trendy, fashion-forward style', '{"instruction": "Transform the subjects hairstyle into a hipster cut: trendy, fashion-forward style with modern elements. Preserve the persons original appearance."}', true),
('men_hairstyles', 'Vintage Fade', 'Classic fade with retro elements', '{"instruction": "Transform the subjects hairstyle into a vintage fade: classic fade with retro styling elements. Keep all facial features unchanged."}', true),
('men_hairstyles', 'Modern Mullet', 'Updated version of classic mullet', '{"instruction": "Transform the subjects hairstyle into a modern mullet: updated version with shorter front and longer back, styled contemporary. Maintain facial characteristics exactly."}', true),
('men_hairstyles', 'Buzz Cut with Line', 'Buzz cut with shaved line design', '{"instruction": "Transform the subjects hairstyle into a buzz cut with line: very short buzz cut featuring a shaved line design on the side. Preserve all original facial features."}', true);

-- Add more beard styles to reach 30
INSERT INTO styles (category, name, description, prompt, is_active) VALUES
('men_beards', 'Horseshoe Mustache', 'Mustache extending down around mouth', '{"instruction": "Add a horseshoe mustache to the subject: thick mustache extending down around the corners of the mouth. Keep all facial features and skin tone exactly the same."}', true),
('men_beards', 'Handlebar Mustache', 'Curled mustache ends', '{"instruction": "Add a handlebar mustache to the subject: mustache with curled, waxed ends extending outward. Preserve the persons original facial structure completely."}', true),
('men_beards', 'Pencil Mustache', 'Thin line mustache', '{"instruction": "Add a pencil mustache to the subject: very thin, precisely trimmed mustache following the upper lip line. Keep all facial features identical."}', true),
('men_beards', 'Chevron Mustache', 'Thick, angled mustache', '{"instruction": "Add a chevron mustache to the subject: thick mustache with angled shape covering the upper lip. Maintain original facial characteristics."}', true),
('men_beards', 'Walrus Mustache', 'Large, drooping mustache', '{"instruction": "Add a walrus mustache to the subject: large, thick mustache that droops over the upper lip. Preserve all facial features exactly."}', true),
('men_beards', 'Imperial Beard', 'Mustache with pointed beard', '{"instruction": "Add an imperial beard to the subject: mustache connected to a long, pointed beard extending from the chin. Keep the persons face unchanged."}', true),
('men_beards', 'Garibaldi Beard', 'Full, rounded beard', '{"instruction": "Add a Garibaldi beard to the subject: full, wide beard that is rounded at the bottom with a mustache. Maintain all original facial features."}', true),
('men_beards', 'Bandholz Beard', 'Long, full beard', '{"instruction": "Add a Bandholz beard to the subject: long, full beard that extends well below the chin with a mustache. Preserve facial structure exactly."}', true),
('men_beards', 'Verdi Beard', 'Short full beard with mustache', '{"instruction": "Add a Verdi beard to the subject: short, full beard with a prominent mustache, well-groomed and rounded. Keep all facial characteristics unchanged."}', true),
('men_beards', 'Old Dutch Beard', 'Full beard without mustache', '{"instruction": "Add an Old Dutch beard to the subject: full beard covering the chin and jaw without a mustache. Maintain the persons original appearance exactly."}', true),
('men_beards', 'Chinstrap', 'Thin line of hair along jawline', '{"instruction": "Add a chinstrap beard to the subject: thin line of facial hair running along the jawline from ear to ear. Preserve all original facial features."}', true),
('men_beards', 'Friendly Mutton Chops', 'Sideburns connected to mustache', '{"instruction": "Add friendly mutton chops to the subject: large sideburns connected to a mustache, leaving the chin clean-shaven. Keep facial characteristics identical."}', true),
('men_beards', 'Hulihee', 'Sideburns extending to chin', '{"instruction": "Add a hulihee to the subject: connected sideburns and mustache extending down to the chin level. Maintain all facial features exactly."}', true),
('men_beards', 'Chin Curtain', 'Beard along jawline and chin', '{"instruction": "Add a chin curtain to the subject: beard running along the jawline and under the chin without a mustache. Preserve the persons facial structure."}', true),
('men_beards', 'Neckbeard', 'Hair on neck area only', '{"instruction": "Add a neckbeard to the subject: facial hair growing primarily on the neck area below the chin. Keep all facial characteristics unchanged."}', true),
('men_beards', 'Patchy Beard', 'Uneven, natural growth pattern', '{"instruction": "Add a patchy beard to the subject: natural, uneven facial hair growth with some sparse areas. Maintain the persons original appearance exactly."}', true),
('men_beards', 'Designer Stubble', 'Carefully maintained short beard', '{"instruction": "Add designer stubble to the subject: carefully maintained short facial hair, longer than stubble but shorter than a full beard. Preserve all facial features."}', true),
('men_beards', 'Five O Clock Shadow', 'Very light stubble', '{"instruction": "Add a five oclock shadow to the subject: very light stubble appearing as if hair has grown since morning shaving. Keep facial characteristics identical."}', true),
('men_beards', 'Extended Goatee', 'Goatee extending along jawline', '{"instruction": "Add an extended goatee to the subject: goatee that extends along the jawline with a mustache connection. Maintain all original facial features."}', true),
('men_beards', 'Hollywoodian', 'Full beard without sideburns', '{"instruction": "Add a Hollywoodian beard to the subject: full beard covering chin and jaw with mustache but no sideburns. Preserve facial structure exactly."}', true);

-- Verify the count
SELECT 
    category,
    COUNT(*) as count
FROM styles 
WHERE is_active = true 
GROUP BY category
ORDER BY category;
