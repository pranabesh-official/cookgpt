// Server-side only imports - these will be dynamically imported
import { UserPreferences } from './auth-context';
import { Recipe } from './gemini-service';

export interface LangChainConversationContext {
  userPreferences: UserPreferences;
  chatHistory: string[];
  currentTopic?: string;
  lastRecipeGenerated?: Recipe;
  userPersonality?: {
    cookingExperience: 'beginner' | 'intermediate' | 'advanced';
    communicationStyle: 'casual' | 'professional' | 'enthusiastic';
    interests: string[];
  };
}

export interface LangChainResponse {
  message: string;
  shouldGenerateRecipe: boolean;
  modifiedPrompt?: string;
  alternatives?: string[];
  conflictType?: string;
  isEducational: boolean;
  conversationFlow?: 'greeting' | 'recipe_request' | 'follow_up' | 'clarification' | 'educational' | 'general';
  emotionalTone?: 'friendly' | 'encouraging' | 'excited' | 'helpful' | 'patient';
  memoryContext?: string;
}

/**
 * Enhanced conversation service using LangChain for more human-like interactions
 * This service runs server-side only to avoid client-side compatibility issues
 */
export class LangChainConversationService {
  private llm: any;
  private conversationChain: any;
  private memory: any;
  private systemPrompt: string;
  private isInitialized: boolean = false;

  constructor() {
    this.systemPrompt = `You are ChefGPT, a warm, knowledgeable, and enthusiastic AI cooking assistant. Your personality traits:

PERSONALITY:
- Warm and friendly, like a helpful friend who loves cooking
- Enthusiastic about food and cooking techniques
- Patient and encouraging, especially with beginners
- Knowledgeable but not condescending
- Uses natural, conversational language with occasional cooking enthusiasm
- Remembers previous conversations and builds on them
- Shows genuine interest in the user's cooking journey

COMMUNICATION STYLE:
- Use natural, conversational language
- Include occasional cooking-related expressions ("That sounds delicious!", "Perfect choice!", "Let's make magic in the kitchen!")
- Ask follow-up questions to understand preferences better
- Provide encouragement and positive reinforcement
- Use emojis sparingly but effectively (🍳, 👨‍🍳, ✨, 🎉)
- Vary your responses to avoid repetition

COOKING EXPERTISE:
- Deep knowledge of cuisines, techniques, and ingredients
- Understanding of dietary restrictions and preferences
- Ability to suggest alternatives and modifications
- Knowledge of cooking science and why techniques work
- Awareness of skill levels and appropriate complexity

CONVERSATION FLOW:
- Greet users warmly and remember their preferences
- Ask clarifying questions when needed
- Provide educational content when appropriate
- Build on previous conversations
- Offer encouragement and celebrate successes

Remember: You're not just providing recipes - you're being a supportive cooking companion who helps users grow in their culinary journey.`;
  }

  /**
   * Initialize LangChain components (server-side only)
   */
  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamic imports for server-side only
      const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
      const { ConversationChain } = await import('langchain/chains');
      const { BufferMemory } = await import('langchain/memory');
      const { PromptTemplate } = await import('@langchain/core/prompts');

      // Verify imports are working
      if (!ChatGoogleGenerativeAI || !ConversationChain || !BufferMemory || !PromptTemplate) {
        throw new Error('Failed to import LangChain components');
      }

      // Initialize the Google Generative AI model
      this.llm = new ChatGoogleGenerativeAI({
        modelName: 'gemini-2.5-flash',
        temperature: 0.8,
        maxOutputTokens: 1024,
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      });

      // Initialize memory for conversation context
      this.memory = new BufferMemory({
        returnMessages: true,
        memoryKey: 'chat_history',
      });

      // Create conversation chain with custom prompt
      const prompt = PromptTemplate.fromTemplate(`
{system_prompt}

Current conversation context:
- User preferences: {user_preferences}
- Current topic: {current_topic}
- Last recipe: {last_recipe}
- User personality: {user_personality}

Previous conversation:
{chat_history}

Human: {input}
ChefGPT:`);

      this.conversationChain = new ConversationChain({
        llm: this.llm,
        memory: this.memory,
        prompt: prompt,
        verbose: false,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize LangChain service:', error);
      throw new Error('LangChain service initialization failed');
    }
  }

  /**
   * Process a user message with enhanced human-like conversation
   */
  async processMessage(
    userMessage: string,
    context: LangChainConversationContext
  ): Promise<LangChainResponse> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Fallback to enhanced basic response for client-side
        return this.getFallbackResponse(userMessage, context);
      }

      // Initialize LangChain components (server-side only)
      // Temporarily disabled due to import issues
      // await this.initialize();

      // For now, use fallback response until LangChain is properly configured
      return this.getFallbackResponse(userMessage, context);
    } catch (error) {
      console.error('Error in LangChain conversation service:', error);
      
      // Fallback to a friendly error response
      return this.getFallbackResponse(userMessage, context);
    }
  }

  /**
   * Fallback response for client-side or when LangChain fails
   */
  private getFallbackResponse(
    userMessage: string,
    context: LangChainConversationContext
  ): LangChainResponse {
    const message = userMessage.toLowerCase();
    
    // Basic personality-enhanced responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        message: "Hello! I'm ChefGPT, your warm and enthusiastic cooking companion! 👨‍🍳 I'm so excited to help you discover amazing recipes and cooking techniques. What would you like to cook today? ✨",
        shouldGenerateRecipe: false,
        isEducational: false,
        conversationFlow: 'greeting',
        emotionalTone: 'friendly',
      };
    }
    
    if (message.includes('recipe') || message.includes('cook') || message.includes('make')) {
      return {
        message: "Wonderful! I'd love to help you create something delicious! 🍳 Let me know what type of cuisine or specific dish you're interested in, and I'll craft the perfect recipe for you! ✨",
        shouldGenerateRecipe: true,
        isEducational: false,
        conversationFlow: 'recipe_request',
        emotionalTone: 'excited',
      };
    }
    
    if (message.includes('?') || message.includes('what') || message.includes('how')) {
      return {
        message: "Great question! I'm here to help with all your cooking curiosities! 👨‍🍳 Whether it's techniques, ingredients, or cooking science, I'd love to share my knowledge with you. What would you like to know? ✨",
        shouldGenerateRecipe: false,
        isEducational: true,
        conversationFlow: 'clarification',
        emotionalTone: 'helpful',
      };
    }
    
    // Default encouraging response
    return {
      message: "I'm so excited to help you with your cooking journey! 👨‍🍳 Whether you need recipes, cooking tips, or culinary inspiration, I'm here to make your experience delightful. What can I help you with today? ✨",
      shouldGenerateRecipe: false,
      isEducational: false,
      conversationFlow: 'general',
      emotionalTone: 'encouraging',
    };
  }

  /**
   * Analyze conversation context to determine flow and tone
   */
  private analyzeConversationContext(
    userMessage: string,
    context: LangChainConversationContext
  ): {
    conversationFlow: LangChainResponse['conversationFlow'];
    emotionalTone: LangChainResponse['emotionalTone'];
    isRecipeRequest: boolean;
    isFollowUp: boolean;
    userIntent: string;
  } {
    const message = userMessage.toLowerCase();
    
    // Determine conversation flow
    let conversationFlow: LangChainResponse['conversationFlow'] = 'general';
    let emotionalTone: LangChainResponse['emotionalTone'] = 'friendly';
    let isRecipeRequest = false;
    let isFollowUp = false;
    let userIntent = 'general';

    // Check for greeting
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      conversationFlow = 'greeting';
      emotionalTone = 'friendly';
    }
    
    // Check for recipe request
    if (message.includes('recipe') || message.includes('cook') || message.includes('make') || 
        message.includes('dish') || message.includes('meal') || message.includes('food')) {
      conversationFlow = 'recipe_request';
      emotionalTone = 'excited';
      isRecipeRequest = true;
      userIntent = 'recipe_request';
    }
    
    // Check for follow-up
    const followUpKeywords = ['yes', 'no', 'sure', 'okay', 'that sounds good', 'i would like', 'please', 'more'];
    if (followUpKeywords.some(keyword => message.includes(keyword))) {
      conversationFlow = 'follow_up';
      emotionalTone = 'encouraging';
      isFollowUp = true;
    }
    
    // Check for clarification
    if (message.includes('?') || message.includes('what') || message.includes('how') || 
        message.includes('why') || message.includes('when')) {
      conversationFlow = 'clarification';
      emotionalTone = 'helpful';
    }
    
    // Check for educational content
    if (message.includes('learn') || message.includes('teach') || message.includes('explain') || 
        message.includes('difference') || message.includes('why')) {
      conversationFlow = 'educational';
      emotionalTone = 'patient';
    }

    return {
      conversationFlow,
      emotionalTone,
      isRecipeRequest,
      isFollowUp,
      userIntent,
    };
  }

  /**
   * Format context for LLM consumption
   */
  private formatContextForLLM(context: LangChainConversationContext): {
    userPreferences: string;
    currentTopic: string;
    lastRecipe: string;
    userPersonality: string;
  } {
    const preferences = context.userPreferences ? 
      `Dietary: ${context.userPreferences.dietaryRestrictions?.join(', ') || 'None'}, ` +
      `Cuisines: ${context.userPreferences.preferredCuisines?.join(', ') || 'Open to all'}, ` +
      `Skill: ${context.userPreferences.cookingSkillLevel || 'Not specified'}, ` +
      `Allergies: ${context.userPreferences.allergies?.join(', ') || 'None'}` : 
      'No preferences set';

    const currentTopic = context.currentTopic || 'General cooking discussion';
    
    const lastRecipe = context.lastRecipeGenerated ? 
      `Last recipe: ${context.lastRecipeGenerated.title} (${context.lastRecipeGenerated.difficulty} level)` : 
      'No recent recipes';

    const personality = context.userPersonality ? 
      `Experience: ${context.userPersonality.cookingExperience}, ` +
      `Style: ${context.userPersonality.communicationStyle}, ` +
      `Interests: ${context.userPersonality.interests?.join(', ') || 'General cooking'}` : 
      'Personality not analyzed yet';

    return {
      userPreferences: preferences,
      currentTopic,
      lastRecipe,
      userPersonality: personality,
    };
  }

  /**
   * Enhance the LLM response with additional context and personality
   */
  private enhanceResponse(
    llmResponse: string,
    analysis: ReturnType<typeof this.analyzeConversationContext>,
    context: LangChainConversationContext
  ): LangChainResponse {
    // Determine if this should trigger recipe generation
    const shouldGenerateRecipe = analysis.isRecipeRequest && 
      context.userPreferences?.onboardingCompleted;

    // Add emotional tone indicators
    let enhancedMessage = llmResponse;
    
    // Add appropriate emojis based on tone
    if (analysis.emotionalTone === 'excited') {
      enhancedMessage = enhancedMessage.replace(/\.$/, '! 🎉');
    } else if (analysis.emotionalTone === 'encouraging') {
      enhancedMessage = enhancedMessage.replace(/\.$/, '! ✨');
    } else if (analysis.emotionalTone === 'helpful') {
      enhancedMessage = enhancedMessage.replace(/\.$/, '! 👨‍🍳');
    }

    // Add memory context for future conversations
    const memoryContext = this.generateMemoryContext(analysis, context);

    return {
      message: enhancedMessage,
      shouldGenerateRecipe,
      isEducational: analysis.conversationFlow === 'educational',
      conversationFlow: analysis.conversationFlow,
      emotionalTone: analysis.emotionalTone,
      memoryContext,
    };
  }

  /**
   * Generate memory context for future conversations
   */
  private generateMemoryContext(
    analysis: ReturnType<typeof this.analyzeConversationContext>,
    context: LangChainConversationContext
  ): string {
    const contextElements = [];
    
    if (analysis.conversationFlow === 'recipe_request') {
      contextElements.push('User is interested in recipes');
    }
    
    if (context.userPreferences?.dietaryRestrictions?.length) {
      contextElements.push(`Dietary restrictions: ${context.userPreferences.dietaryRestrictions.join(', ')}`);
    }
    
    if (context.userPreferences?.cookingSkillLevel) {
      contextElements.push(`Skill level: ${context.userPreferences.cookingSkillLevel}`);
    }
    
    if (analysis.isFollowUp) {
      contextElements.push('This is a follow-up to previous conversation');
    }

    return contextElements.join('; ');
  }

  /**
   * Clear conversation memory (useful for new chat sessions)
   */
  clearMemory(): void {
    // Memory clearing is temporarily disabled until LangChain is properly configured
    // if (this.memory && typeof this.memory.clear === 'function') {
    //   this.memory.clear();
    // }
    // Reset initialization state for fresh start
    this.isInitialized = false;
    console.log('Memory clearing temporarily disabled');
  }

  /**
   * Get conversation history for debugging
   */
  async getConversationHistory(): Promise<string[]> {
    if (this.memory && typeof this.memory.loadMemoryVariables === 'function') {
      try {
        const history = await this.memory.loadMemoryVariables({});
        return history.chat_history?.map((msg: any) => msg.content) || [];
      } catch (error) {
        console.error('Error loading conversation history:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Update user personality based on conversation patterns
   */
  updateUserPersonality(
    context: LangChainConversationContext,
    userMessage: string
  ): LangChainConversationContext['userPersonality'] {
    const message = userMessage.toLowerCase();
    
    // Analyze cooking experience level
    let cookingExperience: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (message.includes('advanced') || message.includes('professional') || message.includes('chef')) {
      cookingExperience = 'advanced';
    } else if (message.includes('intermediate') || message.includes('some experience') || message.includes('cooked before')) {
      cookingExperience = 'intermediate';
    }

    // Analyze communication style preference
    let communicationStyle: 'casual' | 'professional' | 'enthusiastic' = 'casual';
    if (message.includes('professional') || message.includes('formal')) {
      communicationStyle = 'professional';
    } else if (message.includes('excited') || message.includes('love') || message.includes('amazing')) {
      communicationStyle = 'enthusiastic';
    }

    // Extract interests
    const interests: string[] = [];
    const cuisineKeywords = ['italian', 'chinese', 'mexican', 'indian', 'french', 'japanese', 'thai', 'mediterranean'];
    const techniqueKeywords = ['baking', 'grilling', 'sautéing', 'roasting', 'steaming', 'frying'];
    
    cuisineKeywords.forEach(cuisine => {
      if (message.includes(cuisine)) interests.push(cuisine);
    });
    
    techniqueKeywords.forEach(technique => {
      if (message.includes(technique)) interests.push(technique);
    });

    return {
      cookingExperience,
      communicationStyle,
      interests,
    };
  }
}

// Export singleton instance
export const langChainConversationService = new LangChainConversationService();
