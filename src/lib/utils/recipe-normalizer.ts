import { Recipe, EnhancedIngredient, EnhancedInstruction } from "@/lib/types/conversation";

/**
 * Normalize recipe data to ensure compatibility with enhanced types
 */
export function normalizeRecipe(recipe: any): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    // Ensure required fields have defaults
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || 'A delicious recipe',
    cookingTime: recipe.cookingTime || '30 minutes',
    servings: recipe.servings || 2,
    difficulty: recipe.difficulty || 'Medium',
    tags: recipe.tags || [],
    imageUrl: recipe.imageUrl || '', // Preserve image URLs
  };
}

/**
 * Normalize ingredients to EnhancedIngredient format
 */
function normalizeIngredients(ingredients: any[]): EnhancedIngredient[] {
  return ingredients.map((ingredient, index) => {
    // If it's already an EnhancedIngredient object, return as is
    if (typeof ingredient === 'object' && ingredient.name) {
      return ingredient as EnhancedIngredient;
    }
    
    // If it's a string, parse it into an EnhancedIngredient
    if (typeof ingredient === 'string') {
      return parseIngredientString(ingredient);
    }
    
    // Fallback for any other format
    return {
      name: String(ingredient),
      amount: '1',
      unit: 'piece',
    };
  });
}

/**
 * Normalize instructions to EnhancedInstruction format
 */
function normalizeInstructions(instructions: any[]): EnhancedInstruction[] {
  return instructions.map((instruction, index) => {
    // If it's already an EnhancedInstruction object, return as is
    if (typeof instruction === 'object' && instruction.instruction) {
      return instruction as EnhancedInstruction;
    }
    
    // If it's a string, convert to EnhancedInstruction
    if (typeof instruction === 'string') {
      return {
        step: index + 1,
        instruction: instruction,
      };
    }
    
    // Fallback for any other format
    return {
      step: index + 1,
      instruction: String(instruction),
    };
  });
}

/**
 * Parse ingredient string into structured format
 * Examples: "2 cups flour", "1 large onion", "salt to taste"
 */
function parseIngredientString(ingredientStr: string): EnhancedIngredient {
  const trimmed = ingredientStr.trim();
  
  // Try to extract amount, unit, and name
  const match = trimmed.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*([a-zA-Z]*)\s*(.+)$/);
  
  if (match) {
    const [, amount, unit, name] = match;
    return {
      name: name.trim(),
      amount: amount,
      unit: unit || 'piece',
    };
  }
  
  // If no amount found, treat as whole ingredient
  return {
    name: trimmed,
    amount: '1',
    unit: 'piece',
  };
}

/**
 * Normalize recipe array
 */
export function normalizeRecipes(recipes: any[]): Recipe[] {
  return recipes.map(normalizeRecipe);
}