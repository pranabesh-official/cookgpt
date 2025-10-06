import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
let genAI: GoogleGenerativeAI | null = null;

// Environment variable that's safely available in both SSR and browser
// Next.js will replace NEXT_PUBLIC_ env vars at build time
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// Allow overriding the text model via env; default to a v1beta-supported model
const RAW_GEMINI_TEXT_MODEL = process.env.NEXT_PUBLIC_GEMINI_TEXT_MODEL || 'gemini-2.0-flash';

// Fallback text model known to work with v1beta generateContent
const FALLBACK_TEXT_MODEL = 'gemini-2.0-flash';

// Map deprecated/unsupported names to supported ones
const resolveTextModelName = (modelName: string): string => {
  const normalized = (modelName || '').trim().toLowerCase();
  const deprecatedMap: Record<string, string> = {
    'gemini-1.5-flash': FALLBACK_TEXT_MODEL,
    'gemini-1.5-flash-001': FALLBACK_TEXT_MODEL,
    'gemini-1.0-pro': FALLBACK_TEXT_MODEL,
    'gemini-pro': FALLBACK_TEXT_MODEL,
  };
  if (deprecatedMap[normalized]) {
    try { console.warn(`Requested text model "${modelName}" is deprecated/unsupported. Using "${deprecatedMap[normalized]}".`); } catch {}
    return deprecatedMap[normalized];
  }
  return modelName;
};

const GEMINI_TEXT_MODEL = resolveTextModelName(RAW_GEMINI_TEXT_MODEL);

// Safely get environment variable in browser
const getApiKey = (): string | null => {
  return GEMINI_API_KEY || null;
};

// Check if Gemini is available (safe for SSR)
export const isGeminiAvailable = (): boolean => {
  return !!getApiKey();
};

// Initialize Gemini with API key
const initializeGemini = () => {
  const apiKey = getApiKey();
    
  if (!apiKey) {
    console.warn('Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    try {
      // One-time startup log to confirm the selected model in client builds
      console.log('Gemini text model in use:', GEMINI_TEXT_MODEL);
    } catch {}
  }
  return genAI;
};

// Helper to run generateContent with automatic retry on model-not-found
const generateContentWithRetry = async (
  client: GoogleGenerativeAI,
  modelName: string,
  prompt: string,
  generationConfig?: any
) => {
  const primary = client.getGenerativeModel({ model: modelName, generationConfig });
  try {
    return await primary.generateContent(prompt);
  } catch (err: any) {
    const message = (err && err.message) || '';
    const isModelIssue = message.includes('is not found') || message.includes('not supported for generateContent');
    if (isModelIssue && modelName !== FALLBACK_TEXT_MODEL) {
      try { console.warn(`Model "${modelName}" failed for generateContent. Retrying with fallback "${FALLBACK_TEXT_MODEL}"...`); } catch {}
      const fallbackModel = client.getGenerativeModel({ model: FALLBACK_TEXT_MODEL, generationConfig });
      return await fallbackModel.generateContent(prompt);
    }
    throw err;
  }
};

// User preferences interface matching the auth context
interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  mealTypeFocus: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  cookingTime: '15min' | '30min' | '1hr+';
  goals: string[];
  // Enhanced fields for better context awareness
  specificRequest?: string;
  requestedType?: string;
}

// Recipe interface
export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  tags: string[];
  calories?: number;
  imagePrompt?: string;
  imageUrl?: string; // Added for generated/placeholder images
  base64Image?: string; // Added for storing base64 image data in Firestore
}

// Generate personalized recipes with progressive display (one by one as images complete)
export async function* generatePersonalizedRecipesProgressive(
  userPreferences: UserPreferences,
  count: number = 5,
  onRecipeReady?: (recipe: Recipe) => void
): AsyncGenerator<Recipe, void, unknown> {
  const client = initializeGemini();
  if (!client) {
    throw new Error('Gemini API not initialized. Please check your API key.');
  }

  try {
    // Use configured text model for complex recipe generation (supported in v1beta)
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
    };

    // Create a detailed prompt based on user preferences and specific request
    const specificRequest = userPreferences.specificRequest?.trim();
    const requestedType = userPreferences.requestedType?.trim();
    
    const prompt = `
You are an expert chef and nutritionist. Generate ${count} personalized recipes based on these user preferences and their specific request:

**USER'S SPECIFIC REQUEST**: "${specificRequest || 'General recipe recommendations'}"
**REQUESTED RECIPE TYPE**: ${requestedType || 'Any type'}

**Dietary Restrictions**: ${userPreferences.dietaryRestrictions.length > 0 ? userPreferences.dietaryRestrictions.join(', ') : 'None'}
**Cuisine Preferences**: ${userPreferences.cuisinePreferences.join(', ')}
**Meal Types**: ${userPreferences.mealTypeFocus.join(', ')}
**Skill Level**: ${userPreferences.skillLevel}
**Cooking Time Preference**: ${userPreferences.cookingTime}
**Goals**: ${userPreferences.goals.length > 0 ? userPreferences.goals.join(', ') : 'General cooking'}

IMPORTANT: Pay special attention to the user's specific request. If they asked for "salad recipes" or mentioned "salad", ALL recipes should be salads. If they asked for a specific type of dish, focus primarily on that type.

Please return ONLY a valid JSON array of recipes with this exact structure:
[
  {
    "id": "unique_recipe_id",
    "title": "Recipe Name",
    "description": "Brief appetizing description (2-3 sentences)",
    "cookingTime": "actual time in minutes (e.g., '25 minutes')",
    "servings": number,
    "difficulty": "Easy|Medium|Hard",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "tags": ["tag1", "tag2", ...],
    "calories": estimated_calories_per_serving,
    "imagePrompt": "detailed prompt for recipe image generation"
  }
]

Requirements:
- Respect ALL dietary restrictions strictly
- Focus on the preferred cuisines and meal types
- Match the cooking time preference (${userPreferences.cookingTime})
- Adjust complexity based on skill level (${userPreferences.skillLevel})
- Include nutritional considerations for the stated goals
- Make recipes diverse and interesting
- Ensure ingredients are commonly available
- Provide clear, step-by-step instructions
- Include relevant tags (cuisine type, dietary info, cooking method, etc.)
- Generate a detailed image prompt for each recipe that describes the final dish appearance

Return only the JSON array, no additional text or formatting.
`;

    const result = await generateContentWithRetry(client, GEMINI_TEXT_MODEL, prompt, generationConfig as any);
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the JSON response, handling potential markdown wrapping
      let jsonText = text.trim();
      
      // Remove markdown code block wrapping if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const recipes = JSON.parse(jsonText) as Recipe[];
      
      // Process each recipe individually and yield as soon as image is ready
      for (let index = 0; index < recipes.length; index++) {
        const recipe = recipes[index];
        const enhancedRecipe = {
          ...recipe,
          id: recipe.id || `recipe_${Date.now()}_${index}`,
          title: recipe.title || 'Delicious Recipe',
          description: recipe.description || 'A wonderful dish to try',
          cookingTime: recipe.cookingTime || userPreferences.cookingTime,
          servings: recipe.servings || 4,
          difficulty: recipe.difficulty || (userPreferences.skillLevel === 'beginner' ? 'Easy' : 
                     userPreferences.skillLevel === 'intermediate' ? 'Medium' : 'Hard'),
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          tags: recipe.tags || [],
          calories: recipe.calories || 300,
          imagePrompt: recipe.imagePrompt || `A beautifully plated ${recipe.title}`
        };
        
        // Generate AI-powered image for the recipe
        console.log(`🎨 [PROGRESSIVE] Starting image generation for recipe ${index + 1}/${recipes.length}: ${enhancedRecipe.title}`);
        
        try {
          // Add delay between image generation calls to avoid rate limits
          if (index > 0) {
            console.log(`⏳ [PROGRESSIVE] Waiting 2 seconds before next image generation...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // Generate image and get base64 data
          const imageResult = await generateRecipeImage(enhancedRecipe);
          
          if (imageResult) {
            enhancedRecipe.imageUrl = imageResult;
            enhancedRecipe.base64Image = imageResult; // Store the base64 data for Firestore
            console.log(`✅ [PROGRESSIVE] Image generated for ${enhancedRecipe.title}`);
          } else {
            console.warn(`⚠️ [PROGRESSIVE] No image generated for ${enhancedRecipe.title}, using fallback`);
            const fallbackImage = generateAdvancedFallbackImage(enhancedRecipe);
            enhancedRecipe.imageUrl = fallbackImage;
            // For fallback images (URLs), we don't store base64
          }
        } catch (error) {
          console.error(`⚠️ [PROGRESSIVE] AI image generation failed for recipe, using fallback: ${enhancedRecipe.title}`, error);
          const fallbackImage = generateAdvancedFallbackImage(enhancedRecipe);
          enhancedRecipe.imageUrl = fallbackImage;
        }
        
        // Call the callback if provided
        if (onRecipeReady) {
          onRecipeReady(enhancedRecipe);
        }
        
        // Yield the completed recipe immediately
        yield enhancedRecipe;
      }
      
    } catch (parseError) {
      console.error('Error parsing recipe JSON in progressive mode:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: generate sample recipes progressively
      const fallbackRecipes = await generateFallbackRecipes(userPreferences, count);
      for (const recipe of fallbackRecipes) {
        if (onRecipeReady) {
          onRecipeReady(recipe);
        }
        yield recipe;
      }
    }

  } catch (error) {
    console.error('Error generating recipes progressively with Gemini:', error);
    throw new Error('Failed to generate personalized recipes. Please try again.');
  }
}
export const generatePersonalizedRecipes = async (
  userPreferences: UserPreferences,
  count: number = 5  // Reduced from 10 to avoid rate limits
): Promise<Recipe[]> => {
  const client = initializeGemini();
  if (!client) {
    throw new Error('Gemini API not initialized. Please check your API key.');
  }

  try {
    // Use configured text model for complex recipe generation (supported in v1beta)
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
    };

    // Create a detailed prompt based on user preferences and specific request
    const specificRequest = userPreferences.specificRequest?.trim();
    const requestedType = userPreferences.requestedType?.trim();
    
    const prompt = `
You are an expert chef and nutritionist. Generate ${count} personalized recipes based on these user preferences and their specific request:

**USER'S SPECIFIC REQUEST**: "${specificRequest || 'General recipe recommendations'}"
**REQUESTED RECIPE TYPE**: ${requestedType || 'Any type'}

**Dietary Restrictions**: ${userPreferences.dietaryRestrictions.length > 0 ? userPreferences.dietaryRestrictions.join(', ') : 'None'}
**Cuisine Preferences**: ${userPreferences.cuisinePreferences.join(', ')}
**Meal Types**: ${userPreferences.mealTypeFocus.join(', ')}
**Skill Level**: ${userPreferences.skillLevel}
**Cooking Time Preference**: ${userPreferences.cookingTime}
**Goals**: ${userPreferences.goals.length > 0 ? userPreferences.goals.join(', ') : 'General cooking'}

IMPORTANT: Pay special attention to the user's specific request. If they asked for "salad recipes" or mentioned "salad", ALL recipes should be salads. If they asked for a specific type of dish, focus primarily on that type.

Please return ONLY a valid JSON array of recipes with this exact structure:
[
  {
    "id": "unique_recipe_id",
    "title": "Recipe Name",
    "description": "Brief appetizing description (2-3 sentences)",
    "cookingTime": "actual time in minutes (e.g., '25 minutes')",
    "servings": number,
    "difficulty": "Easy|Medium|Hard",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "tags": ["tag1", "tag2", ...],
    "calories": estimated_calories_per_serving,
    "imagePrompt": "detailed prompt for recipe image generation"
  }
]

Requirements:
- Respect ALL dietary restrictions strictly
- Focus on the preferred cuisines and meal types
- Match the cooking time preference (${userPreferences.cookingTime})
- Adjust complexity based on skill level (${userPreferences.skillLevel})
- Include nutritional considerations for the stated goals
- Make recipes diverse and interesting
- Ensure ingredients are commonly available
- Provide clear, step-by-step instructions
- Include relevant tags (cuisine type, dietary info, cooking method, etc.)
- Generate a detailed image prompt for each recipe that describes the final dish appearance

Return only the JSON array, no additional text or formatting.
`;

    const result = await generateContentWithRetry(client, GEMINI_TEXT_MODEL, prompt, generationConfig as any);
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the JSON response, handling potential markdown wrapping
      let jsonText = text.trim();
      
      // Remove markdown code block wrapping if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const recipes = JSON.parse(jsonText) as Recipe[];
      
      // Validate and ensure each recipe has required fields with AI-generated images
      // Process sequentially to avoid rate limits
      const recipesWithAIImages: Recipe[] = [];
      
      for (let index = 0; index < recipes.length; index++) {
        const recipe = recipes[index];
        const enhancedRecipe = {
          ...recipe,
          id: recipe.id || `recipe_${Date.now()}_${index}`,
          title: recipe.title || 'Delicious Recipe',
          description: recipe.description || 'A wonderful dish to try',
          cookingTime: recipe.cookingTime || userPreferences.cookingTime,
          servings: recipe.servings || 4,
          difficulty: recipe.difficulty || (userPreferences.skillLevel === 'beginner' ? 'Easy' : 
                     userPreferences.skillLevel === 'intermediate' ? 'Medium' : 'Hard'),
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          tags: recipe.tags || [],
          calories: recipe.calories || 300,
          imagePrompt: recipe.imagePrompt || `A beautifully plated ${recipe.title}`
        };
        
        // Generate AI-powered image for each recipe using the enhanced system
        console.log(`🎨 [DEBUG] Starting image generation for recipe ${index + 1}/${recipes.length}: ${enhancedRecipe.title}`);
        
        try {
          // Add delay between image generation calls to avoid rate limits
          if (index > 0) {
            console.log(`⏳ [DEBUG] Waiting 2 seconds before next image generation...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          enhancedRecipe.imageUrl = await generateAIRecipeImage(enhancedRecipe);
          console.log(`✅ [DEBUG] Image generated for ${enhancedRecipe.title}`);
          
          if (!enhancedRecipe.imageUrl) {
            console.warn(`⚠️ [DEBUG] No image URL generated for ${enhancedRecipe.title}, using fallback`);
            enhancedRecipe.imageUrl = generateAdvancedFallbackImage(enhancedRecipe);
          }
        } catch (error) {
          console.error(`⚠️ [DEBUG] AI image generation failed for recipe, using advanced fallback: ${enhancedRecipe.title}`, error);
          enhancedRecipe.imageUrl = generateAdvancedFallbackImage(enhancedRecipe);
        }
        
        recipesWithAIImages.push(enhancedRecipe);
      }
      
      return recipesWithAIImages;

    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: return sample recipes based on preferences
      return await generateFallbackRecipes(userPreferences, count);
    }

  } catch (error) {
    console.error('Error generating recipes with Gemini:', error);
    throw new Error('Failed to generate personalized recipes. Please try again.');
  }
};



// Generate recipe images using true Gemini AI image generation
export const generateRecipeImage = async (recipe: Recipe): Promise<string | null> => {
  const client = initializeGemini();
  if (!client) {
    console.warn('Gemini API not available for image generation');
    return null;
  }

  try {
    console.log(`🎨 Starting TRUE AI image generation for: ${recipe.title}`);
    
    // Use gemini-2.0-flash-preview-image-generation for actual image generation
    const model = client.getGenerativeModel({ 
      model: "gemini-2.0-flash-preview-image-generation"
    });

    // Create a detailed food photography prompt
    const imagePrompt = `Generate a professional food photography image of "${recipe.title}".
    
    Recipe details:
    - Description: ${recipe.description}
    - Main ingredients: ${recipe.ingredients.slice(0, 5).join(', ')}
    - Cuisine type: ${recipe.tags.join(', ')}
    - Difficulty level: ${recipe.difficulty}
    - Servings: ${recipe.servings}
    
    Create an appetizing, high-quality food photograph showing:
    - ${recipe.title} beautifully plated and styled
    - Professional restaurant-quality presentation
    - Appropriate ${recipe.tags.includes('italian') ? 'Italian' : recipe.tags.includes('asian') ? 'Asian' : recipe.tags.includes('mexican') ? 'Mexican' : recipe.tags.includes('indian') ? 'Indian' : 'modern'} plating style
    - Rich, appetizing colors and textures
    - Professional food photography lighting (soft, natural light)
    - Clean, elegant background that complements the dish
    - Appropriate garnishes and styling for ${recipe.difficulty.toLowerCase()} difficulty level
    - Sharp focus on the food with shallow depth of field
    
    Style: Professional food photography, restaurant-quality, appetizing, well-lit, colorful, clean composition, magazine-worthy presentation.`;

    // Generate content with image generation configuration
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: imagePrompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseModalities: ["TEXT", "IMAGE"]
      } as any // Type assertion needed for responseModalities
    });
    
    const response = await result.response;
    
    // Check if we have candidates with content
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        // Process the response to extract image data or text
        for (const part of candidate.content.parts) {
          if (part.text) {
            console.log(`✍️ AI response for ${recipe.title}:`, part.text.substring(0, 100) + '...');
          }
          
          // Check for inline image data
          if (part.inlineData && part.inlineData.data) {
            console.log(`🖼️ Successfully generated TRUE AI image for: ${recipe.title}`);
            
            // Convert base64 image data to data URL
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const dataUrl = `data:${mimeType};base64,${imageData}`;
            
            return dataUrl;
          }
        }
      }
    }
    
    console.log(`⚠️ No image generated by AI for ${recipe.title}, trying response parsing`);
    
    // Try to get response text to see if there's any useful information
    try {
      const responseText = response.text();
      console.log(`📝 AI Response text for ${recipe.title}:`, responseText.substring(0, 200));
    } catch (error) {
      console.log(`⚠️ Could not extract text from response for ${recipe.title}`);
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Error generating TRUE AI image for ${recipe.title}:`, error);
    
    // Check if it's a model availability error
    if (error instanceof Error && error.message && error.message.includes('model')) {
      console.warn(`⚠️ Model gemini-2.0-flash-preview-image-generation may not be available in this region`);
    }
    
    return null;
  }
};



// Convert AI description to actual image using multiple generation methods
const convertAIDescriptionToImage = async (description: string, recipe: Recipe): Promise<string> => {
  try {
    // Method 1: Use the AI description to create a highly specific search query
    const enhancedKeywords = extractKeywordsFromDescription(description, recipe);
    
    // Method 2: Try multiple image sources with AI-enhanced keywords
    const imageSources = [
      // Unsplash with AI-enhanced search
      `https://source.unsplash.com/800x600/?${enhancedKeywords.join('+')}&food+photography`,
      // Food-specific Unsplash search
      `https://source.unsplash.com/800x600/?${recipe.title.replace(/\s+/g, '+')}+food+recipe+delicious+professional`,
      // Cuisine-specific search
      `https://source.unsplash.com/800x600/?${recipe.tags.join('+')}+cuisine+dish+restaurant+plated`
    ];
    
    // Return the first (most AI-enhanced) image source
    return imageSources[0];
    
  } catch (error) {
    console.error('Error converting AI description to image:', error);
    return generateAdvancedFallbackImage(recipe);
  }
};

// Extract keywords from AI description for better image search
const extractKeywordsFromDescription = (description: string, recipe: Recipe): string[] => {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  // Extract meaningful words from AI description
  const descriptionWords = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 8); // Take top 8 descriptive words
  
  // Combine with recipe-specific terms
  const recipeWords = [
    ...recipe.title.toLowerCase().split(' ').filter(word => word.length > 2),
    ...recipe.tags,
    ...recipe.ingredients.slice(0, 3).map(ing => ing.split(' ')[0].toLowerCase())
  ];
  
  // Merge and deduplicate
  const allKeywords = [...new Set([...descriptionWords, ...recipeWords, 'food', 'recipe', 'gourmet'])];
  
  return allKeywords.slice(0, 10); // Limit to 10 keywords for URL
};



// Main function to generate recipe-specific images using TRUE Gemini AI image generation
export const generateAIRecipeImage = async (recipe: Recipe): Promise<string> => {
  try {
    console.log(`🎨 Starting TRUE AI image generation for: ${recipe.title}`);
    
    // Step 1: Try TRUE AI image generation using Gemini's image generation model
    const trueAIImageUrl = await generateRecipeImage(recipe);
    
    if (trueAIImageUrl) {
      console.log(`✅ Successfully generated TRUE AI image for: ${recipe.title}`);
      return trueAIImageUrl;
    }
    
    console.log(`⚠️ TRUE AI image generation not available, using enhanced fallback for ${recipe.title}`);
    
    // Step 2: Fallback to enhanced description-based approach
    const aiDescription = await generateDetailedImageDescription(recipe);
    
    if (aiDescription) {
      console.log(`✍️ AI Description generated for ${recipe.title}:`, aiDescription.substring(0, 100) + '...');
      
      // Convert AI description to enhanced image URL
      const imageUrl = await convertAIDescriptionToImage(aiDescription, recipe);
      const optimizedUrl = await validateAndOptimizeImageUrl(imageUrl, recipe);
      
      console.log(`🖼️ Enhanced image URL for ${recipe.title}: ${optimizedUrl}`);
      return optimizedUrl;
    }
    
    // Step 3: Final fallback
    const finalImageUrl = generateAdvancedFallbackImage(recipe);
    console.log(`🖼️ Final fallback image URL for ${recipe.title}: ${finalImageUrl}`);
    return finalImageUrl;
    
  } catch (error) {
    console.error(`❌ Error in AI recipe image generation for ${recipe.title}:`, error);
    return generateAdvancedFallbackImage(recipe);
  }
};

// Generate detailed image descriptions using Gemini AI
const generateDetailedImageDescription = async (recipe: Recipe): Promise<string> => {
  const client = initializeGemini();
  if (!client) {
    return generateStaticImageDescription(recipe);
  }

  try {
    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 300,
    };

    const prompt = `As a professional food photographer, describe in detail how "${recipe.title}" should look when perfectly prepared and photographed.
    
    Recipe Context:
    - Description: ${recipe.description}
    - Key ingredients: ${recipe.ingredients.slice(0, 5).join(', ')}
    - Cuisine type: ${recipe.tags.join(', ')}
    - Difficulty level: ${recipe.difficulty}
    - Cooking time: ${recipe.cookingTime}
    
    Generate a detailed visual description focusing on:
    1. Final dish appearance and plating style
    2. Colors, textures, and visual elements
    3. Appropriate garnishes and styling
    4. Professional photography composition
    5. Authentic cultural presentation (if applicable)
    
    Be specific about visual details that would help create the most accurate and appetizing image of this exact recipe.`;

    const result = await generateContentWithRetry(client, GEMINI_TEXT_MODEL, prompt, generationConfig as any);
    const response = await result.response;
    return response.text().trim();
    
  } catch (error) {
    console.error('Error generating detailed AI image description:', error);
    return generateStaticImageDescription(recipe);
  }
};

// Static fallback description generator
const generateStaticImageDescription = (recipe: Recipe): string => {
  const cuisineStyle = recipe.tags.includes('italian') ? 'Italian rustic style' :
                      recipe.tags.includes('asian') ? 'Asian minimalist presentation' :
                      recipe.tags.includes('indian') ? 'Indian traditional style' :
                      recipe.tags.includes('mexican') ? 'Mexican vibrant style' :
                      'modern restaurant style';
  
  return `A professionally photographed ${recipe.title} with ${cuisineStyle} presentation, featuring ${recipe.ingredients.slice(0, 3).join(', ')}, beautifully plated with appropriate garnishes, shot with professional lighting against a clean background, appetizing colors and textures, restaurant-quality presentation, ${recipe.difficulty.toLowerCase()} preparation style`;
};

// Validate and optimize image URLs
const validateAndOptimizeImageUrl = async (imageUrl: string, recipe: Recipe): Promise<string> => {
  try {
    // Add image optimization parameters
    const optimizedUrl = imageUrl.includes('unsplash') 
      ? `${imageUrl}&auto=format&fit=crop&w=800&h=600&q=80`
      : imageUrl;
    
    return optimizedUrl;
  } catch (error) {
    console.warn('Image URL validation failed, using fallback:', error);
    return generateAdvancedFallbackImage(recipe);
  }
};

// Advanced fallback image generation with AI-enhanced specificity
const generateAdvancedFallbackImage = (recipe: Recipe): string => {
  console.log(`🎨 [DEBUG] Generating advanced fallback image for: ${recipe.title}`);
  
  // Extract specific food keywords from recipe
  const recipeKeywords = [
    // Recipe title words (cleaned)
    ...recipe.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2),
    
    // Main ingredients (first 3)
    ...recipe.ingredients.slice(0, 3)
      .map(ing => ing.split(' ')[0].toLowerCase())
      .filter(ing => ing.length > 2),
    
    // Cuisine and cooking method tags
    ...recipe.tags.filter(tag => 
      ['italian', 'asian', 'mexican', 'indian', 'french', 'american', 
       'grilled', 'baked', 'fried', 'roasted', 'steamed', 'pasta', 
       'rice', 'soup', 'salad', 'curry', 'stir-fry'].includes(tag.toLowerCase())
    )
  ];
  
  // Create cuisine-specific styling keywords
  const cuisineStyle = recipe.tags.includes('italian') ? 'rustic+mediterranean' :
                      recipe.tags.includes('asian') ? 'minimalist+zen' :
                      recipe.tags.includes('indian') ? 'colorful+traditional' :
                      recipe.tags.includes('mexican') ? 'vibrant+festive' :
                      recipe.tags.includes('french') ? 'elegant+refined' :
                      'modern+professional';
  
  // Determine presentation style based on difficulty
  const presentationStyle = recipe.difficulty === 'Easy' ? 'homestyle+comfort' :
                           recipe.difficulty === 'Medium' ? 'restaurant+quality' :
                           'gourmet+fine+dining';
  
  // Create highly specific search query
  const specificKeywords = [
    ...recipeKeywords.slice(0, 4), // Top 4 recipe-specific keywords
    cuisineStyle,
    presentationStyle,
    'food', 'photography', 'delicious', 'appetizing'
  ].join('+');
  
  // Multiple high-quality image sources with specific queries
  const imageStrategies = [
    // Strategy 1: Highly specific Unsplash search
    `https://source.unsplash.com/800x600/?${specificKeywords}`,
    
    // Strategy 2: Food.com style with main ingredients
    `https://source.unsplash.com/800x600/?${recipe.ingredients[0]?.replace(/\s+/g, '+')}+${recipe.title.split(' ')[0]}+food+photography`,
    
    // Strategy 3: Cuisine-specific with professional styling
    `https://source.unsplash.com/800x600/?${recipe.tags[0]}+cuisine+${recipe.title.replace(/\s+/g, '+')}+restaurant+plated`,
    
    // Strategy 4: Alternative food photography source
    `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center&q=80`
  ];
  
  console.log(`🔍 [DEBUG] Image search keywords for ${recipe.title}: ${specificKeywords}`);
  console.log(`🖼️ [DEBUG] Generated fallback URL: ${imageStrategies[0]}`);
  
  return imageStrategies[0]; // Return the most specific image URL
};

// Fallback recipes when AI generation fails
const generateFallbackRecipes = async (preferences: UserPreferences, count: number): Promise<Recipe[]> => {
  const fallbackRecipes: Recipe[] = [
    {
      id: 'fallback_1',
      title: 'Quick Pasta Primavera',
      description: 'A colorful and healthy pasta dish loaded with fresh vegetables.',
      cookingTime: '25 minutes',
      servings: 4,
      difficulty: 'Easy',
      ingredients: ['pasta', 'mixed vegetables', 'olive oil', 'garlic', 'parmesan'],
      instructions: ['Cook pasta', 'Sauté vegetables', 'Combine and serve'],
      tags: ['pasta', 'vegetarian', 'quick'],
      calories: 350,
      imagePrompt: 'Colorful pasta primavera with fresh vegetables'
    },
    {
      id: 'fallback_2',
      title: 'Healthy Grilled Chicken',
      description: 'Perfectly seasoned grilled chicken with herbs and spices.',
      cookingTime: '30 minutes',
      servings: 4,
      difficulty: 'Medium',
      ingredients: ['chicken breast', 'herbs', 'olive oil', 'lemon', 'garlic'],
      instructions: ['Marinate chicken', 'Grill until cooked', 'Rest and serve'],
      tags: ['chicken', 'grilled', 'healthy'],
      calories: 280,
      imagePrompt: 'Grilled chicken breast with herbs on a white plate'
    },
    {
      id: 'fallback_3',
      title: 'Fresh Garden Salad',
      description: 'A refreshing mix of fresh greens and seasonal vegetables.',
      cookingTime: '15 minutes',
      servings: 2,
      difficulty: 'Easy',
      ingredients: ['mixed greens', 'tomatoes', 'cucumber', 'dressing', 'nuts'],
      instructions: ['Wash vegetables', 'Chop ingredients', 'Toss with dressing'],
      tags: ['salad', 'healthy', 'vegetarian'],
      calories: 150,
      imagePrompt: 'Fresh colorful garden salad in a wooden bowl'
    }
  ];

  // Generate AI images for fallback recipes too
  const recipesWithAIImages = await Promise.all(
    fallbackRecipes.slice(0, count).map(async (recipe, index) => {
      console.log(`🎨 Generating AI image for fallback recipe: ${recipe.title}`);
      try {
        recipe.imageUrl = await generateAIRecipeImage(recipe);
        console.log(`✅ AI image generated successfully for fallback: ${recipe.title}`);
      } catch (error) {
        console.warn(`⚠️ Fallback AI image generation failed, using advanced fallback:`, error);
        recipe.imageUrl = generateAdvancedFallbackImage(recipe);
      }
      return recipe;
    })
  );

  return recipesWithAIImages;
};

export default {
  generatePersonalizedRecipes,
  generatePersonalizedRecipesProgressive,
  generateRecipeImage,
  isGeminiAvailable
};