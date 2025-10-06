import { BufferWindowMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import { 
  ConversationMemory, 
  ConversationTurn, 
  UserPreference, 
  UserPreferences,
  ConversationSummary,
  ShortTermMemory,
  LongTermMemory
} from "@/lib/types/conversation";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export class LangChainMemoryService {
  private llm: ChatOpenAI;
  private memoryCache: Map<string, BufferWindowMemory> = new Map();

  constructor() {
    // TEMPORARILY DISABLED TO PREVENT LANGCHAIN ERRORS
    console.warn('LangChainMemoryService is temporarily disabled');
    throw new Error('LangChainMemoryService is temporarily disabled. Use basic conversation flow instead.');
    // this.llm = new ChatOpenAI({
    //   modelName: "gpt-3.5-turbo",
    //   temperature: 0.7,
    //   openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    // });
  }

  /**
   * Initialize memory for a user session
   */
  async initializeMemory(userId: string, sessionId: string): Promise<BufferWindowMemory> {
    const memoryKey = `${userId}-${sessionId}`;
    
    if (this.memoryCache.has(memoryKey)) {
      return this.memoryCache.get(memoryKey)!;
    }

    // Create new memory with sliding window of 10 messages
    const memory = new BufferWindowMemory({
      k: 10,
      returnMessages: true,
      inputKey: "input",
      outputKey: "output",
    });

    // Load existing conversation history if available
    await this.loadExistingMemory(memory, userId, sessionId);

    this.memoryCache.set(memoryKey, memory);
    return memory;
  }

  /**
   * Add conversation turn to memory
   */
  async addToMemory(
    memory: BufferWindowMemory, 
    input: string, 
    output: string,
    userId: string,
    sessionId: string
  ): Promise<void> {
    await memory.saveContext({ input }, { output });
    
    // Also persist to Firestore for long-term storage
    await this.persistConversationTurn(userId, sessionId, input, output);
  }

  /**
   * Store user preference in long-term memory
   */
  async storeUserPreference(userId: string, preference: UserPreference): Promise<void> {
    if (!db) {
      console.warn('Firebase not initialized, skipping preference storage');
      return;
    }

    try {
      const userMemoryRef = doc(db, 'userMemory', userId);
      const userMemoryDoc = await getDoc(userMemoryRef);

      if (userMemoryDoc.exists()) {
        const existingData = userMemoryDoc.data();
        const preferences = existingData.preferences || [];
        
        // Update existing preference or add new one
        const existingIndex = preferences.findIndex(
          (p: UserPreference) => p.type === preference.type && p.value === preference.value
        );

        if (existingIndex >= 0) {
          preferences[existingIndex] = { ...preference, lastUpdated: new Date() };
        } else {
          preferences.push({ ...preference, lastUpdated: new Date() });
        }

        await updateDoc(userMemoryRef, {
          preferences,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(userMemoryRef, {
          userId,
          preferences: [{ ...preference, lastUpdated: new Date() }],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error storing user preference:', error);
    }
  }

  /**
   * Retrieve user preferences from long-term memory
   */
  async retrieveUserPreferences(userId: string): Promise<UserPreferences> {
    if (!db) {
      console.warn('Firebase not initialized, returning empty preferences');
      return {};
    }

    try {
      const userMemoryRef = doc(db, 'userMemory', userId);
      const userMemoryDoc = await getDoc(userMemoryRef);

      if (userMemoryDoc.exists()) {
        const data = userMemoryDoc.data();
        const preferences = data.preferences || [];
        
        // Convert stored preferences to UserPreferences format
        const userPreferences: UserPreferences = {
          onboardingCompleted: true,
          dietaryRestrictions: preferences
            .filter((p: UserPreference) => p.type === 'dietary')
            .map((p: UserPreference) => ({
              type: p.value,
              severity: 'moderate' as const,
            })),
          cuisinePreferences: preferences
            .filter((p: UserPreference) => p.type === 'cuisine')
            .map((p: UserPreference) => p.value),
          favoriteIngredients: preferences
            .filter((p: UserPreference) => p.type === 'ingredient' && p.strength > 0.5)
            .map((p: UserPreference) => p.value),
          dislikedIngredients: preferences
            .filter((p: UserPreference) => p.type === 'ingredient' && p.strength < 0.5)
            .map((p: UserPreference) => p.value),
        };

        return userPreferences;
      }

      return {};
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return {};
    }
  }

  /**
   * Summarize conversation for long-term storage
   */
  async summarizeConversation(conversationHistory: ConversationTurn[]): Promise<ConversationSummary> {
    if (conversationHistory.length === 0) {
      throw new Error('No conversation history to summarize');
    }

    // Create a simple summary using the LLM directly
    const fullConversationText = conversationHistory
      .map(turn => `User: ${turn.userMessage}\nAssistant: ${turn.botResponse}`)
      .join('\n\n');

    // Generate summary using the LLM
    const summaryPrompt = `Please summarize this conversation between a user and an AI cooking assistant:\n\n${fullConversationText}\n\nProvide a concise summary of the main topics discussed, recipes mentioned, and user preferences identified.`;
    
    let summary = 'Conversation about cooking and recipes';
    try {
      const result = await this.llm.invoke(summaryPrompt);
      summary = typeof result === 'string' ? result : result.content || summary;
    } catch (error) {
      console.error('Error generating conversation summary:', error);
    }

    // Extract key topics and preferences from conversation
    const keyTopics = this.extractKeyTopics(conversationHistory);
    const learnedPreferences = this.extractPreferences(conversationHistory);
    const recipeInterests = this.extractRecipeInterests(conversationHistory);

    return {
      id: `summary-${Date.now()}`,
      userId: conversationHistory[0]?.id.split('-')[0] || 'unknown',
      dateRange: {
        start: conversationHistory[0].timestamp,
        end: conversationHistory[conversationHistory.length - 1].timestamp,
      },
      keyTopics,
      learnedPreferences,
      recipeInterests,
      summary,
    };
  }

  /**
   * Get relevant memory for context
   */
  async getRelevantMemory(query: string, userId: string): Promise<{
    recentConversations: ConversationTurn[];
    relevantPreferences: UserPreference[];
    conversationSummaries: ConversationSummary[];
  }> {
    if (!db) {
      return {
        recentConversations: [],
        relevantPreferences: [],
        conversationSummaries: [],
      };
    }

    try {
      // Get recent conversations
      const conversationsQuery = query(
        collection(db, 'conversationTurns'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const recentConversations: ConversationTurn[] = [];
      
      conversationsSnapshot.forEach(doc => {
        const data = doc.data();
        recentConversations.push({
          id: doc.id,
          userMessage: data.userMessage,
          botResponse: data.botResponse,
          timestamp: data.timestamp.toDate(),
          intent: data.intent,
          recipes: data.recipes || [],
        });
      });

      // Get user preferences
      const userPreferences = await this.retrieveUserPreferences(userId);
      const relevantPreferences: UserPreference[] = [];

      // Get conversation summaries
      const summariesQuery = query(
        collection(db, 'conversationSummaries'),
        where('userId', '==', userId),
        orderBy('dateRange.end', 'desc'),
        limit(5)
      );
      
      const summariesSnapshot = await getDocs(summariesQuery);
      const conversationSummaries: ConversationSummary[] = [];
      
      summariesSnapshot.forEach(doc => {
        const data = doc.data();
        conversationSummaries.push({
          id: doc.id,
          userId: data.userId,
          dateRange: {
            start: data.dateRange.start.toDate(),
            end: data.dateRange.end.toDate(),
          },
          keyTopics: data.keyTopics || [],
          learnedPreferences: data.learnedPreferences || [],
          recipeInterests: data.recipeInterests || [],
          summary: data.summary,
        });
      });

      return {
        recentConversations,
        relevantPreferences,
        conversationSummaries,
      };
    } catch (error) {
      console.error('Error getting relevant memory:', error);
      return {
        recentConversations: [],
        relevantPreferences: [],
        conversationSummaries: [],
      };
    }
  }

  /**
   * Build complete conversation memory
   */
  async buildConversationMemory(userId: string, sessionId: string): Promise<ConversationMemory> {
    const relevantMemory = await this.getRelevantMemory('', userId);
    const userPreferences = await this.retrieveUserPreferences(userId);

    const shortTermMemory: ShortTermMemory = {
      currentSession: relevantMemory.recentConversations.slice(0, 10),
      recentPreferences: relevantMemory.relevantPreferences.slice(0, 5),
      contextualIngredients: [],
      currentMealContext: {
        mealType: 'dinner',
        servingSize: 2,
        timeConstraints: {
          maxPrepTime: 30,
          maxCookTime: 45,
          urgency: 'medium',
        },
        occasionType: 'casual',
      },
    };

    const longTermMemory: LongTermMemory = {
      dietaryRestrictions: userPreferences.dietaryRestrictions || [],
      favoriteIngredients: userPreferences.favoriteIngredients || [],
      cookingSkillLevel: userPreferences.cookingSkillLevel || 'intermediate',
      preferredCuisines: userPreferences.cuisinePreferences || [],
      healthGoals: userPreferences.healthGoals || [],
      conversationSummaries: relevantMemory.conversationSummaries,
    };

    return {
      shortTermMemory,
      longTermMemory,
      userPreferences,
      conversationHistory: relevantMemory.recentConversations,
    };
  }

  // Private helper methods

  private async loadExistingMemory(
    memory: BufferWindowMemory,
    userId: string,
    sessionId: string
  ): Promise<void> {
    if (!db) return;

    try {
      const conversationsQuery = query(
        collection(db, 'conversationTurns'),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(conversationsQuery);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        await memory.saveContext(
          { input: data.userMessage },
          { output: data.botResponse }
        );
      }
    } catch (error) {
      console.error('Error loading existing memory:', error);
    }
  }

  private async persistConversationTurn(
    userId: string,
    sessionId: string,
    userMessage: string,
    botResponse: string
  ): Promise<void> {
    if (!db) return;

    try {
      const turnRef = doc(collection(db, 'conversationTurns'));
      await setDoc(turnRef, {
        userId,
        sessionId,
        userMessage,
        botResponse,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error persisting conversation turn:', error);
    }
  }

  private extractKeyTopics(conversationHistory: ConversationTurn[]): string[] {
    const topics = new Set<string>();
    
    conversationHistory.forEach(turn => {
      // Simple keyword extraction - in production, use more sophisticated NLP
      const keywords = [
        ...turn.userMessage.toLowerCase().match(/\b(recipe|cooking|ingredient|meal|diet|nutrition|health)\w*\b/g) || [],
        ...turn.botResponse.toLowerCase().match(/\b(recipe|cooking|ingredient|meal|diet|nutrition|health)\w*\b/g) || [],
      ];
      
      keywords.forEach(keyword => topics.add(keyword));
    });

    return Array.from(topics).slice(0, 10);
  }

  private extractPreferences(conversationHistory: ConversationTurn[]): UserPreference[] {
    const preferences: UserPreference[] = [];
    
    conversationHistory.forEach(turn => {
      // Extract dietary preferences
      const dietaryMatches = turn.userMessage.toLowerCase().match(/\b(vegetarian|vegan|gluten.free|dairy.free|keto|paleo)\b/g);
      if (dietaryMatches) {
        dietaryMatches.forEach(match => {
          preferences.push({
            type: 'dietary',
            value: match.replace('.', '-'),
            strength: 0.8,
            lastUpdated: turn.timestamp,
            source: 'explicit',
          });
        });
      }

      // Extract cuisine preferences
      const cuisineMatches = turn.userMessage.toLowerCase().match(/\b(italian|chinese|mexican|indian|thai|japanese|french|mediterranean)\b/g);
      if (cuisineMatches) {
        cuisineMatches.forEach(match => {
          preferences.push({
            type: 'cuisine',
            value: match,
            strength: 0.7,
            lastUpdated: turn.timestamp,
            source: 'explicit',
          });
        });
      }
    });

    return preferences;
  }

  private extractRecipeInterests(conversationHistory: ConversationTurn[]): string[] {
    const interests = new Set<string>();
    
    conversationHistory.forEach(turn => {
      if (turn.recipes && turn.recipes.length > 0) {
        turn.recipes.forEach(recipe => {
          interests.add(recipe.title);
          recipe.tags?.forEach(tag => interests.add(tag));
        });
      }
    });

    return Array.from(interests).slice(0, 20);
  }

  /**
   * Clean up old memory data
   */
  async cleanupMemory(userId: string, daysToKeep: number = 30): Promise<void> {
    if (!db) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // This would require a cloud function in production to handle batch deletes
      console.log(`Memory cleanup for user ${userId} - keeping last ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up memory:', error);
    }
  }
}