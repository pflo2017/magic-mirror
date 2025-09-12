/**
 * Fix the Butterfly Haircut prompt to be more specific and effective
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixButterflyPrompt() {
  console.log('🦋 Fixing Butterfly Haircut AI prompt...');
  
  try {
    const newPrompt = {
      instruction: `Create a butterfly haircut with these SPECIFIC changes:

1. ADD DRAMATIC FACE-FRAMING LAYERS: Cut shorter layers that start at cheekbone level and gradually get longer
2. CREATE WING EFFECT: The layers should flare outward from the face like butterfly wings when styled
3. KEEP BACK LENGTH: Maintain the original length at the back of the head
4. ADD VOLUME AND TEXTURE: The layers should create visible volume and movement around the face
5. MAKE IT OBVIOUS: This should be a dramatic, clearly visible change - not subtle

CRITICAL: The transformation must be clearly visible with shorter pieces framing the face that create a "wing-like" layered effect. The difference should be obvious when comparing to the original image.

Transform ONLY the hair structure by adding these face-framing layers. Keep everything else identical.`
    };

    const { error } = await supabase
      .from('styles')
      .update({ 
        prompt: newPrompt,
        description: "Dramatic face-framing layers that create a wing-like effect around the face, with shorter pieces at cheekbone level that gradually get longer"
      })
      .eq('name', 'Butterfly Haircut')
      .eq('category', 'women_hairstyles');

    if (error) {
      console.error('❌ Error updating prompt:', error);
    } else {
      console.log('✅ Updated Butterfly Haircut prompt with more specific instructions');
      console.log('\n📝 New prompt focuses on:');
      console.log('   • Dramatic face-framing layers');
      console.log('   • Wing-like effect');
      console.log('   • Visible transformation');
      console.log('   • Specific layer placement');
      console.log('\n🎯 This should make the AI create a much more obvious change!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixButterflyPrompt();

