import { LangChainConversationService, LangChainConversationContext, LangChainResponse } from './langchain-conversation-service';

export interface SmartConversationContext extends LangChainConversationContext {
  userEmotionalState?: 'excited' | 'frustrated' | 'curious' | 'overwhelmed' | 'confident' | 'neutral';
  conversationMood?: 'casual' | 'educational' | 'problem-solving' | 'celebratory' | 'supportive';
  userEngagementLevel?: 'low' | 'medium' | 'high';
  conversationComplexity?: 'simple' | 'intermediate' | 'advanced';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  dietaryComplexity?: 'simple' | 'moderate' | 'complex';
  cookingUrgency?: 'relaxed' | 'moderate' | 'urgent';
}

export interface SmartConversationResponse extends LangChainResponse {
  emotionalTone?: 'encouraging' | 'celebratory' | 'supportive' | 'educational' | 'excited' | 'calm';
  conversationStrategy?: 'teach' | 'guide' | 'celebrate' | 'troubleshoot' | 'inspire' | 'simplify';
  suggestedFollowUps?: string[];
  proactiveSuggestions?: string[];
  complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedEngagementTime?: number; // in minutes
  learningOpportunities?: string[];
  confidenceBoosters?: string[];
}

export class SmartConversationService {
  private langChainService: LangChainConversationService;
  private conversationHistory: Array<{
    timestamp: Date;
    userMessage: string;
    response: SmartConversationResponse;
    context: SmartConversationContext;
  }> = [];

  constructor() {
    this.langChainService = new LangChainConversationService();
  }

  /**
   * Analyze user message for emotional state and conversation needs
   */
  private analyzeUserMessage(message: string, context: SmartConversationContext): {
    emotionalState: string;
    mood: string;
    engagementLevel: string;
    complexity: string;
    urgency: string;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Emotional state detection
    let emotionalState = 'neutral';
    if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || lowerMessage.includes('love')) {
      emotionalState = 'excited';
    } else if (lowerMessage.includes('frustrated') || lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
      emotionalState = 'frustrated';
    } else if (lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('what')) {
      emotionalState = 'curious';
    } else if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much') || lowerMessage.includes('confusing')) {
      emotionalState = 'overwhelmed';
    } else if (lowerMessage.includes('confident') || lowerMessage.includes('easy') || lowerMessage.includes('simple')) {
      emotionalState = 'confident';
    }

    // Conversation mood detection
    let mood = 'casual';
    if (lowerMessage.includes('learn') || lowerMessage.includes('teach') || lowerMessage.includes('explain')) {
      mood = 'educational';
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('help') || lowerMessage.includes('fix')) {
      mood = 'problem-solving';
    } else if (lowerMessage.includes('success') || lowerMessage.includes('great') || lowerMessage.includes('perfect')) {
      mood = 'celebratory';
    } else if (lowerMessage.includes('struggle') || lowerMessage.includes('difficult') || lowerMessage.includes('challenge')) {
      mood = 'supportive';
    }

    // Engagement level detection
    let engagementLevel = 'medium';
    if (message.length > 100 || lowerMessage.includes('detailed') || lowerMessage.includes('comprehensive')) {
      engagementLevel = 'high';
    } else if (message.length < 20 || lowerMessage.includes('quick') || lowerMessage.includes('simple')) {
      engagementLevel = 'low';
    }

    // Complexity detection
    let complexity = 'intermediate';
    if (lowerMessage.includes('beginner') || lowerMessage.includes('easy') || lowerMessage.includes('simple')) {
      complexity = 'simple';
    } else if (lowerMessage.includes('advanced') || lowerMessage.includes('complex') || lowerMessage.includes('professional')) {
      complexity = 'advanced';
    }

    // Urgency detection
    let urgency = 'moderate';
    if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('urgent')) {
      urgency = 'urgent';
    } else if (lowerMessage.includes('relaxed') || lowerMessage.includes('slow') || lowerMessage.includes('leisurely')) {
      urgency = 'relaxed';
    }

    return { emotionalState, mood, engagementLevel, complexity, urgency };
  }

  /**
   * Generate smart follow-up questions based on context
   */
  private generateSmartFollowUps(context: SmartConversationContext, response: LangChainResponse): string[] {
    const followUps: string[] = [];
    
    if (context.userEmotionalState === 'frustrated') {
      followUps.push("Would you like me to break this down into simpler steps?");
      followUps.push("What specific part is giving you trouble?");
      followUps.push("Would you prefer a different approach to this recipe?");
    } else if (context.userEmotionalState === 'excited') {
      followUps.push("What other recipes would you like to try?");
      followUps.push("Would you like to learn some advanced techniques for this dish?");
      followUps.push("Should we plan a whole menu around this recipe?");
    } else if (context.userEmotionalState === 'curious') {
      followUps.push("Would you like to know the science behind this technique?");
      followUps.push("What variations of this recipe interest you?");
      followUps.push("Should I explain the history of this dish?");
    }

    if (context.conversationMood === 'educational') {
      followUps.push("Would you like to learn more about the ingredients?");
      followUps.push("Should I explain the cooking techniques in more detail?");
      followUps.push("What other cooking skills would you like to develop?");
    }

    if (context.userSkillLevel === 'beginner') {
      followUps.push("Would you like some beginner-friendly tips?");
      followUps.push("Should I suggest some easier recipes to start with?");
      followUps.push("What basic techniques would you like to master first?");
    }

    return followUps.slice(0, 3); // Return top 3 most relevant
  }

  /**
   * Generate proactive suggestions based on conversation patterns
   */
  private generateProactiveSuggestions(context: SmartConversationContext): string[] {
    const suggestions: string[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour >= 6 && hour < 12) {
      suggestions.push("Good morning! How about some breakfast inspiration?");
      suggestions.push("Ready to start your day with a delicious meal?");
    } else if (hour >= 12 && hour < 17) {
      suggestions.push("Perfect time for lunch ideas! What are you craving?");
      suggestions.push("How about a quick and healthy lunch recipe?");
    } else if (hour >= 17 && hour < 22) {
      suggestions.push("Dinner time! What kind of cuisine are you in the mood for?");
      suggestions.push("Ready to cook something special for dinner?");
    } else {
      suggestions.push("Late night snack ideas? I've got some great options!");
      suggestions.push("How about some comfort food for this time of day?");
    }

    // Skill-based suggestions
    if (context.userSkillLevel === 'beginner') {
      suggestions.push("Want to try some basic knife skills?");
      suggestions.push("How about learning to make perfect scrambled eggs?");
    } else if (context.userSkillLevel === 'advanced') {
      suggestions.push("Ready for some advanced techniques?");
      suggestions.push("How about mastering the art of fermentation?");
    }

    // Mood-based suggestions
    if (context.conversationMood === 'celebratory') {
      suggestions.push("Let's plan a special celebration menu!");
      suggestions.push("How about some festive cooking ideas?");
    } else if (context.conversationMood === 'problem-solving') {
      suggestions.push("Let's troubleshoot that cooking challenge together!");
      suggestions.push("I have some solutions for common cooking problems!");
    }

    return suggestions.slice(0, 2); // Return top 2 most relevant
  }

  /**
   * Determine the best conversation strategy based on context
   */
  private determineConversationStrategy(context: SmartConversationContext): string {
    if (context.userEmotionalState === 'frustrated') {
      return 'troubleshoot';
    } else if (context.userEmotionalState === 'excited') {
      return 'celebrate';
    } else if (context.conversationMood === 'educational') {
      return 'teach';
    } else if (context.userSkillLevel === 'beginner') {
      return 'guide';
    } else if (context.userEmotionalState === 'overwhelmed') {
      return 'simplify';
    } else {
      return 'inspire';
    }
  }

  /**
   * Generate confidence boosters based on user state
   */
  private generateConfidenceBoosters(context: SmartConversationContext): string[] {
    const boosters: string[] = [];
    
    if (context.userEmotionalState === 'frustrated') {
      boosters.push("Every great chef started exactly where you are now!");
      boosters.push("Cooking is a journey, and you're doing great!");
      boosters.push("Remember, even professional chefs make mistakes - it's how we learn!");
    } else if (context.userSkillLevel === 'beginner') {
      boosters.push("You're taking the first steps into an amazing culinary adventure!");
      boosters.push("Every recipe you try makes you a better cook!");
      boosters.push("Don't worry about perfection - focus on having fun!");
    } else if (context.userEmotionalState === 'excited') {
      boosters.push("Your enthusiasm for cooking is absolutely infectious!");
      boosters.push("I love how excited you are about trying new things!");
      boosters.push("That passion is going to take you far in the kitchen!");
    }

    return boosters.slice(0, 2);
  }

  /**
   * Process a smart conversation with enhanced AI capabilities
   */
  async processSmartMessage(
    userMessage: string,
    context: SmartConversationContext
  ): Promise<SmartConversationResponse> {
    try {
      // Analyze the user message for emotional and contextual cues
      const analysis = this.analyzeUserMessage(userMessage, context);
      
      // Update context with analysis
      const enhancedContext: SmartConversationContext = {
        ...context,
        userEmotionalState: analysis.emotionalState as any,
        conversationMood: analysis.mood as any,
        userEngagementLevel: analysis.engagementLevel as any,
        conversationComplexity: analysis.complexity as any,
        cookingUrgency: analysis.urgency as any,
      };

      // Process with LangChain
      const langChainResponse = await this.langChainService.processMessage(
        userMessage,
        enhancedContext
      );

      // Generate smart enhancements
      const smartFollowUps = this.generateSmartFollowUps(enhancedContext, langChainResponse);
      const proactiveSuggestions = this.generateProactiveSuggestions(enhancedContext);
      const conversationStrategy = this.determineConversationStrategy(enhancedContext);
      const confidenceBoosters = this.generateConfidenceBoosters(enhancedContext);

      // Determine emotional tone
      let emotionalTone: 'encouraging' | 'celebratory' | 'supportive' | 'educational' | 'excited' | 'calm' = 'calm';
      if (enhancedContext.userEmotionalState === 'frustrated') {
        emotionalTone = 'supportive';
      } else if (enhancedContext.userEmotionalState === 'excited') {
        emotionalTone = 'celebratory';
      } else if (enhancedContext.conversationMood === 'educational') {
        emotionalTone = 'educational';
      } else if (enhancedContext.userEmotionalState === 'confident') {
        emotionalTone = 'excited';
      } else {
        emotionalTone = 'encouraging';
      }

      // Estimate engagement time based on complexity and user level
      let estimatedEngagementTime = 5; // default 5 minutes
      if (enhancedContext.conversationComplexity === 'advanced') {
        estimatedEngagementTime = 15;
      } else if (enhancedContext.conversationComplexity === 'intermediate') {
        estimatedEngagementTime = 10;
      }

      if (enhancedContext.userSkillLevel === 'beginner') {
        estimatedEngagementTime += 5; // Extra time for beginners
      }

      // Generate learning opportunities
      const learningOpportunities: string[] = [];
      if (enhancedContext.conversationMood === 'educational') {
        learningOpportunities.push("Understanding cooking techniques");
        learningOpportunities.push("Ingredient knowledge and substitutions");
        learningOpportunities.push("Kitchen safety and organization");
      }

      // Create smart response
      const smartResponse: SmartConversationResponse = {
        ...langChainResponse,
        emotionalTone,
        conversationStrategy: conversationStrategy as any,
        suggestedFollowUps: smartFollowUps,
        proactiveSuggestions: proactiveSuggestions,
        complexityLevel: enhancedContext.conversationComplexity as any,
        estimatedEngagementTime,
        learningOpportunities,
        confidenceBoosters,
      };

      // Store conversation history for learning
      this.conversationHistory.push({
        timestamp: new Date(),
        userMessage,
        response: smartResponse,
        context: enhancedContext,
      });

      // Keep only last 50 conversations to manage memory
      if (this.conversationHistory.length > 50) {
        this.conversationHistory = this.conversationHistory.slice(-50);
      }

      return smartResponse;
    } catch (error) {
      console.error('Error in smart conversation processing:', error);
      
      // Fallback to basic LangChain response
      const fallbackResponse = await this.langChainService.processMessage(userMessage, context);
      return {
        ...fallbackResponse,
        emotionalTone: 'calm',
        conversationStrategy: 'guide',
        suggestedFollowUps: ["How can I help you with your cooking today?"],
        proactiveSuggestions: ["What would you like to cook today?"],
        complexityLevel: 'intermediate',
        estimatedEngagementTime: 5,
        learningOpportunities: [],
        confidenceBoosters: ["You've got this! Let's cook something amazing together!"],
      };
    }
  }

  /**
   * Get conversation insights and patterns
   */
  getConversationInsights(): {
    totalConversations: number;
    averageEngagementTime: number;
    mostCommonEmotionalState: string;
    mostCommonMood: string;
    userSkillProgression: string;
    favoriteTopics: string[];
  } {
    if (this.conversationHistory.length === 0) {
      return {
        totalConversations: 0,
        averageEngagementTime: 0,
        mostCommonEmotionalState: 'neutral',
        mostCommonMood: 'casual',
        userSkillProgression: 'beginner',
        favoriteTopics: [],
      };
    }

    const emotionalStates = this.conversationHistory.map(c => c.context.userEmotionalState || 'neutral');
    const moods = this.conversationHistory.map(c => c.context.conversationMood || 'casual');
    const engagementTimes = this.conversationHistory.map(c => c.response.estimatedEngagementTime || 5);

    // Calculate most common emotional state
    const emotionalStateCounts = emotionalStates.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonEmotionalState = Object.entries(emotionalStateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    // Calculate most common mood
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'casual';

    // Calculate average engagement time
    const averageEngagementTime = engagementTimes.reduce((sum, time) => sum + time, 0) / engagementTimes.length;

    // Analyze skill progression (simplified)
    const recentSkillLevels = this.conversationHistory.slice(-10).map(c => c.context.userSkillLevel || 'beginner');
    const skillProgression = recentSkillLevels.includes('advanced') ? 'advanced' : 
                            recentSkillLevels.includes('intermediate') ? 'intermediate' : 'beginner';

    return {
      totalConversations: this.conversationHistory.length,
      averageEngagementTime: Math.round(averageEngagementTime),
      mostCommonEmotionalState,
      mostCommonMood,
      userSkillProgression: skillProgression,
      favoriteTopics: [], // Could be enhanced with topic analysis
    };
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const smartConversationService = new SmartConversationService();
