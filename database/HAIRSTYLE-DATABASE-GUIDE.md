# 🎨 Hairstyle Database Guide

## 📊 **Database Sources & Resources**

### **1. Professional APIs (Recommended)**
- **ModiFace API (L'Oréal)**: https://modiface.com/business/
  - 500+ professional hairstyles
  - AI-ready descriptions
  - 3D models and consistent previews
  - Used by major salons

- **Perfect Corp YouCam**: https://www.perfectcorp.com/business
  - AR hairstyle library
  - Professional salon integration
  - Technical specifications included

### **2. Free & Open Source**
- **Kaggle Datasets**: Search "hairstyles", "hair classification"
- **GitHub**: Search "hair-dataset", "hairstyle-classification"
- **Unsplash API**: Professional hair photography
- **Pexels API**: High-quality hair images

### **3. AI-Generated Consistent Previews**
Use AI tools to create consistent character previews:
- **Midjourney**: `--ar 3:4 --style raw`
- **DALL-E 3**: Square format, photorealistic
- **Stable Diffusion XL**: Portrait mode
- **Leonardo AI**: PhotoReal model

## 🏗️ **Database Structure**

### **Core Fields:**
```json
{
  "id": "unique-identifier",
  "name": "Display Name",
  "category": "women_long|women_short|women_medium|women_colors",
  "description": "User-friendly description",
  "ai_instruction": "Detailed AI prompt for transformation",
  "technical_specs": {
    "length": "measurement or description",
    "layers": "layer description",
    "face_framing": true/false,
    "volume": "low|medium|high",
    "maintenance": "low|medium|high"
  },
  "preview_image": "URL to consistent preview image",
  "tags": ["searchable", "keywords"]
}
```

## 🚀 **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
npm install @supabase/supabase-js dotenv
```

### **Step 2: Generate Preview Images**
```bash
# Generate AI prompts for consistent previews
node scripts/generate-preview-images.js

# This creates:
# - database/preview-prompts.json
# - database/individual-prompts/*.txt
# - database/reference-images.json (if Unsplash API key provided)
```

### **Step 3: Create Consistent Character Previews**
1. Use the generated prompts in your preferred AI tool
2. Maintain the same model/character across all hairstyles
3. Save images to `/public/hairstyle-previews/`
4. Update `hairstyles-database.json` with correct URLs

### **Step 4: Populate Database**
```bash
# Load hairstyles into Supabase
node scripts/populate-hairstyles.js
```

## 🎯 **AI Instruction Best Practices**

### **Effective AI Instructions:**
- **Be Specific**: "Create long layered hair extending to mid-back length"
- **Include Measurements**: "Hair length 18-24 inches"
- **Describe Layers**: "Multiple cascading layers starting from shoulder level"
- **Mention Face-Framing**: "Include face-framing layers around cheekbones"
- **Specify Texture**: "Maintain natural hair texture with soft, flowing layers"

### **Example AI Instructions:**

**Long Layers:**
```
Create long layered hair extending to mid-back length. Add multiple layers starting from shoulder level, creating cascading volume and movement. Include face-framing layers around the cheekbones. Maintain natural hair texture with soft, flowing layers.
```

**Pixie Cut:**
```
Create a very short pixie cut with hair length 1-3 inches maximum. Keep sides and back very short, add textured layers on top for movement. Create a slightly longer front section for styling versatility.
```

## 📸 **Consistent Preview Images**

### **Character Consistency Guidelines:**
- **Same Model**: Use identical facial features across all previews
- **Lighting**: Professional studio lighting, consistent shadows
- **Background**: Clean, neutral background (white/gray)
- **Angle**: Front-facing, slight angle for dimension
- **Expression**: Neutral, professional expression
- **Makeup**: Natural, consistent makeup style

### **Technical Specifications:**
- **Aspect Ratio**: 3:4 (portrait)
- **Resolution**: Minimum 512x683px
- **Format**: JPG or PNG
- **Quality**: High resolution for zoom functionality
- **File Size**: Optimized for web (under 200KB)

## 🔧 **Integration with Your App**

### **Update Frontend Categories:**
```javascript
// In your style selection component
const categories = {
  'women_long': 'Long Hairstyles',
  'women_medium': 'Medium Hairstyles', 
  'women_short': 'Short Hairstyles',
  'women_colors': 'Hair Colors'
};
```

### **Enhanced Style Display:**
```javascript
// Show technical specs in UI
{style.technical_specs && (
  <div className="style-specs">
    <span>Length: {style.technical_specs.length}</span>
    <span>Maintenance: {style.technical_specs.maintenance}</span>
    <span>Volume: {style.technical_specs.volume}</span>
  </div>
)}
```

## 📋 **Recommended Hairstyle Categories**

### **Women's Long Hairstyles:**
- Long Layers
- Straight Long Hair
- Long Waves
- Long Curls
- Long Shag
- Mermaid Hair

### **Women's Medium Hairstyles:**
- Long Bob (Lob)
- Beach Waves
- Modern Shag
- Shoulder-Length Layers
- Curtain Bangs with Layers
- Textured Bob

### **Women's Short Hairstyles:**
- Pixie Cut
- Classic Bob
- Asymmetrical Bob
- Short Shag
- Buzz Cut
- Undercut Pixie

### **Hair Colors:**
- Blonde Highlights
- Brunette Base
- Auburn Red
- Platinum Blonde
- Balayage
- Ombre

## 🎨 **AI Generation Tips**

### **For Consistent Results:**
1. **Use Same Base Prompt**: Start with identical character description
2. **Vary Only Hair**: Change only hairstyle elements
3. **Maintain Lighting**: Keep studio lighting consistent
4. **Same Background**: Use identical background across all images
5. **Batch Generation**: Generate all previews in same session

### **Quality Control:**
- Review all images for consistency
- Ensure hairstyles are clearly visible
- Check that transformations are realistic
- Verify technical accuracy of styles
- Test with different face shapes

## 📈 **Scaling Your Database**

### **Adding New Styles:**
1. Research trending hairstyles
2. Create detailed AI instructions
3. Generate consistent preview image
4. Test AI transformation quality
5. Add to database JSON
6. Run populate script

### **Seasonal Updates:**
- Add trending seasonal styles
- Update color palettes for seasons
- Include celebrity-inspired looks
- Add festival/event hairstyles

## 🔍 **Quality Assurance**

### **Testing Checklist:**
- [ ] AI instructions produce expected results
- [ ] Preview images are consistent
- [ ] Technical specs are accurate
- [ ] Categories are properly organized
- [ ] Search tags are relevant
- [ ] Mobile display looks good
- [ ] Loading performance is acceptable

This comprehensive database will give your clients clear expectations and help your AI generate accurate transformations! 🎉
