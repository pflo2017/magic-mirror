-- Seed data for hairstyles, beard styles, and colors
-- This provides a comprehensive collection of styles for the Hair Try-On SaaS

-- Women's Hairstyles
INSERT INTO styles (category, name, description, prompt) VALUES
('women', 'Pixie Cut', 'Short, chic pixie haircut with textured layers', '{"prompt": "Apply a short pixie haircut with textured layers and side-swept bangs to the subject. The hair should be cropped close to the head with slightly longer pieces on top for texture and movement."}'),
('women', 'Classic Bob', 'Timeless bob cut at chin length', '{"prompt": "Apply a classic bob haircut that ends at chin length with blunt edges and a slight inward curve. The hair should be straight and sleek with a center or side part."}'),
('women', 'Long Bob (Lob)', 'Shoulder-length bob with subtle layers', '{"prompt": "Apply a long bob (lob) haircut that reaches the shoulders with subtle layers and soft edges. The style should have a modern, effortless look with gentle waves."}'),
('women', 'Layered Cut', 'Multi-layered haircut for volume and movement', '{"prompt": "Apply a layered haircut with multiple layers throughout for volume and movement. The layers should frame the face and create texture and bounce in the hair."}'),
('women', 'Shag Cut', 'Textured shag with feathered layers', '{"prompt": "Apply a shag haircut with heavily textured, feathered layers throughout. The style should have a rock-and-roll vibe with choppy, uneven layers and face-framing pieces."}'),
('women', 'Long Straight', 'Long, sleek straight hair', '{"prompt": "Apply long, straight hair that extends past the shoulders with a sleek, polished finish. The hair should be perfectly straight with a healthy shine and minimal layers."}'),
('women', 'Long Wavy', 'Long hair with natural waves', '{"prompt": "Apply long, wavy hair with natural-looking waves that cascade down past the shoulders. The waves should be soft and flowing with good volume and movement."}'),
('women', 'Beach Waves', 'Tousled, beachy wave texture', '{"prompt": "Apply beach waves with a tousled, effortless texture that looks like natural waves from ocean air. The style should have a relaxed, vacation-ready appearance."}'),
('women', 'High Ponytail', 'Sleek high ponytail', '{"prompt": "Style the hair into a high ponytail positioned at the crown of the head. The hair should be pulled back sleekly with no bumps or flyaways, secured with an elastic."}'),
('women', 'Low Ponytail', 'Elegant low ponytail', '{"prompt": "Style the hair into a low ponytail at the nape of the neck. The style should be elegant and polished, perfect for professional or formal occasions."}'),
('women', 'Messy Bun', 'Casual, textured messy bun', '{"prompt": "Style the hair into a messy bun with loose, textured pieces and a deliberately undone appearance. Some strands should frame the face for a casual, effortless look."}'),
('women', 'Top Knot', 'High bun at the crown', '{"prompt": "Style the hair into a top knot positioned high on the crown of the head. The bun should be secure but with some texture and volume for a modern look."}'),
('women', 'French Braid', 'Classic French braid down the back', '{"prompt": "Style the hair into a classic French braid that starts at the crown and continues down the back. The braid should be neat and tight with all hair incorporated."}'),
('women', 'Dutch Braid', 'Inverted Dutch braid', '{"prompt": "Style the hair into a Dutch braid (inverted French braid) that appears to sit on top of the head. The braid should be prominent and well-defined."}'),
('women', 'Side Braid', 'Loose side braid over one shoulder', '{"prompt": "Style the hair into a loose side braid that drapes over one shoulder. The braid should be relaxed with some face-framing pieces left out."}'),
('women', 'Fishtail Braid', 'Intricate fishtail braid pattern', '{"prompt": "Style the hair into a fishtail braid with the characteristic herringbone pattern. The braid should be detailed and intricate, showcasing the weaving technique."}'),
('women', 'Crown Braid', 'Braid wrapped around the head like a crown', '{"prompt": "Style the hair into a crown braid that wraps around the head like a halo. The remaining hair can be left down or incorporated into the braid design."}'),
('women', 'Vintage Waves', 'Classic 1940s finger waves', '{"prompt": "Apply vintage finger waves reminiscent of 1940s Hollywood glamour. The waves should be precise, sculpted, and have a glossy, polished finish."}'),
('women', 'Victory Rolls', 'Retro victory roll updo', '{"prompt": "Style the hair into victory rolls, a classic 1940s updo with rolled sections on either side of the head. The style should be neat and symmetrical."}'),
('women', 'Bouffant', 'Voluminous bouffant style', '{"prompt": "Style the hair into a bouffant with significant volume at the crown and smooth sides. The style should have a retro elegance with height and fullness."}');

-- Men's Hairstyles
INSERT INTO styles (category, name, description, prompt) VALUES
('men', 'Buzz Cut', 'Very short, uniform length all over', '{"prompt": "Apply a buzz cut with very short, uniform length hair all over the head. The hair should be approximately 1-3mm in length with a clean, military-style appearance."}'),
('men', 'Crew Cut', 'Short on sides, slightly longer on top', '{"prompt": "Apply a crew cut with short hair on the sides and back, and slightly longer hair on top. The style should be neat, professional, and well-groomed."}'),
('men', 'Fade Cut', 'Gradual fade from short to long', '{"prompt": "Apply a fade haircut with a gradual transition from very short hair on the sides and back to longer hair on top. The fade should be smooth and well-blended."}'),
('men', 'High Fade', 'Fade starting high on the sides', '{"prompt": "Apply a high fade that starts the transition high up on the sides of the head. The contrast between short and long should be dramatic and well-executed."}'),
('men', 'Low Fade', 'Fade starting low near the ears', '{"prompt": "Apply a low fade that starts the transition low, near the ears and neckline. The fade should be subtle and gradual for a conservative look."}'),
('men', 'Mid Fade', 'Fade starting at temple level', '{"prompt": "Apply a mid fade that starts the transition at temple level. This creates a balanced look between high and low fades."}'),
('men', 'Undercut', 'Disconnected short sides with long top', '{"prompt": "Apply an undercut with very short or shaved sides and back, disconnected from longer hair on top. The contrast should be sharp and defined."}'),
('men', 'Pompadour', 'Voluminous hair swept back from forehead', '{"prompt": "Style the hair into a pompadour with volume at the front, swept back from the forehead. The sides should be shorter with the top having significant height and body."}'),
('men', 'Quiff', 'Textured hair swept up and back', '{"prompt": "Style the hair into a quiff with textured hair swept up and back from the forehead. The style should have a modern, edgy appearance with good volume."}'),
('men', 'Slick Back', 'Hair combed straight back with product', '{"prompt": "Style the hair slicked straight back with a wet look finish. The hair should appear smooth and controlled, combed directly back from the forehead."}'),
('men', 'Side Part', 'Classic side-parted hairstyle', '{"prompt": "Style the hair with a clean side part, with hair combed to one side. The part should be sharp and defined, creating a classic, professional appearance."}'),
('men', 'Textured Crop', 'Short, textured crop with fringe', '{"prompt": "Apply a textured crop haircut with short, choppy layers on top and a textured fringe. The style should have a modern, casual appearance."}'),
('men', 'Caesar Cut', 'Short hair combed forward', '{"prompt": "Apply a Caesar cut with short hair combed forward toward the forehead. The style should be uniform in length with a horizontal fringe."}'),
('men', 'Ivy League', 'Longer crew cut with side part', '{"prompt": "Apply an Ivy League haircut, which is essentially a longer crew cut that can be parted on the side. The style should be preppy and well-groomed."}'),
('men', 'Faux Hawk', 'Styled to mimic a mohawk without shaving', '{"prompt": "Style the hair into a faux hawk with hair styled upward in the center, mimicking a mohawk without actually shaving the sides. The look should be edgy but professional."}'),
('men', 'Man Bun', 'Long hair tied into a bun', '{"prompt": "Style long hair into a man bun, gathered and secured at the back or top of the head. The bun should be neat with some texture and character."}'),
('men', 'Top Knot', 'Hair gathered into a knot on top', '{"prompt": "Style the hair into a top knot with hair gathered and twisted into a knot on the crown of the head. The sides can be faded or undercut."}'),
('men', 'Curly Top', 'Natural curls on top with faded sides', '{"prompt": "Enhance natural curls on top while keeping the sides faded or short. The curls should be well-defined and have good shape and volume."}'),
('men', 'Waves', 'Styled waves with product', '{"prompt": "Style the hair to enhance natural wave patterns with product for definition. The waves should be controlled and have a polished appearance."}'),
('men', 'Mullet', 'Short front and sides, long back', '{"prompt": "Apply a mullet haircut with short hair in the front and on the sides, and longer hair in the back. The style should have a distinct business-front, party-back appearance."}');

-- Beard Styles
INSERT INTO styles (category, name, description, prompt) VALUES
('beard', 'Clean Shave', 'Completely smooth, hair-free face', '{"prompt": "Remove all facial hair to create a completely clean-shaven appearance. The skin should appear smooth and hair-free across the entire face and neck area."}'),
('beard', 'Light Stubble', '1-2 days of beard growth', '{"prompt": "Apply light stubble equivalent to 1-2 days of beard growth. The facial hair should be short, even, and give a slightly rugged but groomed appearance."}'),
('beard', 'Heavy Stubble', '3-5 days of beard growth', '{"prompt": "Apply heavy stubble equivalent to 3-5 days of beard growth. The facial hair should be more pronounced than light stubble but not yet a full beard."}'),
('beard', 'Full Beard', 'Complete beard covering chin, cheeks, and upper lip', '{"prompt": "Apply a full beard that covers the chin, jawline, cheeks, and connects to a mustache. The beard should be well-groomed with even length and good coverage."}'),
('beard', 'Goatee', 'Hair on chin and mustache only', '{"prompt": "Apply a goatee consisting of hair on the chin and a connected mustache, with clean-shaven cheeks. The style should be neat and well-defined."}'),
('beard', 'Van Dyke', 'Pointed goatee with disconnected mustache', '{"prompt": "Apply a Van Dyke beard style with a pointed goatee on the chin and a separate, disconnected mustache. The cheeks should be clean-shaven."}'),
('beard', 'Circle Beard', 'Rounded goatee connecting to mustache', '{"prompt": "Apply a circle beard that forms a circular pattern around the mouth, connecting the goatee to the mustache. The cheeks should be clean-shaven."}'),
('beard', 'Soul Patch', 'Small patch of hair below the lower lip', '{"prompt": "Apply a soul patch, which is a small, neat patch of facial hair located directly below the lower lip. The rest of the face should be clean-shaven."}'),
('beard', 'Chinstrap', 'Thin line of hair along the jawline', '{"prompt": "Apply a chinstrap beard that follows the jawline in a thin, continuous line from ear to ear under the chin. The cheeks and upper lip should be clean-shaven."}'),
('beard', 'Mutton Chops', 'Large sideburns extending to the corners of the mouth', '{"prompt": "Apply mutton chops with large, full sideburns that extend down to the corners of the mouth. The chin and upper lip should be clean-shaven."}'),
('beard', 'Handlebar Mustache', 'Mustache with upturned, waxed ends', '{"prompt": "Apply a handlebar mustache with long, curved ends that are waxed and turned upward. The rest of the face should be clean-shaven unless specified otherwise."}'),
('beard', 'Horseshoe Mustache', 'Mustache extending down around the mouth', '{"prompt": "Apply a horseshoe mustache that extends down from the corners of the mouth in a horseshoe or upside-down U shape. The chin should be clean-shaven."}'),
('beard', 'Pencil Mustache', 'Thin, narrow mustache above the upper lip', '{"prompt": "Apply a pencil mustache, which is a thin, narrow line of hair directly above the upper lip. The mustache should be precisely trimmed and well-defined."}'),
('beard', 'Balbo', 'Beard without sideburns, with mustache', '{"prompt": "Apply a Balbo beard style that covers the chin and jaw but does not connect to the sideburns, paired with a separate mustache. The cheeks should be clean-shaven."}'),
('beard', 'Extended Goatee', 'Goatee extended along the jawline', '{"prompt": "Apply an extended goatee that includes the traditional goatee area plus hair extending along the jawline. The upper cheeks should remain clean-shaven."}'),
('beard', 'Anchor Beard', 'Beard shaped like a ship anchor', '{"prompt": "Apply an anchor beard that resembles the shape of a ship anchor, with a pointed beard on the chin and a mustache, connected by a thin line of hair."}'),
('beard', 'Imperial Beard', 'Mustache with long, pointed extensions', '{"prompt": "Apply an Imperial beard style with a mustache that has long, pointed extensions growing from the corners, often waxed and styled upward or outward."}'),
('beard', 'Ducktail Beard', 'Full beard shaped to a point at the chin', '{"prompt": "Apply a ducktail beard, which is a full beard that is shaped and trimmed to come to a point at the chin, resembling a duck\'s tail."}'),
('beard', 'Bandholz Beard', 'Long, full, natural beard', '{"prompt": "Apply a Bandholz beard, which is a long, full, and natural-looking beard that is allowed to grow freely with minimal trimming, maintaining its natural shape."}'),
('beard', 'Garibaldi Beard', 'Full, rounded beard with natural bottom', '{"prompt": "Apply a Garibaldi beard, which is a full beard with a rounded bottom that follows the natural growth pattern. It should be wide and full but not overly long."}');

-- Hair Colors
INSERT INTO styles (category, name, description, prompt) VALUES
('color', 'Natural Blonde', 'Light golden blonde hair color', '{"prompt": "Change the hair color to a natural blonde shade with golden undertones. The color should look natural and complement the skin tone."}'),
('color', 'Platinum Blonde', 'Very light, almost white blonde', '{"prompt": "Change the hair color to platinum blonde, a very light, almost white blonde shade with cool undertones. The color should be striking and high-contrast."}'),
('color', 'Dirty Blonde', 'Blonde with darker roots and lowlights', '{"prompt": "Change the hair color to dirty blonde, featuring blonde hair with darker roots and subtle brown lowlights for a natural, lived-in appearance."}'),
('color', 'Strawberry Blonde', 'Blonde with reddish undertones', '{"prompt": "Change the hair color to strawberry blonde, a blonde shade with warm reddish and copper undertones that creates a unique, eye-catching color."}'),
('color', 'Ash Blonde', 'Cool-toned blonde with gray undertones', '{"prompt": "Change the hair color to ash blonde, a cool-toned blonde with gray and silver undertones that neutralizes any warmth in the hair."}'),
('color', 'Light Brown', 'Soft, light brown hair color', '{"prompt": "Change the hair color to light brown, a soft and natural brown shade that is versatile and complements most skin tones."}'),
('color', 'Medium Brown', 'Classic medium brown hair color', '{"prompt": "Change the hair color to medium brown, a classic and timeless brown shade that is neither too light nor too dark."}'),
('color', 'Dark Brown', 'Rich, deep brown hair color', '{"prompt": "Change the hair color to dark brown, a rich and deep brown shade with subtle warmth that appears almost black in some lighting."}'),
('color', 'Chocolate Brown', 'Warm, chocolate-toned brown', '{"prompt": "Change the hair color to chocolate brown, a warm and rich brown shade with chocolate undertones that adds depth and richness."}'),
('color', 'Chestnut Brown', 'Reddish-brown hair color', '{"prompt": "Change the hair color to chestnut brown, a brown shade with warm reddish undertones that creates a beautiful, natural-looking color."}'),
('color', 'Jet Black', 'Deep, pure black hair color', '{"prompt": "Change the hair color to jet black, a deep and pure black shade with no visible undertones, creating a striking and dramatic appearance."}'),
('color', 'Soft Black', 'Black with subtle brown undertones', '{"prompt": "Change the hair color to soft black, a black shade with subtle brown undertones that appears more natural and less harsh than pure black."}'),
('color', 'Auburn', 'Reddish-brown hair color', '{"prompt": "Change the hair color to auburn, a beautiful reddish-brown shade that combines the warmth of red with the depth of brown."}'),
('color', 'Copper Red', 'Bright, metallic red hair color', '{"prompt": "Change the hair color to copper red, a bright and metallic red shade with orange undertones that creates a bold, eye-catching appearance."}'),
('color', 'Cherry Red', 'Deep, vibrant red hair color', '{"prompt": "Change the hair color to cherry red, a deep and vibrant red shade that is bold and dramatic, similar to the color of ripe cherries."}'),
('color', 'Burgundy', 'Deep red with purple undertones', '{"prompt": "Change the hair color to burgundy, a deep red shade with purple and wine undertones that creates a sophisticated and rich appearance."}'),
('color', 'Mahogany', 'Dark red-brown hair color', '{"prompt": "Change the hair color to mahogany, a dark red-brown shade that combines the richness of brown with warm red undertones."}'),
('color', 'Silver Gray', 'Metallic silver-gray hair color', '{"prompt": "Change the hair color to silver gray, a metallic silver shade with cool gray undertones that creates a modern and edgy appearance."}'),
('color', 'Ash Gray', 'Cool-toned gray hair color', '{"prompt": "Change the hair color to ash gray, a cool-toned gray shade that appears sophisticated and contemporary."}'),
('color', 'Charcoal Gray', 'Dark gray with black undertones', '{"prompt": "Change the hair color to charcoal gray, a dark gray shade with black undertones that creates a subtle yet striking appearance."}'),
('color', 'Balayage Blonde', 'Hand-painted blonde highlights', '{"prompt": "Apply balayage blonde highlighting technique with hand-painted blonde highlights that create a natural, sun-kissed appearance with seamless blending."}'),
('color', 'Balayage Brown', 'Hand-painted brown highlights', '{"prompt": "Apply balayage brown highlighting technique with hand-painted brown highlights and lowlights that add dimension and depth to the hair."}'),
('color', 'Ombre Blonde', 'Gradient from dark roots to blonde ends', '{"prompt": "Apply ombre blonde coloring with a gradient transition from darker roots to blonde ends, creating a dramatic color progression."}'),
('color', 'Ombre Brown', 'Gradient from dark to light brown', '{"prompt": "Apply ombre brown coloring with a gradient transition from darker brown roots to lighter brown ends for a natural-looking color progression."}'),
('color', 'Highlights Blonde', 'Traditional blonde highlights', '{"prompt": "Apply traditional blonde highlights using foils or caps to create lighter blonde streaks throughout the hair for added dimension and brightness."}'),
('color', 'Highlights Caramel', 'Warm caramel-colored highlights', '{"prompt": "Apply caramel highlights with warm, golden-brown streaks that add richness and dimension to the hair color."}'),
('color', 'Lowlights Brown', 'Darker brown lowlights for depth', '{"prompt": "Apply brown lowlights with darker brown streaks that add depth and dimension to lighter hair colors."}'),
('color', 'Pastel Pink', 'Soft, light pink hair color', '{"prompt": "Change the hair color to pastel pink, a soft and light pink shade that creates a whimsical and trendy appearance."}'),
('color', 'Pastel Blue', 'Soft, light blue hair color', '{"prompt": "Change the hair color to pastel blue, a soft and light blue shade that creates a unique and artistic appearance."}'),
('color', 'Pastel Purple', 'Soft, light purple hair color', '{"prompt": "Change the hair color to pastel purple, a soft and light purple shade that creates a dreamy and ethereal appearance."}'),
('color', 'Vibrant Pink', 'Bright, bold pink hair color', '{"prompt": "Change the hair color to vibrant pink, a bright and bold pink shade that creates a striking and attention-grabbing appearance."}'),
('color', 'Electric Blue', 'Bright, vivid blue hair color', '{"prompt": "Change the hair color to electric blue, a bright and vivid blue shade that creates a bold and edgy appearance."}'),
('color', 'Purple', 'Rich, vibrant purple hair color', '{"prompt": "Change the hair color to purple, a rich and vibrant purple shade that creates a dramatic and artistic appearance."}'),
('color', 'Emerald Green', 'Deep, rich green hair color', '{"prompt": "Change the hair color to emerald green, a deep and rich green shade that creates a unique and bold appearance."}'),
('color', 'Teal', 'Blue-green hair color', '{"prompt": "Change the hair color to teal, a blue-green shade that combines the coolness of blue with the freshness of green."}'),
('color', 'Rose Gold', 'Pinkish-gold hair color', '{"prompt": "Change the hair color to rose gold, a trendy pinkish-gold shade that combines warm gold tones with subtle pink undertones."}'),
('color', 'Two-Tone Black/Blonde', 'Half black, half blonde split', '{"prompt": "Apply a two-tone hair color with one half black and the other half blonde, creating a dramatic split-color effect."}'),
('color', 'Rainbow Ombre', 'Gradient rainbow colors', '{"prompt": "Apply a rainbow ombre effect with multiple colors blending from one to another, creating a vibrant and artistic rainbow gradient."}'),
('color', 'Oil Slick', 'Dark base with colorful highlights', '{"prompt": "Apply an oil slick hair color effect with a dark base and iridescent highlights in blues, purples, and greens that shimmer like an oil spill."}');

-- Add some additional trendy styles
INSERT INTO styles (category, name, description, prompt) VALUES
('women', 'Wolf Cut', 'Shaggy layers with face-framing pieces', '{"prompt": "Apply a wolf cut with shaggy, choppy layers throughout and heavy face-framing pieces. The style should have a wild, untamed appearance with lots of texture and movement."}'),
('women', 'Curtain Bangs', 'Face-framing bangs parted in the middle', '{"prompt": "Add curtain bangs that are parted in the middle and frame the face on both sides. The bangs should be soft and wispy, blending seamlessly with the rest of the hair."}'),
('women', 'Butterfly Haircut', 'Layered cut with face-framing highlights', '{"prompt": "Apply a butterfly haircut with heavily layered hair that creates a butterfly-like silhouette. The layers should be concentrated around the face for maximum movement and volume."}'),
('men', 'Modern Mullet', 'Contemporary take on the classic mullet', '{"prompt": "Apply a modern mullet with a contemporary twist - shorter and more refined than traditional mullets, with textured layers and a more subtle length difference between front and back."}'),
('men', 'Burst Fade', 'Curved fade around the ears', '{"prompt": "Apply a burst fade that curves around the ears in a semi-circular pattern, creating a unique fade shape that follows the natural curve of the ear."}'),
('men', 'Skin Fade', 'Fade down to skin level', '{"prompt": "Apply a skin fade that gradually fades down to skin level on the sides and back, creating the shortest possible fade with a smooth transition."}');

-- Update the created_at timestamps to be more realistic
UPDATE styles SET created_at = NOW() - (random() * interval '30 days');
