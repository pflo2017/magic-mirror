/**
 * Script to enhance existing styles table with better descriptions, 
 * improved AI instructions, and preview images
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Enhanced hairstyles with better AI instructions and descriptions
const enhancedStyles = {
  // Women's Hairstyles - Enhanced existing + new ones
  women_hairstyles: [
    {
      name: "Long Layers",
      description: "Cascading layers that add movement and volume to long hair, perfect for face-framing",
      prompt: {
        instruction: "Create long layered hair extending to mid-back length (18-24 inches). Add multiple cascading layers starting from shoulder level, creating volume and movement. Include face-framing layers around the cheekbones. Maintain natural hair texture with soft, flowing layers that catch light beautifully."
      },
      preview_filename: "long-layers.jpg"
    },
    {
      name: "Beach Waves",
      description: "Effortless, tousled waves that capture the relaxed beach vibe",
      prompt: {
        instruction: "Create relaxed, tousled beach waves in medium-length hair (12-16 inches). Add loose, natural-looking waves throughout with slightly more texture at the ends. Make it look effortless and windswept, as if naturally dried by ocean breeze."
      },
      preview_filename: "beach-waves.jpg"
    },
    {
      name: "Classic Bob",
      description: "Timeless chin-length bob with clean, geometric lines",
      prompt: {
        instruction: "Create a classic bob cut with hair ending at chin to jaw level (8-10 inches). Make clean, blunt cut with straight lines and minimal layering. Create a sleek, geometric shape that frames the face perfectly with sharp, defined edges."
      },
      preview_filename: "classic-bob.jpg"
    },
    {
      name: "Pixie Cut",
      description: "Short, chic style that's both edgy and feminine",
      prompt: {
        instruction: "Create a modern pixie cut with hair length 1-3 inches maximum. Keep sides and back very short, add textured layers on top for movement. Create a slightly longer front section for styling versatility. Make it edgy yet feminine."
      },
      preview_filename: "pixie-cut.jpg"
    },
    {
      name: "Long Bob (Lob)",
      description: "Sophisticated shoulder-length cut that's versatile and modern",
      prompt: {
        instruction: "Create a long bob (lob) cut ending at collarbone length (12-14 inches). Make clean, straight lines with subtle internal layers for movement. Keep the shape sleek and modern with a slight angle longer in front."
      },
      preview_filename: "long-bob.jpg"
    },
    {
      name: "Modern Shag",
      description: "Textured, layered cut with rock-and-roll attitude",
      prompt: {
        instruction: "Create a modern shag cut with heavy layering throughout (10-14 inches). Add choppy, feathered layers with lots of texture and movement. Include curtain bangs and face-framing pieces. Make it look edgy and rock-inspired with deliberate messiness."
      },
      preview_filename: "modern-shag.jpg"
    },
    {
      name: "Curtain Bangs",
      description: "Face-framing bangs that part in the middle like curtains",
      prompt: {
        instruction: "Add curtain bangs that part in the center and frame the face. Create soft, wispy bangs that gradually blend into the side hair. Keep the rest of the hairstyle unchanged, only adding the curtain bang element."
      },
      preview_filename: "curtain-bangs.jpg"
    },
    {
      name: "Blunt Cut",
      description: "Sharp, straight-across cut for a bold, modern look",
      prompt: {
        instruction: "Create a blunt cut with hair ending at one precise length. Make the cut completely straight across with no layers or graduation. Create sharp, defined edges for a bold, geometric appearance."
      },
      preview_filename: "blunt-cut.jpg"
    }
  ],

  // Women's Colors - Enhanced existing + new ones
  women_colors: [
    {
      name: "Platinum Blonde",
      description: "Ultra-light, icy blonde for a striking transformation",
      prompt: {
        instruction: "Transform hair color to platinum blonde - very light, almost white blonde with cool undertones. Maintain the exact same hairstyle and cut. Preserve all facial features, only changing hair color to this dramatic light shade."
      },
      preview_filename: "platinum-blonde.jpg"
    },
    {
      name: "Auburn Red",
      description: "Rich reddish-brown with warm copper highlights",
      prompt: {
        instruction: "Change hair color to auburn red with warm copper undertones and subtle reddish highlights for depth. Keep the hairstyle identical, only transforming the color to this rich, warm red-brown shade."
      },
      preview_filename: "auburn-red.jpg"
    },
    {
      name: "Chocolate Brown",
      description: "Deep, rich brown with warm undertones",
      prompt: {
        instruction: "Transform hair color to deep chocolate brown with warm undertones. Create rich, even color that looks natural and healthy. Maintain the exact same hairstyle, only changing the color."
      },
      preview_filename: "chocolate-brown.jpg"
    },
    {
      name: "Honey Blonde",
      description: "Warm, golden blonde with honey-like tones",
      prompt: {
        instruction: "Change hair color to honey blonde - warm, golden blonde with caramel and honey undertones. Create natural-looking highlights and lowlights for dimension. Keep hairstyle unchanged."
      },
      preview_filename: "honey-blonde.jpg"
    },
    {
      name: "Balayage Highlights",
      description: "Hand-painted highlights for natural, sun-kissed look",
      prompt: {
        instruction: "Add balayage highlights - hand-painted blonde highlights that look natural and sun-kissed. Focus highlights around the face and ends. Create gradual color transition from darker roots to lighter ends."
      },
      preview_filename: "balayage-highlights.jpg"
    },
    {
      name: "Ombre Effect",
      description: "Gradual color transition from dark roots to light ends",
      prompt: {
        instruction: "Create ombre effect with dark roots gradually transitioning to lighter ends. Make the color change smooth and natural, typically from brown/black roots to blonde ends."
      },
      preview_filename: "ombre-effect.jpg"
    }
  ],

  // Men's Hairstyles - Enhanced existing + new ones
  men_hairstyles: [
    {
      name: "Classic Fade",
      description: "Timeless fade with longer hair on top",
      prompt: {
        instruction: "Create a classic fade haircut with short sides that gradually fade up to longer hair on top (2-4 inches). Style the top hair back or to the side. Make clean, professional fade lines."
      },
      preview_filename: "classic-fade.jpg"
    },
    {
      name: "Pompadour",
      description: "Vintage-inspired style with volume and height",
      prompt: {
        instruction: "Create a modern pompadour with sides shorter (1-2 inches), top hair swept back and up with significant volume (3-5 inches). Add texture and height to the front section."
      },
      preview_filename: "pompadour.jpg"
    },
    {
      name: "Textured Crop",
      description: "Modern, textured short cut with subtle fringe",
      prompt: {
        instruction: "Create a textured crop with short sides (1 inch), textured longer top (2-3 inches) with a slight fringe. Add choppy texture throughout the top for modern appeal."
      },
      preview_filename: "textured-crop.jpg"
    },
    {
      name: "Buzz Cut",
      description: "Ultra-short, low-maintenance military-style cut",
      prompt: {
        instruction: "Create a buzz cut with hair clipped very short all over (1/4 to 1/2 inch). Make it even length throughout for clean, minimal appearance."
      },
      preview_filename: "buzz-cut.jpg"
    },
    {
      name: "Quiff",
      description: "Stylish upswept front with shorter sides",
      prompt: {
        instruction: "Create a quiff hairstyle with shorter sides (1-2 inches) and longer top (3-4 inches) styled upward and back. Focus volume and height at the front section."
      },
      preview_filename: "quiff.jpg"
    },
    {
      name: "Side Part",
      description: "Classic professional style with defined part",
      prompt: {
        instruction: "Create a side part hairstyle with medium length hair (2-3 inches) combed to one side with a clean, defined part. Style neatly for professional appearance."
      },
      preview_filename: "side-part.jpg"
    }
  ]
};

async function enhanceExistingStyles() {
  console.log('🎨 Enhancing existing styles database...');

  try {
    // Get all existing styles
    const { data: existingStyles, error } = await supabase
      .from('styles')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching existing styles:', error);
      return;
    }

    console.log(`📊 Found ${existingStyles.length} existing styles`);

    // Process each category
    for (const [category, styles] of Object.entries(enhancedStyles)) {
      console.log(`\n🔄 Processing category: ${category}`);

      for (const style of styles) {
        // Check if style already exists
        const existing = existingStyles.find(s => 
          s.name === style.name && s.category === category
        );

        const styleData = {
          name: style.name,
          category: category,
          description: style.description,
          prompt: style.prompt,
          image_url: `/hairstyle-previews/${style.preview_filename}`,
          is_active: true
        };

        if (existing) {
          // Update existing style with enhanced data
          const { error: updateError } = await supabase
            .from('styles')
            .update(styleData)
            .eq('id', existing.id);

          if (updateError) {
            console.error(`❌ Error updating ${style.name}:`, updateError);
          } else {
            console.log(`✅ Updated: ${style.name}`);
          }
        } else {
          // Insert new style
          const { error: insertError } = await supabase
            .from('styles')
            .insert(styleData);

          if (insertError) {
            console.error(`❌ Error inserting ${style.name}:`, insertError);
          } else {
            console.log(`✅ Inserted: ${style.name}`);
          }
        }
      }
    }

    // Show final summary
    const { data: finalStyles, error: countError } = await supabase
      .from('styles')
      .select('category, count(*)', { count: 'exact' })
      .eq('is_active', true);

    if (!countError && finalStyles) {
      console.log('\n📊 Final Database Summary:');
      finalStyles.forEach(row => {
        console.log(`   ${row.category}: ${row.count || 0} styles`);
      });
    }

    console.log('\n🎉 Style enhancement completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Generate preview images using the AI prompts');
    console.log('2. Save images to /public/hairstyle-previews/');
    console.log('3. Test the enhanced AI instructions');

  } catch (error) {
    console.error('❌ Error enhancing styles:', error);
  }
}

// Run the enhancement
enhanceExistingStyles();
