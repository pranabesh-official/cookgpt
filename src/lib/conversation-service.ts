import { UserPreferences } from './auth-context';
import { Recipe, generatePersonalizedRecipesProgressive } from './gemini-service';
import { 
  validateRecipeRequest, 
  PromptValidationResult, 
  generateConflictResponse,
  createDietaryCompliantPrompt,
  suggestAlternatives 
} from './prompt-validation-service';

export interface ConversationContext {
  userPreferences: UserPreferences;
  chatHistory: string[];
  currentTopic?: string;
  lastRecipeGenerated?: Recipe;
}

export interface ConversationResponse {
  message: string;
  shouldGenerateRecipe: boolean;
  modifiedPrompt?: string;
  alternatives?: string[];
  conflictType?: string;
  isEducational: boolean;
}

/**
 * Main conversation handler that validates user requests and provides appropriate responses
 */
export async function handleRecipeRequest(
  userPrompt: string,
  context: ConversationContext
): Promise<ConversationResponse> {
  // Validate the request against user preferences
  const validation = validateRecipeRequest(userPrompt, context.userPreferences);
  
  if (validation.isValid) {
    // Request is valid, proceed with recipe generation
    return {
      message: "Perfect! I'll create a personalized recipe that matches your preferences perfectly.",
      shouldGenerateRecipe: true,
      isEducational: false
    };
  }
  
  // Handle conflicts based on type
  switch (validation.conflictType) {
    case 'dietary':
      return handleDietaryConflict(userPrompt, validation, context);
    
    case 'cuisine':
      return handleCuisineConflict(userPrompt, validation, context);
    
    case 'ingredient':
      return handleSkillConflict(userPrompt, validation, context);
    
    default:
      return {
        message: "I'd be happy to help you with that recipe!",
        shouldGenerateRecipe: true,
        isEducational: false
      };
  }
}

/**
 * Handles dietary restriction conflicts
 */
function handleDietaryConflict(
  userPrompt: string,
  validation: PromptValidationResult,
  context: ConversationContext
): ConversationResponse {
  const conflictingItems = validation.conflictingItems || [];
  const primaryConflict = conflictingItems[0];
  
  if (primaryConflict) {
    const alternatives = suggestAlternatives(primaryConflict, context.userPreferences.dietaryRestrictions);
    
    return {
      message: `${validation.suggestion} ${validation.alternativePrompt}`,
      shouldGenerateRecipe: false,
      alternatives,
      conflictType: 'dietary',
      isEducational: true
    };
  }
  
  return {
    message: "I notice there might be a dietary preference conflict. Could you clarify what you'd like to cook?",
    shouldGenerateRecipe: false,
    isEducational: true
  };
}

/**
 * Handles cuisine preference conflicts
 */
function handleCuisineConflict(
  userPrompt: string,
  validation: PromptValidationResult,
  context: ConversationContext
): ConversationResponse {
  return {
    message: `${validation.suggestion} ${validation.alternativePrompt}`,
    shouldGenerateRecipe: validation.shouldGenerateRecipe,
    conflictType: 'cuisine',
    isEducational: true
  };
}

/**
 * Handles skill level conflicts
 */
function handleSkillConflict(
  userPrompt: string,
  validation: PromptValidationResult,
  context: ConversationContext
): ConversationResponse {
  return {
    message: `${validation.suggestion} ${validation.alternativePrompt}`,
    shouldGenerateRecipe: validation.shouldGenerateRecipe,
    conflictType: 'ingredient',
    isEducational: true
  };
}

/**
 * Generates a recipe with dietary compliance
 */
export async function generateCompliantRecipe(
  userPrompt: string,
  context: ConversationContext,
  count: number = 1
): Promise<Recipe[]> {
  // Create a modified prompt that respects dietary restrictions
  const modifiedPrompt = createDietaryCompliantPrompt(userPrompt, context.userPreferences);
  
  // Generate recipes using the modified prompt
  const recipes: Recipe[] = [];
  
  try {
    for await (const recipe of generatePersonalizedRecipesProgressive(context.userPreferences, count)) {
      recipes.push(recipe);
    }
  } catch (error) {
    console.error('Error generating compliant recipes:', error);
    throw new Error('Failed to generate recipes. Please try again.');
  }
  
  return recipes;
}

/**
 * Provides educational content about dietary alternatives
 */
export function provideDietaryEducation(
  requestedIngredient: string,
  dietaryRestrictions: string[]
): string {
  const alternatives = suggestAlternatives(requestedIngredient, dietaryRestrictions);
  
  if (alternatives.length === 0) {
    return `I understand you're interested in ${requestedIngredient}. While this ingredient doesn't align with your current dietary preferences, I'd be happy to suggest some delicious alternatives that would work perfectly for you.`;
  }
  
  const alternativesList = alternatives.slice(0, 3).join(', ');
  
  return `Great question! While ${requestedIngredient} doesn't fit your dietary preferences, here are some excellent alternatives: ${alternativesList}. These ingredients can create similar flavors and textures while respecting your dietary choices. Would you like me to suggest a recipe using one of these alternatives?`;
}

/**
 * Creates a conversation flow for handling dietary conflicts
 */
export function createDietaryConflictFlow(
  userPrompt: string,
  validation: PromptValidationResult,
  context: ConversationContext
): ConversationResponse[] {
  const responses: ConversationResponse[] = [];
  
  // Initial conflict response
  responses.push({
    message: validation.suggestion || "I notice there's a dietary preference conflict.",
    shouldGenerateRecipe: false,
    conflictType: validation.conflictType,
    isEducational: true
  });
  
  // Educational response about alternatives
  if (validation.conflictingItems && validation.conflictingItems.length > 0) {
    const primaryConflict = validation.conflictingItems[0];
    const alternatives = suggestAlternatives(primaryConflict, context.userPreferences.dietaryRestrictions);
    
    responses.push({
      message: `Here are some great alternatives to ${primaryConflict}: ${alternatives.slice(0, 3).join(', ')}.`,
      shouldGenerateRecipe: false,
      alternatives,
      conflictType: validation.conflictType,
      isEducational: true
    });
  }
  
  // Offer to generate alternative recipe
  responses.push({
    message: validation.alternativePrompt || "Would you like me to create a recipe using these alternatives instead?",
    shouldGenerateRecipe: false,
    conflictType: validation.conflictType,
    isEducational: false
  });
  
  return responses;
}

/**
 * Analyzes conversation context to provide better responses
 */
export function analyzeConversationContext(
  userPrompt: string,
  context: ConversationContext
): {
  isFollowUp: boolean;
  topicContinuity: boolean;
  userIntent: 'recipe_request' | 'question' | 'clarification' | 'general';
} {
  const prompt = userPrompt.toLowerCase();
  const lastMessage = context.chatHistory[context.chatHistory.length - 1];
  
  // Determine if this is a follow-up question
  const followUpKeywords = ['yes', 'no', 'sure', 'okay', 'that sounds good', 'i would like', 'please'];
  const isFollowUp = followUpKeywords.some(keyword => prompt.includes(keyword));
  
  // Check topic continuity
  const topicContinuity = lastMessage ? 
    context.chatHistory.some(msg => 
      msg.toLowerCase().includes(prompt.split(' ')[0]) || 
      prompt.includes(msg.toLowerCase().split(' ')[0])
    ) : false;
  
  // Determine user intent
  let userIntent: 'recipe_request' | 'question' | 'clarification' | 'general' = 'general';
  
  if (prompt.includes('recipe') || prompt.includes('cook') || prompt.includes('make')) {
    userIntent = 'recipe_request';
  } else if (prompt.includes('?') || prompt.includes('what') || prompt.includes('how')) {
    userIntent = 'question';
  } else if (isFollowUp) {
    userIntent = 'clarification';
  }
  
  return {
    isFollowUp,
    topicContinuity,
    userIntent
  };
}
