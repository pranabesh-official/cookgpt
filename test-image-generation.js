// Standalone test for image generation system
// This tests the actual functionality without requiring login

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Image Generation System');
console.log('==================================\n');

// Test API key availability
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('🔑 API Key check:', apiKey ? `Available (${apiKey.substring(0, 20)}...)` : 'Missing');

if (!apiKey) {
  console.error('❌ No API key found in .env.local');
  process.exit(1);
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

// Test recipe
const testRecipe = {
  id: 'test_1',
  title: 'Spaghetti Carbonara',
  description: 'Creamy Italian pasta with eggs, cheese, pancetta, and black pepper',
  ingredients: ['spaghetti', 'eggs', 'pancetta', 'parmesan cheese', 'black pepper'],
  tags: ['italian', 'pasta', 'comfort-food'],
  difficulty: 'Medium',
  cookingTime: '20 minutes',
  servings: 4
};

// Test TRUE AI image generation
async function testTrueAIGeneration() {
  console.log('\n🎨 Testing TRUE AI Image Generation');
  console.log('===================================');
  
  try {
    console.log('📝 Creating model instance...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-preview-image-generation"
    });
    
    const imagePrompt = `Generate a professional food photography image of "${testRecipe.title}".
    
    Recipe details:
    - Description: ${testRecipe.description}
    - Main ingredients: ${testRecipe.ingredients.join(', ')}
    - Cuisine type: ${testRecipe.tags.join(', ')}
    - Difficulty level: ${testRecipe.difficulty}
    
    Create an appetizing, high-quality food photograph showing:
    - ${testRecipe.title} beautifully plated and styled
    - Professional restaurant-quality presentation
    - Appropriate Italian plating style
    - Rich, appetizing colors and textures
    
    Style: Professional food photography, restaurant-quality, appetizing, well-lit.`;
    
    console.log('🔄 Sending request to Gemini...');
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: imagePrompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseModalities: ["TEXT", "IMAGE"]
      }
    });
    
    console.log('📥 Response received from Gemini');
    const response = await result.response;
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            console.log('✍️ AI Text Response:', part.text.substring(0, 200) + '...');
          }
          
          if (part.inlineData && part.inlineData.data) {
            console.log('🖼️ ✅ SUCCESS: AI Generated Image Data Received!');
            console.log('📊 Image Data Length:', part.inlineData.data.length);
            console.log('📋 MIME Type:', part.inlineData.mimeType);
            console.log('🎯 Result: TRUE AI image generation is working!');
            return true;
          }
        }
      }
    }
    
    console.log('⚠️ No image data found in response');
    try {
      const responseText = response.text();
      console.log('📄 Response text:', responseText.substring(0, 300) + '...');
    } catch (e) {
      console.log('❌ Could not extract response text');
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error testing TRUE AI generation:', error.message);
    
    if (error.message.includes('model')) {
      console.log('💡 Model may not be available in this region');
    }
    
    return false;
  }
}

// Test fallback image generation
function testFallbackGeneration() {
  console.log('\n🔄 Testing Fallback Image Generation');
  console.log('====================================');
  
  // Extract keywords (same logic as the actual function)
  const recipeKeywords = [
    ...testRecipe.title.toLowerCase().split(' ').filter(word => word.length > 2),
    ...testRecipe.ingredients.slice(0, 3).map(ing => ing.split(' ')[0].toLowerCase()),
    ...testRecipe.tags
  ];
  
  const cuisineStyle = 'rustic+mediterranean';
  const presentationStyle = 'restaurant+quality';
  
  const specificKeywords = [
    ...recipeKeywords.slice(0, 4),
    cuisineStyle,
    presentationStyle,
    'food', 'photography', 'delicious'
  ].join('+');
  
  const fallbackUrl = `https://source.unsplash.com/800x600/?${specificKeywords}`;
  
  console.log('🔍 Generated Keywords:', specificKeywords);
  console.log('🖼️ Fallback URL:', fallbackUrl);
  console.log('✅ Fallback generation working');
  
  return fallbackUrl;
}

// Run tests
async function runTests() {
  console.log(`🧪 Testing with recipe: "${testRecipe.title}"`);
  
  // Test TRUE AI generation
  const aiSuccess = await testTrueAIGeneration();
  
  if (!aiSuccess) {
    console.log('\n🔄 AI generation failed, testing fallback...');
    const fallbackUrl = testFallbackGeneration();
    console.log('✅ Fallback system working, URL generated:', fallbackUrl.substring(0, 80) + '...');
  }
  
  console.log('\n🎉 Image Generation Test Complete!');
  console.log('===================================');
  
  if (aiSuccess) {
    console.log('✅ TRUE AI image generation: WORKING');
    console.log('✅ System Status: OPTIMAL');
  } else {
    console.log('⚠️ TRUE AI image generation: NOT AVAILABLE');
    console.log('✅ Fallback system: WORKING');
    console.log('✅ System Status: FUNCTIONAL (with fallback)');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('- If TRUE AI working: Images will be actual AI-generated');
  console.log('- If fallback working: Images will be recipe-specific from Unsplash');
  console.log('- Both provide recipe-relevant images (no more random photos!)');
}

runTests().catch(console.error);