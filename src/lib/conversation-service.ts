import { UserPreferences } from './auth-context';
import { Recipe, generatePersonalizedRecipesProgressive } from './gemini-service';
import { 
  validateRecipeRequest, 
  PromptValidationResult, 
  generateConflictResponse,
  createDietaryCompliantPrompt,
  suggestAlternatives 
} from './prompt-validation-service';
import { 
  langChainConversationService, 
  LangChainConversationContext, 
  LangChainResponse 
} from './langchain-conversation-service';

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
 * Enhanced conversation handler using LangChain for more human-like interactions
 */
export async function handleRecipeRequest(
  userPrompt: string,
  context: ConversationContext
): Promise<ConversationResponse> {
  try {
    // Convert to LangChain context
    const langChainContext: LangChainConversationContext = {
      userPreferences: context.userPreferences,
      chatHistory: context.chatHistory,
      currentTopic: context.currentTopic,
      lastRecipeGenerated: context.lastRecipeGenerated,
    };

    // Try to use server-side LangChain processing first
    let langChainResponse;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userPrompt,
          context: langChainContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        langChainResponse = data.response;
      } else {
        throw new Error('API request failed');
      }
    } catch (apiError) {
      console.log('API route not available, using client-side fallback');
      // Fallback to client-side processing
      langChainResponse = await langChainConversationService.processMessage(
        userPrompt,
        langChainContext
      );
    }

    // If LangChain suggests recipe generation, validate it
    if (langChainResponse.shouldGenerateRecipe) {
      const validation = validateRecipeRequest(userPrompt, context.userPreferences);
      
      if (validation.isValid) {
        return {
          message: langChainResponse.message,
          shouldGenerateRecipe: true,
          isEducational: langChainResponse.isEducational
        };
      } else {
        // Handle conflicts with LangChain-enhanced responses
        return handleConflictWithLangChain(userPrompt, validation, context, langChainResponse);
      }
    }

    // Return LangChain response for non-recipe requests
    return {
      message: langChainResponse.message,
      shouldGenerateRecipe: false,
      isEducational: langChainResponse.isEducational
    };

  } catch (error) {
    console.error('Error in enhanced conversation handler:', error);
    
    // Fallback to original logic
    return handleRecipeRequestFallback(userPrompt, context);
  }
}

/**
 * Fallback to original conversation logic if LangChain fails
 */
async function handleRecipeRequestFallback(
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
 * Handle conflicts with LangChain-enhanced responses
 */
function handleConflictWithLangChain(
  userPrompt: string,
  validation: PromptValidationResult,
  context: ConversationContext,
  langChainResponse: LangChainResponse
): ConversationResponse {
  // Use LangChain response as base but add conflict handling
  const baseMessage = langChainResponse.message;
  
  switch (validation.conflictType) {
    case 'dietary':
      const dietaryResponse = handleDietaryConflict(userPrompt, validation, context);
      return {
        message: `${baseMessage} ${dietaryResponse.message}`,
        shouldGenerateRecipe: false,
        alternatives: dietaryResponse.alternatives,
        conflictType: 'dietary',
        isEducational: true
      };
    
    case 'cuisine':
      const cuisineResponse = handleCuisineConflict(userPrompt, validation, context);
      return {
        message: `${baseMessage} ${cuisineResponse.message}`,
        shouldGenerateRecipe: cuisineResponse.shouldGenerateRecipe,
        conflictType: 'cuisine',
        isEducational: true
      };
    
    case 'ingredient':
      const skillResponse = handleSkillConflict(userPrompt, validation, context);
      return {
        message: `${baseMessage} ${skillResponse.message}`,
        shouldGenerateRecipe: skillResponse.shouldGenerateRecipe,
        conflictType: 'ingredient',
        isEducational: true
      };
    
    default:
      return {
        message: baseMessage,
        shouldGenerateRecipe: false,
        isEducational: langChainResponse.isEducational
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

/**
 * Clear conversation memory for new chat sessions
 */
export async function clearConversationMemory(): Promise<void> {
  try {
    // Try to use server-side API first
    const response = await fetch('/api/chat', {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
  } catch (apiError) {
    console.log('API route not available, using client-side fallback');
    // Fallback to client-side processing
    langChainConversationService.clearMemory();
  }
}

/**
 * Get conversation history for debugging
 */
export async function getConversationHistory(): Promise<string[]> {
  return await langChainConversationService.getConversationHistory();
}
