import { 
  ConversationContext,
  ConversationResponse,
  UserIntent,
  ConversationMemory,
  Recipe,
  IntentType,
  ExtractedEntity,
  UserPreferences
} from "@/lib/types/conversation";
import { LangChainMemoryService } from "./langchain-memory";
import { IntentAnalysisService } from "./intent-analysis";
import { DynamicRecipeGenerator } from "./dynamic-recipe-generator";
import { DietitianKnowledgeService } from "./dietitian-knowledge";
import { ChefExpertiseService } from "./chef-expertise";
import { normalizeRecipes } from "@/lib/utils/recipe-normalizer";

export class EnhancedConversationService {
  private memoryService: LangChainMemoryService;
  private intentAnalysis: IntentAnalysisService;
  private recipeGenerator: DynamicRecipeGenerator;
  private dietitianService: DietitianKnowledgeService;
  private chefService: ChefExpertiseService;

  constructor() {
    // TEMPORARILY DISABLED TO PREVENT LANGCHAIN ERRORS
    console.warn('EnhancedConversationService is temporarily disabled to prevent LangChain errors');
    throw new Error('EnhancedConversationService is temporarily disabled. Use the basic recipe generation instead.');
    // this.memoryService = new LangChainMemoryService();
    // this.intentAnalysis = new IntentAnalysisService();
    // this.recipeGenerator = new DynamicRecipeGenerator();
    // this.dietitianService = new DietitianKnowledgeService();
    // this.chefService = new ChefExpertiseService();
  }

  /**
   * Process user message with enhanced conversation capabilities
   */
  async processMessage(
    message: string, 
    userId: string, 
    sessionId: string
  ): Promise<ConversationResponse> {
    try {
      // Create a simple conversation memory without LangChain for now
      const conversationMemory: ConversationMemory = {
        shortTermMemory: {
          currentSession: [],
          recentPreferences: [],
          contextualIngredients: [],
          recentRecipes: [],
          recentTips: []
        },
        longTermMemory: {
          dietaryRestrictions: [],
          favoriteIngredients: [],
          cookingSkillLevel: 'intermediate',
          preferredCuisines: [],
          healthGoals: [],
          conversationSummaries: []
        },
        userPreferences: {
          cookingSkillLevel: 'intermediate',
          dietaryRestrictions: [],
          cuisinePreferences: [],
          healthGoals: []
        },
        conversationHistory: []
      };

      const context = await this.buildConversationContext(message, userId, sessionId, conversationMemory);

      // Analyze user intent
      const intent = await this.intentAnalysis.analyzeIntent(message, context);

      // Generate appropriate response based on intent
      const response = await this.generateResponse(intent, context, conversationMemory);

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return this.generateErrorResponse(message);
    }
  }

  /**
   * Generate response based on intent and context
   */
  private async generateResponse(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    switch (intent.type) {
      case 'recipe_request':
        return await this.handleRecipeRequest(intent, context, memory);
      
      case 'ingredient_based_cooking':
        return await this.handleIngredientBasedRequest(intent, context, memory);
      
      case 'nutritional_advice':
        return await this.handleNutritionalAdviceRequest(intent, context, memory);
      
      case 'cooking_technique_help':
        return await this.handleCookingTechniqueRequest(intent, context, memory);
      
      case 'meal_planning':
        return await this.handleMealPlanningRequest(intent, context, memory);
      
      case 'dietary_modification':
        return await this.handleDietaryModificationRequest(intent, context, memory);
      
      case 'cooking_troubleshooting':
        return await this.handleCookingTroubleshootingRequest(intent, context, memory);
      
      default:
        return await this.handleGeneralCookingQuestion(intent, context, memory);
    }
  }

  /**
   * Handle recipe requests with dynamic recipe count
   */
  private async handleRecipeRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    // Determine optimal number of recipes (1-7)
    const recipeCount = this.determineRecipeCount(intent, context);

    // Use the existing proven recipe generation service directly
    let recipes: Recipe[] = [];
    try {
      // Import and use the working Gemini service directly
      const { generatePersonalizedRecipes } = await import("@/lib/gemini-service");
      const rawRecipes = await generatePersonalizedRecipes(context.userPreferences, recipeCount);
      recipes = normalizeRecipes(rawRecipes);
    } catch (error) {
      console.error('Recipe generation failed:', error);
      // Provide a helpful error message
      throw new Error('Unable to generate recipes at the moment. Please try again.');
    }

    // Get nutritional advice for the recipes
    const nutritionalAdvice = await this.dietitianService.getRecipeNutritionalAdvice(recipes, context.userPreferences);

    // Get chef tips for the recipes
    const cookingTips = await this.chefService.getRecipeCookingTips(recipes, context.userPreferences.cookingSkillLevel || 'intermediate');

    // Generate personalized message
    const message = this.generateRecipeResponseMessage(recipes, intent, context, recipeCount);

    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(intent, recipes, context);

    return {
      message,
      recipes,
      nutritionalAdvice,
      cookingTips,
      followUpQuestions,
      recipeCount,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle ingredient-based cooking requests
   */
  private async handleIngredientBasedRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    // Extract ingredients from intent entities
    const ingredients = intent.entities
      .filter(entity => entity.type === 'ingredient')
      .map(entity => entity.value);

    if (ingredients.length === 0) {
      return {
        message: "I'd love to help you cook with your available ingredients! Could you tell me what ingredients you have on hand?",
        followUpQuestions: [
          "What proteins do you have available?",
          "What vegetables are in your fridge?",
          "Do you have any specific grains or starches?"
        ],
        recipeCount: 0,
        confidence: 0.9,
        intent,
      };
    }

    // Generate recipes from available ingredients using proven service
    let recipes: Recipe[] = [];
    try {
      const { generatePersonalizedRecipes } = await import("@/lib/gemini-service");
      const rawRecipes = await generatePersonalizedRecipes(context.userPreferences, this.determineRecipeCount(intent, context));
      recipes = normalizeRecipes(rawRecipes);
    } catch (error) {
      console.error('Ingredient-based recipe generation failed:', error);
      throw new Error('Unable to generate recipes with those ingredients. Please try again.');
    }

    // Get nutritional analysis
    const nutritionalAdvice = await this.dietitianService.analyzeIngredientNutrition(ingredients);

    // Get chef tips for ingredient preparation
    const cookingTips = await this.chefService.getIngredientPreparationTips(ingredients);

    const message = `Great! I found ${recipes.length} delicious recipes using ${ingredients.join(', ')}. These recipes make the most of your available ingredients while considering your dietary preferences.`;

    return {
      message,
      recipes,
      nutritionalAdvice,
      cookingTips,
      followUpQuestions: [
        "Would you like variations of any of these recipes?",
        "Do you need substitutions for any missing ingredients?",
        "Would you like tips on meal prep with these ingredients?"
      ],
      recipeCount: recipes.length,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle nutritional advice requests
   */
  private async handleNutritionalAdviceRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    const nutritionalAdvice = await this.dietitianService.getPersonalizedNutritionalAdvice(
      context.userPreferences,
      context.nutritionalGoals
    );

    const message = `As your AI dietitian, here's personalized nutritional guidance based on your health goals and dietary preferences: ${nutritionalAdvice.advice}`;

    return {
      message,
      nutritionalAdvice,
      followUpQuestions: [
        "Would you like specific meal recommendations for your goals?",
        "Do you need help planning balanced meals?",
        "Would you like to know about specific nutrient sources?"
      ],
      recipeCount: 0,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle cooking technique help requests
   */
  private async handleCookingTechniqueRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    // Extract cooking method from entities
    const cookingMethod = intent.entities
      .find(entity => entity.type === 'cooking_method')?.value || 'general';

    const cookingTips = await this.chefService.getCookingTechniqueTips(
      cookingMethod,
      context.userPreferences.cookingSkillLevel || 'intermediate'
    );

    const message = `As your AI chef, here's professional guidance on ${cookingMethod} techniques tailored to your skill level:`;

    return {
      message,
      cookingTips,
      followUpQuestions: [
        "Would you like specific recipes using this technique?",
        "Do you need equipment recommendations?",
        "Would you like troubleshooting tips for common issues?"
      ],
      recipeCount: 0,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle meal planning requests
   */
  private async handleMealPlanningRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    const mealPlan = await this.dietitianService.createPersonalizedMealPlan(
      context.userPreferences,
      context.nutritionalGoals,
      7 // 7-day plan
    );

    const message = "I've created a personalized 7-day meal plan based on your dietary preferences and nutritional goals. Each day is balanced for optimal nutrition while considering your cooking skill level and time constraints.";

    return {
      message,
      nutritionalAdvice: {
        category: 'meal_planning',
        advice: mealPlan.description,
        scientificBasis: mealPlan.nutritionalRationale,
      },
      followUpQuestions: [
        "Would you like recipes for any specific meals?",
        "Do you need a grocery shopping list?",
        "Would you like meal prep tips for this plan?"
      ],
      recipeCount: 0,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle dietary modification requests
   */
  private async handleDietaryModificationRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    const modifications = await this.dietitianService.getDietaryModificationAdvice(
      intent.specificRequirements,
      context.userPreferences
    );

    const message = `I can help you modify your diet safely and effectively. Here's professional guidance for your dietary changes:`;

    return {
      message,
      nutritionalAdvice: modifications,
      followUpQuestions: [
        "Would you like modified versions of your favorite recipes?",
        "Do you need substitution suggestions?",
        "Would you like a transition plan for dietary changes?"
      ],
      recipeCount: 0,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle cooking troubleshooting requests
   */
  private async handleCookingTroubleshootingRequest(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    const troubleshootingTips = await this.chefService.provideCookingTroubleshooting(
      intent.specificRequirements.join(' ')
    );

    const message = `As your AI chef, I can help solve that cooking challenge! Here's professional troubleshooting advice:`;

    return {
      message,
      cookingTips: troubleshootingTips,
      followUpQuestions: [
        "Would you like prevention tips for next time?",
        "Do you need alternative cooking methods?",
        "Would you like a recipe that avoids this issue?"
      ],
      recipeCount: 0,
      confidence: intent.confidence,
      intent,
    };
  }

  /**
   * Handle general cooking questions with enhanced conversational AI
   */
  private async handleGeneralCookingQuestion(
    intent: UserIntent,
    context: ConversationContext,
    memory: ConversationMemory
  ): Promise<ConversationResponse> {
    // Analyze the message for cooking-related keywords
    const message = intent.specificRequirements.join(' ');
    
    // Generate conversational advice using enhanced chef service
    const conversationalAdvice = await this.chefService.generateConversationalAdvice(message, {
      recipes: memory.shortTermMemory.recentRecipes,
      previousTips: memory.shortTermMemory.recentTips
    });
    
    let response = conversationalAdvice;
    
    // Add professional context based on user's message
    const lowerMessage = message.toLowerCase();
    if (/recipe|cook|make|prepare/.test(lowerMessage)) {
      response += " I specialize in creating 1-7 personalized recipes that perfectly match your culinary preferences, dietary needs, and available ingredients. Each recipe comes with detailed nutritional analysis and professional cooking techniques tailored to your skill level.";
    } else if (/nutrition|health|diet|calorie/.test(lowerMessage)) {
      response += " My approach combines evidence-based nutritional science with practical culinary application. I can provide personalized meal planning, dietary modification strategies, and nutritional optimization for your specific health goals.";
    } else if (/technique|method|skill/.test(lowerMessage)) {
      response += " I draw from professional kitchen experience to teach cooking techniques that will transform your culinary abilities. Whether you're mastering knife skills or perfecting advanced cooking methods, I'll guide you step by step.";
    } else {
      response += " I'm here to be your comprehensive culinary partner - combining the expertise of a professional chef with the knowledge of a registered dietitian. What aspect of cooking would you like to explore together?";
    }

    // Generate contextual follow-up questions based on conversation history
    const followUpQuestions = this.generateContextualFollowUps(message, context, memory);

    return {
      message: response,
      followUpQuestions,
      recipeCount: 0,
      confidence: 0.9,
      intent,
    };
  }

  /**
   * Generate contextual follow-up questions based on conversation history
   */
  private generateContextualFollowUps(
    message: string,
    context: ConversationContext,
    memory: ConversationMemory
  ): string[] {
    const questions: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Personalized questions based on user's cooking skill level
    const skillLevel = context.userPreferences.cookingSkillLevel || 'intermediate';
    
    if (skillLevel === 'beginner') {
      questions.push("Would you like to start with some fundamental cooking techniques?");
      questions.push("What's your biggest challenge in the kitchen right now?");
    } else if (skillLevel === 'advanced' || skillLevel === 'professional') {
      questions.push("Are you interested in exploring advanced culinary techniques?");
      questions.push("Would you like to experiment with fusion cuisine concepts?");
    } else {
      questions.push("What cooking skills would you like to develop further?");
      questions.push("Are you ready to try some new culinary challenges?");
    }
    
    // Context-aware questions based on recent activity
    if (memory.shortTermMemory.recentRecipes.length > 0) {
      questions.push("Would you like variations on recipes we've discussed?");
    }
    
    if (context.availableIngredients.length > 0) {
      questions.push(`I see you have ${context.availableIngredients.slice(0, 2).join(' and ')} - shall we create something with those?`);
    }
    
    // Time-sensitive questions
    if (context.timeContext.timeOfDay === 'morning') {
      questions.push("Looking for breakfast inspiration or meal prep ideas?");
    } else if (context.timeContext.timeOfDay === 'evening') {
      questions.push("Need dinner ideas or tomorrow's meal planning?");
    }
    
    // Dietary preference questions
    if (context.userPreferences.dietaryRestrictions?.length > 0) {
      questions.push("Would you like recipes that work with your dietary preferences?");
    }
    
    return questions.slice(0, 3); // Limit to 3 most relevant questions
  }

  /**
   * Determine optimal recipe count based on context
   */
  private determineRecipeCount(intent: UserIntent, context: ConversationContext): number {
    // If user specified a preference, use it
    if (intent.recipeCountPreference > 0) {
      return Math.min(intent.recipeCountPreference, 7);
    }

    // Analyze request specificity
    const specificityScore = this.calculateRequestSpecificity(intent, context);
    
    if (specificityScore > 0.8) {
      return 1; // Very specific request
    } else if (specificityScore > 0.6) {
      return 2; // Moderately specific
    } else if (specificityScore > 0.4) {
      return 3; // Some specificity
    } else if (specificityScore > 0.2) {
      return 5; // General request
    } else {
      return 7; // Very general or exploratory request
    }
  }

  /**
   * Calculate request specificity score
   */
  private calculateRequestSpecificity(intent: UserIntent, context: ConversationContext): number {
    let score = 0;

    // Check for specific ingredients
    const ingredientEntities = intent.entities.filter(e => e.type === 'ingredient');
    if (ingredientEntities.length > 0) score += 0.3;

    // Check for specific cuisine
    const cuisineEntities = intent.entities.filter(e => e.type === 'cuisine');
    if (cuisineEntities.length > 0) score += 0.2;

    // Check for specific meal type
    const mealTypeEntities = intent.entities.filter(e => e.type === 'meal_type');
    if (mealTypeEntities.length > 0) score += 0.2;

    // Check for time constraints
    if (context.mealContext.timeConstraints.urgency === 'high') score += 0.2;

    // Check for dietary restrictions
    if (context.userPreferences.dietaryRestrictions && context.userPreferences.dietaryRestrictions.length > 0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate personalized recipe response message
   */
  private generateRecipeResponseMessage(
    recipes: Recipe[],
    intent: UserIntent,
    context: ConversationContext,
    recipeCount: number
  ): string {
    const skillLevel = context.userPreferences.cookingSkillLevel || 'intermediate';
    const dietaryNote = context.userPreferences.dietaryRestrictions?.length > 0 
      ? ` All recipes comply with your dietary restrictions and nutritional needs.` 
      : '';
    
    // Calculate average nutritional info
    const avgCalories = recipes.reduce((sum, recipe) => sum + (recipe.calories || 0), 0) / recipes.length;
    const nutritionalInsight = avgCalories > 0 
      ? ` Each recipe averages ${Math.round(avgCalories)} calories per serving.` 
      : '';

    // Professional dietitian and chef response
    const baseMessage = `As your AI chef and dietitian, I've analyzed your request and created ${recipes.length} personalized recipe${recipes.length > 1 ? 's' : ''} that perfectly match your needs.${dietaryNote}${nutritionalInsight}`;

    if (recipeCount === 1) {
      return `${baseMessage} This ${skillLevel}-level recipe is nutritionally balanced and designed to meet your specific culinary preferences. The ingredients work synergistically to provide optimal flavor and nutrition.`;
    } else if (recipeCount <= 3) {
      return `${baseMessage} Each recipe is carefully crafted for your ${skillLevel} cooking level, with attention to nutritional balance, flavor profiles, and cooking techniques that will enhance your culinary skills.`;
    } else {
      return `${baseMessage} This diverse collection offers various cooking techniques and flavor profiles, all optimized for your ${skillLevel} skill level. Each recipe provides balanced nutrition while exploring different culinary traditions.`;
    }
  }

  /**
   * Generate contextual follow-up questions
   */
  private generateFollowUpQuestions(
    intent: UserIntent,
    recipes: Recipe[],
    context: ConversationContext
  ): string[] {
    const questions: string[] = [];

    if (recipes.length > 1) {
      questions.push("Which recipe interests you most?");
      questions.push("Would you like detailed cooking tips for any of these?");
    }

    if (recipes.length > 0) {
      questions.push("Do you need ingredient substitutions?");
      questions.push("Would you like nutritional information for these recipes?");
    }

    // Add context-specific questions
    if (context.mealContext.timeConstraints.urgency === 'high') {
      questions.push("Need an even quicker option?");
    }

    if (context.userPreferences.cookingSkillLevel === 'beginner') {
      questions.push("Would you like step-by-step cooking guidance?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }

  /**
   * Learn from user interactions (temporarily disabled)
   */
  private async learnFromInteraction(
    intent: UserIntent,
    response: ConversationResponse,
    userId: string
  ): Promise<void> {
    // Temporarily disabled to avoid memory service errors
    // TODO: Re-enable when LangChain memory service is fixed
    console.log('Learning from interaction (disabled):', intent.type);
  }

  /**
   * Extract preferences from user intent
   */
  private extractPreferencesFromIntent(intent: UserIntent): any[] {
    const preferences: any[] = [];

    intent.entities.forEach(entity => {
      switch (entity.type) {
        case 'cuisine':
          preferences.push({
            type: 'cuisine',
            value: entity.value,
            strength: entity.confidence,
            lastUpdated: new Date(),
            source: 'explicit',
          });
          break;
        case 'ingredient':
          preferences.push({
            type: 'ingredient',
            value: entity.value,
            strength: entity.confidence,
            lastUpdated: new Date(),
            source: 'explicit',
          });
          break;
        case 'dietary_restriction':
          preferences.push({
            type: 'dietary',
            value: entity.value,
            strength: entity.confidence,
            lastUpdated: new Date(),
            source: 'explicit',
          });
          break;
      }
    });

    return preferences;
  }

  /**
   * Build conversation context
   */
  private async buildConversationContext(
    message: string,
    userId: string,
    sessionId: string,
    memory: ConversationMemory
  ): Promise<ConversationContext> {
    const now = new Date();
    const timeContext = {
      timeOfDay: this.getTimeOfDay(now),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      season: this.getSeason(now),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
    };

    // Extract ingredients from the message
    const availableIngredients = this.extractIngredientsFromMessage(message);

    // Determine meal context from message and time
    const mealContext = this.determineMealContext(message, timeContext);

    return {
      userId,
      sessionId,
      currentIntent: {
        type: 'recipe_request',
        confidence: 0.5,
        entities: [],
        recipeCountPreference: this.extractRecipeCountFromMessage(message),
        specificRequirements: [message], // Include the full message as a requirement
      },
      conversationHistory: memory.conversationHistory,
      userPreferences: memory.userPreferences,
      availableIngredients: availableIngredients.length > 0 ? availableIngredients : memory.shortTermMemory.contextualIngredients,
      timeContext,
      mealContext,
      nutritionalGoals: memory.userPreferences.healthGoals?.map(goal => ({
        type: goal.type as any,
        priority: goal.priority,
        targetValue: goal.target,
      })) || [],
      cookingConstraints: [],
    };
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(message: string): ConversationResponse {
    return {
      message: "I apologize, but I'm having trouble processing your request right now. As your AI chef and dietitian, I'm here to help with recipes, cooking tips, and nutritional advice. Could you try rephrasing your question?",
      followUpQuestions: [
        "Are you looking for recipe recommendations?",
        "Do you need cooking technique help?",
        "Would you like nutritional guidance?"
      ],
      recipeCount: 0,
      confidence: 0.1,
      intent: {
        type: 'recipe_request',
        confidence: 0.1,
        entities: [],
        recipeCountPreference: 0,
        specificRequirements: [],
      },
    };
  }

  // Helper methods
  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private extractIngredientsFromMessage(message: string): string[] {
    const ingredients: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Common ingredients to look for
    const commonIngredients = [
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'tofu', 'eggs',
      'rice', 'pasta', 'noodles', 'bread', 'quinoa', 'oats',
      'tomato', 'onion', 'garlic', 'ginger', 'potato', 'carrot', 'spinach', 'broccoli',
      'cheese', 'milk', 'yogurt', 'butter', 'cream',
      'beans', 'lentils', 'chickpeas', 'corn', 'peas',
      'mushrooms', 'peppers', 'cucumber', 'lettuce', 'avocado'
    ];
    
    commonIngredients.forEach(ingredient => {
      if (lowerMessage.includes(ingredient)) {
        ingredients.push(ingredient);
      }
    });
    
    return ingredients;
  }

  private extractRecipeCountFromMessage(message: string): number {
    const lowerMessage = message.toLowerCase();
    
    // Look for explicit numbers
    const numberMatch = lowerMessage.match(/(\d+)\s*(recipe|option|idea|suggestion)s?/);
    if (numberMatch) {
      return Math.min(Math.max(parseInt(numberMatch[1]), 1), 7);
    }
    
    // Look for quantity words
    if (/\b(a|one|single)\b/.test(lowerMessage)) return 1;
    if (/\b(couple|two|pair)\b/.test(lowerMessage)) return 2;
    if (/\b(few|several|some)\b/.test(lowerMessage)) return 3;
    if (/\b(many|lots|variety)\b/.test(lowerMessage)) return 5;
    if (/\b(all|everything|comprehensive)\b/.test(lowerMessage)) return 7;
    
    return 0; // No specific preference
  }

  private determineMealContext(message: string, timeContext: any): any {
    const lowerMessage = message.toLowerCase();
    
    // Determine meal type from message or time
    let mealType: any = 'dinner'; // default
    if (/breakfast|morning/.test(lowerMessage) || timeContext.timeOfDay === 'morning') {
      mealType = 'breakfast';
    } else if (/lunch|noon/.test(lowerMessage) || timeContext.timeOfDay === 'afternoon') {
      mealType = 'lunch';
    } else if (/dinner|evening/.test(lowerMessage) || timeContext.timeOfDay === 'evening') {
      mealType = 'dinner';
    } else if (/snack/.test(lowerMessage)) {
      mealType = 'snack';
    }
    
    // Determine urgency from message
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (/quick|fast|urgent|hurry/.test(lowerMessage)) {
      urgency = 'high';
    } else if (/slow|leisurely|weekend/.test(lowerMessage)) {
      urgency = 'low';
    }
    
    return {
      mealType,
      servingSize: this.extractServingSize(message),
      timeConstraints: {
        maxPrepTime: urgency === 'high' ? 15 : urgency === 'low' ? 60 : 30,
        maxCookTime: urgency === 'high' ? 20 : urgency === 'low' ? 90 : 45,
        urgency,
      },
      occasionType: /party|entertaining|guests/.test(lowerMessage) ? 'entertaining' : 'casual',
    };
  }

  private extractServingSize(message: string): number {
    const servingMatch = message.match(/(\d+)\s*(serving|person|people)/);
    if (servingMatch) {
      return parseInt(servingMatch[1]);
    }
    
    // Default based on common phrases
    if (/family|group/.test(message.toLowerCase())) return 4;
    if (/couple|two/.test(message.toLowerCase())) return 2;
    if (/myself|me|one/.test(message.toLowerCase())) return 1;
    
    return 2; // Default serving size
  }
}