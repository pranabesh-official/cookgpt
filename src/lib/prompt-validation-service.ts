import { UserPreferences } from './auth-context';

export interface PromptValidationResult {
  isValid: boolean;
  conflictType?: 'dietary' | 'cuisine' | 'ingredient' | 'none';
  conflictingItems?: string[];
  suggestion?: string;
  alternativePrompt?: string;
  shouldGenerateRecipe: boolean;
}

export interface DietaryConflict {
  requestedItem: string;
  restriction: string;
  alternatives: string[];
  explanation: string;
}

// Common dietary restrictions and their conflicting ingredients
const DIETARY_CONFLICTS: Record<string, string[]> = {
  'vegan': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'salmon', 'tuna', 'eggs', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'honey', 'gelatin'],
  'vegetarian': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'salmon', 'tuna'],
  'gluten-free': ['wheat', 'barley', 'rye', 'bread', 'pasta', 'flour', 'soy sauce', 'beer'],
  'dairy-free': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream', 'sour cream'],
  'keto': ['rice', 'pasta', 'bread', 'potatoes', 'sugar', 'honey', 'maple syrup'],
  'low-carb': ['rice', 'pasta', 'bread', 'potatoes', 'sugar', 'honey', 'maple syrup'],
  'paleo': ['grains', 'legumes', 'dairy', 'processed foods', 'refined sugar'],
};

// Alternative ingredients for common dietary restrictions
const DIETARY_ALTERNATIVES: Record<string, Record<string, string[]>> = {
  'vegan': {
    'chicken': ['tofu', 'tempeh', 'seitan', 'chickpeas', 'lentils', 'mushrooms'],
    'beef': ['portobello mushrooms', 'jackfruit', 'lentils', 'black beans', 'quinoa'],
    'fish': ['seaweed', 'algae', 'mushrooms', 'tofu', 'tempeh'],
    'eggs': ['flax seeds', 'chia seeds', 'banana', 'applesauce', 'silken tofu'],
    'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk', 'cashew milk'],
    'cheese': ['nutritional yeast', 'cashew cheese', 'tofu ricotta', 'dairy-free cheese alternatives'],
  },
  'vegetarian': {
    'chicken': ['tofu', 'tempeh', 'seitan', 'chickpeas', 'lentils', 'mushrooms'],
    'beef': ['portobello mushrooms', 'jackfruit', 'lentils', 'black beans', 'quinoa'],
    'fish': ['seaweed', 'algae', 'mushrooms', 'tofu', 'tempeh'],
  },
  'gluten-free': {
    'wheat': ['almond flour', 'coconut flour', 'rice flour', 'quinoa flour', 'tapioca flour'],
    'bread': ['gluten-free bread', 'lettuce wraps', 'collard green wraps', 'coconut wraps'],
    'pasta': ['zucchini noodles', 'spaghetti squash', 'rice noodles', 'quinoa pasta'],
    'soy sauce': ['tamari', 'coconut aminos', 'liquid aminos'],
  },
  'dairy-free': {
    'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk', 'cashew milk'],
    'cheese': ['nutritional yeast', 'cashew cheese', 'tofu ricotta', 'dairy-free cheese alternatives'],
    'butter': ['coconut oil', 'olive oil', 'avocado oil', 'dairy-free butter alternatives'],
    'cream': ['coconut cream', 'cashew cream', 'dairy-free cream alternatives'],
  },
};

/**
 * Validates a user's recipe request against their dietary preferences
 */
export function validateRecipeRequest(
  userPrompt: string,
  userPreferences: UserPreferences
): PromptValidationResult {
  const prompt = userPrompt.toLowerCase();
  
  // Check for dietary conflicts
  const conflicts: DietaryConflict[] = [];
  
  for (const restriction of userPreferences.dietaryRestrictions) {
    if (restriction === 'none') continue;
    
    const conflictingIngredients = DIETARY_CONFLICTS[restriction] || [];
    
    for (const ingredient of conflictingIngredients) {
      if (prompt.includes(ingredient)) {
        const alternatives = DIETARY_ALTERNATIVES[restriction]?.[ingredient] || [];
        conflicts.push({
          requestedItem: ingredient,
          restriction,
          alternatives,
          explanation: `You've selected ${restriction} as a dietary restriction, but you're asking for ${ingredient}.`
        });
      }
    }
  }
  
  // If there are conflicts, provide helpful alternatives
  if (conflicts.length > 0) {
    const primaryConflict = conflicts[0];
    const alternatives = primaryConflict.alternatives.slice(0, 3).join(', ');
    
    return {
      isValid: false,
      conflictType: 'dietary',
      conflictingItems: conflicts.map(c => c.requestedItem),
      suggestion: `I notice you've selected ${primaryConflict.restriction} as a dietary preference, but you're asking for ${primaryConflict.requestedItem}.`,
      alternativePrompt: `Would you like me to suggest a delicious ${primaryConflict.restriction} alternative using ${alternatives} instead?`,
      shouldGenerateRecipe: false
    };
  }
  
  // Check if the request aligns with cuisine preferences
  const hasCuisinePreference = userPreferences.cuisinePreferences.length > 0;
  if (hasCuisinePreference) {
    const requestedCuisine = detectCuisineFromPrompt(prompt);
    if (requestedCuisine && !userPreferences.cuisinePreferences.includes(requestedCuisine)) {
      return {
        isValid: false,
        conflictType: 'cuisine',
        conflictingItems: [requestedCuisine],
        suggestion: `I see you're asking for ${requestedCuisine} cuisine, but your preferences include ${userPreferences.cuisinePreferences.join(', ')}.`,
        alternativePrompt: `Would you like me to suggest a recipe from your preferred cuisines, or would you like to explore ${requestedCuisine} cuisine?`,
        shouldGenerateRecipe: true // Allow generation but with a note
      };
    }
  }
  
  // Check if the request aligns with skill level
  const skillConflict = validateSkillLevel(prompt, userPreferences.skillLevel);
  if (skillConflict) {
    return {
      isValid: false,
      conflictType: 'ingredient',
      conflictingItems: [skillConflict.complexIngredient],
      suggestion: `I notice you're asking for a recipe with ${skillConflict.complexIngredient}, which might be challenging for ${userPreferences.skillLevel} cooks.`,
      alternativePrompt: `Would you like me to suggest a ${userPreferences.skillLevel}-friendly version, or would you like to try the original recipe?`,
      shouldGenerateRecipe: true // Allow generation but with a note
    };
  }
  
  // All validations passed
  return {
    isValid: true,
    conflictType: 'none',
    shouldGenerateRecipe: true
  };
}

/**
 * Detects cuisine type from user prompt
 */
function detectCuisineFromPrompt(prompt: string): string | null {
  const cuisineKeywords: Record<string, string[]> = {
    'italian': ['pasta', 'pizza', 'risotto', 'carbonara', 'bolognese', 'italian'],
    'asian': ['sushi', 'stir fry', 'curry', 'noodles', 'asian', 'chinese', 'japanese', 'thai', 'vietnamese'],
    'mexican': ['tacos', 'enchiladas', 'quesadilla', 'mexican', 'salsa', 'guacamole'],
    'indian': ['curry', 'naan', 'biryani', 'indian', 'masala', 'dal'],
    'mediterranean': ['hummus', 'falafel', 'mediterranean', 'greek', 'lebanese'],
    'french': ['ratatouille', 'coq au vin', 'french', 'béarnaise', 'hollandaise'],
    'american': ['burger', 'hot dog', 'american', 'bbq', 'barbecue', 'comfort food'],
  };
  
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some(keyword => prompt.includes(keyword))) {
      return cuisine;
    }
  }
  
  return null;
}

/**
 * Validates if the requested recipe complexity matches user skill level
 */
function validateSkillLevel(prompt: string, skillLevel: string): { complexIngredient: string } | null {
  const complexIngredients: Record<string, string[]> = {
    'beginner': ['sous vide', 'confit', 'foie gras', 'truffle', 'quail', 'duck', 'lobster'],
    'intermediate': ['sous vide', 'confit', 'foie gras', 'truffle'],
  };
  
  if (skillLevel === 'beginner') {
    for (const ingredient of complexIngredients.beginner) {
      if (prompt.includes(ingredient)) {
        return { complexIngredient: ingredient };
      }
    }
  }
  
  if (skillLevel === 'intermediate') {
    for (const ingredient of complexIngredients.intermediate) {
      if (prompt.includes(ingredient)) {
        return { complexIngredient: ingredient };
      }
    }
  }
  
  return null;
}

/**
 * Generates a helpful response when there are dietary conflicts
 */
export function generateConflictResponse(
  validationResult: PromptValidationResult,
  userPreferences: UserPreferences
): string {
  if (validationResult.isValid) {
    return "Great! I'll generate a recipe that perfectly matches your preferences.";
  }
  
  switch (validationResult.conflictType) {
    case 'dietary':
      return `${validationResult.suggestion} ${validationResult.alternativePrompt}`;
    
    case 'cuisine':
      return `${validationResult.suggestion} ${validationResult.alternativePrompt}`;
    
    case 'ingredient':
      return `${validationResult.suggestion} ${validationResult.alternativePrompt}`;
    
    default:
      return "I'd be happy to help you with that recipe!";
  }
}

/**
 * Suggests alternative ingredients based on dietary restrictions
 */
export function suggestAlternatives(
  requestedIngredient: string,
  dietaryRestrictions: string[]
): string[] {
  const alternatives: string[] = [];
  
  for (const restriction of dietaryRestrictions) {
    if (restriction === 'none') continue;
    
    const restrictionAlternatives = DIETARY_ALTERNATIVES[restriction]?.[requestedIngredient] || [];
    alternatives.push(...restrictionAlternatives);
  }
  
  // Remove duplicates and return top alternatives
  return [...new Set(alternatives)].slice(0, 5);
}

/**
 * Creates a modified prompt that respects dietary restrictions
 */
export function createDietaryCompliantPrompt(
  originalPrompt: string,
  userPreferences: UserPreferences
): string {
  let modifiedPrompt = originalPrompt;
  
  for (const restriction of userPreferences.dietaryRestrictions) {
    if (restriction === 'none') continue;
    
    const conflictingIngredients = DIETARY_CONFLICTS[restriction] || [];
    
    for (const ingredient of conflictingIngredients) {
      if (modifiedPrompt.toLowerCase().includes(ingredient)) {
        const alternatives = DIETARY_ALTERNATIVES[restriction]?.[ingredient] || [];
        if (alternatives.length > 0) {
          const alternative = alternatives[0];
          modifiedPrompt = modifiedPrompt.replace(
            new RegExp(ingredient, 'gi'),
            alternative
          );
        }
      }
    }
  }
  
  return modifiedPrompt;
}
