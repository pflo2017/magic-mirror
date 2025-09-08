/**
 * Generate AI prompts for consistent hairstyle preview images
 * Creates prompts for Midjourney, DALL-E, or other AI image generators
 */

const fs = require('fs');
const path = require('path');

// Base character for consistency across all previews
const BASE_CHARACTER = {
  female: "Professional female model, 25-30 years old, neutral friendly expression, oval face shape, medium skin tone, brown eyes, natural makeup, studio lighting, clean white background, front-facing portrait, high quality, photorealistic",
  male: "Professional male model, 25-30 years old, neutral confident expression, square jaw, medium skin tone, brown eyes, clean-shaven (unless beard style), studio lighting, clean white background, front-facing portrait, high quality, photorealistic"
};

// Hairstyle-specific prompts
const HAIRSTYLE_PROMPTS = {
  // Women's Hairstyles
  "long-layers": {
    prompt: `${BASE_CHARACTER.female}, long layered hair extending to mid-back, cascading layers with movement and volume, face-framing layers, natural brown hair color, salon-quality styling`,
    category: "women_hairstyles"
  },
  "beach-waves": {
    prompt: `${BASE_CHARACTER.female}, medium-length beach waves, tousled natural waves, effortless styling, light brown hair with natural highlights, relaxed texture`,
    category: "women_hairstyles"
  },
  "classic-bob": {
    prompt: `${BASE_CHARACTER.female}, classic bob haircut at chin length, blunt cut with clean geometric lines, straight hair, sleek styling, dark brown hair color`,
    category: "women_hairstyles"
  },
  "pixie-cut": {
    prompt: `${BASE_CHARACTER.female}, modern pixie cut, very short textured hair, longer on top with layers, edgy yet feminine styling, light brown hair`,
    category: "women_hairstyles"
  },
  "long-bob": {
    prompt: `${BASE_CHARACTER.female}, long bob (lob) at collarbone length, sleek straight cut with subtle layers, modern styling, medium brown hair`,
    category: "women_hairstyles"
  },
  "modern-shag": {
    prompt: `${BASE_CHARACTER.female}, modern shag haircut, heavily layered with choppy texture, curtain bangs, rock-inspired edgy styling, medium brown hair`,
    category: "women_hairstyles"
  },
  "curtain-bangs": {
    prompt: `${BASE_CHARACTER.female}, curtain bangs parting in center, face-framing wispy bangs, medium-length hair, soft natural styling, brown hair`,
    category: "women_hairstyles"
  },
  "blunt-cut": {
    prompt: `${BASE_CHARACTER.female}, blunt cut hair, sharp straight-across ends, no layers, geometric precision, shoulder-length, dark brown hair`,
    category: "women_hairstyles"
  },

  // Women's Hair Colors (using long layers as base style)
  "platinum-blonde": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, platinum blonde color, very light almost white blonde, cool undertones, professional color treatment`,
    category: "women_colors"
  },
  "auburn-red": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, auburn red hair color, rich reddish-brown with copper highlights, warm undertones`,
    category: "women_colors"
  },
  "chocolate-brown": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, deep chocolate brown hair color, rich warm brown, natural healthy shine`,
    category: "women_colors"
  },
  "honey-blonde": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, honey blonde hair color, warm golden blonde with caramel undertones, natural highlights`,
    category: "women_colors"
  },
  "balayage-highlights": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, balayage highlights, hand-painted blonde highlights on brown base, natural sun-kissed effect`,
    category: "women_colors"
  },
  "ombre-effect": {
    prompt: `${BASE_CHARACTER.female}, long layered hair, ombre hair color, dark brown roots transitioning to blonde ends, smooth gradient`,
    category: "women_colors"
  },

  // Men's Hairstyles
  "classic-fade": {
    prompt: `${BASE_CHARACTER.male}, classic fade haircut, short sides fading to longer top, professional styling, dark brown hair, clean barbershop cut`,
    category: "men_hairstyles"
  },
  "pompadour": {
    prompt: `${BASE_CHARACTER.male}, pompadour hairstyle, swept back hair with volume and height, shorter sides, vintage-modern styling, dark brown hair`,
    category: "men_hairstyles"
  },
  "textured-crop": {
    prompt: `${BASE_CHARACTER.male}, textured crop haircut, short sides with textured top and slight fringe, modern styling, medium brown hair`,
    category: "men_hairstyles"
  },
  "buzz-cut": {
    prompt: `${BASE_CHARACTER.male}, buzz cut hairstyle, very short hair clipped evenly all over, military-style cut, dark brown hair`,
    category: "men_hairstyles"
  },
  "quiff": {
    prompt: `${BASE_CHARACTER.male}, quiff hairstyle, upswept front with volume, shorter sides, styled with texture, medium brown hair`,
    category: "men_hairstyles"
  },
  "side-part": {
    prompt: `${BASE_CHARACTER.male}, side part hairstyle, neat professional cut with defined side part, combed styling, dark brown hair`,
    category: "men_hairstyles"
  },

  // Men's Beard Styles (using classic fade as base)
  "full-beard": {
    prompt: `${BASE_CHARACTER.male.replace('clean-shaven (unless beard style)', 'full well-groomed beard')}, classic fade haircut, full beard that complements face shape, professional grooming`,
    category: "men_beards"
  },
  "goatee": {
    prompt: `${BASE_CHARACTER.male.replace('clean-shaven (unless beard style)', 'neat goatee')}, classic fade haircut, goatee with mustache, precise grooming`,
    category: "men_beards"
  },
  "stubble": {
    prompt: `${BASE_CHARACTER.male.replace('clean-shaven (unless beard style)', 'light stubble')}, classic fade haircut, light stubble across jaw and chin, natural growth`,
    category: "men_beards"
  }
};

function generatePreviewPrompts() {
  console.log('🎨 Generating AI prompts for consistent preview images...');

  // Create directories
  const outputDir = path.join(__dirname, '../public/hairstyle-previews');
  const promptsDir = path.join(__dirname, '../database/ai-prompts');
  
  [outputDir, promptsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Generate individual prompt files
  const allPrompts = {};
  const categories = {};

  Object.entries(HAIRSTYLE_PROMPTS).forEach(([filename, data]) => {
    const { prompt, category } = data;
    
    // Save individual prompt file
    fs.writeFileSync(
      path.join(promptsDir, `${filename}.txt`),
      prompt
    );

    // Organize by category
    if (!categories[category]) {
      categories[category] = {};
    }
    categories[category][filename] = prompt;
    allPrompts[filename] = { prompt, category };
  });

  // Save master prompt file
  const masterPrompts = {
    generation_settings: {
      aspect_ratio: "3:4 (portrait)",
      resolution: "1024x1365 or higher",
      quality: "high/photorealistic",
      style: "professional photography",
      lighting: "studio lighting",
      background: "clean white/neutral"
    },
    consistency_guidelines: {
      character: "Use the same model face across all images in each gender category",
      lighting: "Maintain consistent studio lighting setup",
      background: "Keep background clean and neutral",
      angle: "Front-facing portrait with slight angle for dimension",
      expression: "Neutral, professional, friendly expression"
    },
    ai_tool_settings: {
      midjourney: "--ar 3:4 --style raw --quality 2",
      dalle3: "Square format, photorealistic style, high quality",
      stable_diffusion: "Portrait mode, photorealistic, high resolution",
      leonardo_ai: "PhotoReal model, portrait orientation"
    },
    base_characters: BASE_CHARACTER,
    prompts_by_category: categories,
    all_prompts: allPrompts
  };

  fs.writeFileSync(
    path.join(promptsDir, 'master-prompts.json'),
    JSON.stringify(masterPrompts, null, 2)
  );

  // Generate batch generation scripts
  const batchScripts = {
    midjourney: Object.entries(HAIRSTYLE_PROMPTS).map(([filename, data]) => 
      `/imagine ${data.prompt} --ar 3:4 --style raw --quality 2`
    ).join('\n\n'),
    
    dalle3: Object.entries(HAIRSTYLE_PROMPTS).map(([filename, data]) => 
      `// ${filename}\n${data.prompt}`
    ).join('\n\n'),
  };

  Object.entries(batchScripts).forEach(([tool, script]) => {
    fs.writeFileSync(
      path.join(promptsDir, `batch-${tool}.txt`),
      script
    );
  });

  console.log(`✅ Generated ${Object.keys(HAIRSTYLE_PROMPTS).length} individual prompts`);
  console.log(`✅ Created master prompts file`);
  console.log(`✅ Generated batch scripts for AI tools`);

  // Create placeholder images directory structure
  const placeholderHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Hairstyle Preview Images</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .category { margin-bottom: 40px; }
        .style-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .style-item { border: 1px solid #ddd; padding: 10px; text-align: center; }
        .placeholder { width: 100%; height: 250px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666; }
    </style>
</head>
<body>
    <h1>Hairstyle Preview Images</h1>
    <p>Generate images using the AI prompts and save them with the corresponding filenames.</p>
    
    ${Object.entries(categories).map(([category, styles]) => `
    <div class="category">
        <h2>${category.replace('_', ' ').toUpperCase()}</h2>
        <div class="style-grid">
            ${Object.keys(styles).map(filename => `
            <div class="style-item">
                <div class="placeholder">
                    ${filename}.jpg<br>
                    <small>Generate and save here</small>
                </div>
                <h4>${filename.replace('-', ' ')}</h4>
            </div>
            `).join('')}
        </div>
    </div>
    `).join('')}
</body>
</html>`;

  fs.writeFileSync(
    path.join(outputDir, 'preview-template.html'),
    placeholderHTML
  );

  console.log('\n🎉 Preview generation setup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Use the prompts in /database/ai-prompts/ with your preferred AI tool');
  console.log('2. Generate images and save them to /public/hairstyle-previews/');
  console.log('3. Run the enhance-existing-styles.js script to update the database');
  console.log('4. View preview template at /public/hairstyle-previews/preview-template.html');

  return {
    totalPrompts: Object.keys(HAIRSTYLE_PROMPTS).length,
    categories: Object.keys(categories),
    outputDir,
    promptsDir
  };
}

// Run the generator
generatePreviewPrompts();
