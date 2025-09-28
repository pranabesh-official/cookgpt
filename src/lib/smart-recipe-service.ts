import { generatePersonalizedRecipes, Recipe, UserPreferences } from './gemini-service';
import { SmartConversationContext } from './smart-conversation-service';

export interface SmartRecipeContext {
  userPreferences: UserPreferences;
  conversationContext: SmartConversationContext;
  cookingGoals?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeConstraints?: 'quick' | 'moderate' | 'extended';
  mood?: 'comfort' | 'adventure' | 'healthy' | 'indulgent' | 'experimental';
  occasion?: 'weekday' | 'weekend' | 'special' | 'party' | 'date-night';
  availableIngredients?: string[];
  equipment?: string[];
  dietaryComplexity?: 'simple' | 'moderate' | 'complex';
}

export interface SmartRecipe extends Recipe {
  smartMetadata?: {
    difficultyScore: number; // 1-10
    timeScore: number; // 1-10
    skillLevel: string;
    moodMatch: string;
    occasionMatch: string;
    learningValue: number; // 1-10
    confidenceBoost: number; // 1-10
    emotionalAppeal: string[];
    cookingTips: string[];
    variations: string[];
    troubleshooting: string[];
  };
}

export class SmartRecipeService {
  /**
   * Generate smart recipes based on comprehensive context
   */
  async generateSmartRecipes(
    context: SmartRecipeContext,
    count: number = 5
  ): Promise<SmartRecipe[]> {
    try {
      // Analyze conversation context for smart insights
      const smartInsights = this.analyzeConversationContext(context.conversationContext);
      
      // Enhance user preferences with smart context
      const enhancedPreferences = this.enhanceUserPreferences(context.userPreferences, smartInsights);
      
      // Generate base recipes
      const baseRecipes = await generatePersonalizedRecipes(enhancedPreferences, count);
      
      // Enhance each recipe with smart metadata
      const smartRecipes: SmartRecipe[] = await Promise.all(
        baseRecipes.map(recipe => this.enhanceRecipeWithSmartMetadata(recipe, context, smartInsights))
      );
      
      // Sort by smart relevance score
      return this.sortBySmartRelevance(smartRecipes, context);
      
    } catch (error) {
      console.error('Error generating smart recipes:', error);
      throw error;
    }
  }

  /**
   * Analyze conversation context for smart insights
   */
  private analyzeConversationContext(context: SmartConversationContext): {
    emotionalState: string;
    skillLevel: string;
    interests: string[];
    challenges: string[];
    preferences: string[];
    learningGoals: string[];
  } {
    const emotionalState = context.userEmotionalState || 'neutral';
    const skillLevel = context.userSkillLevel || 'intermediate';
    
    // Extract interests from conversation history
    const interests: string[] = [];
    const challenges: string[] = [];
    const preferences: string[] = [];
    const learningGoals: string[] = [];

    // Analyze chat history for patterns
    context.chatHistory?.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Extract interests
      if (content.includes('italian') || content.includes('pasta')) interests.push('Italian cuisine');
      if (content.includes('asian') || content.includes('stir-fry')) interests.push('Asian cuisine');
      if (content.includes('baking') || content.includes('dessert')) interests.push('Baking');
      if (content.includes('grilling') || content.includes('bbq')) interests.push('Grilling');
      if (content.includes('vegetarian') || content.includes('vegan')) interests.push('Plant-based cooking');
      
      // Extract challenges
      if (content.includes('difficult') || content.includes('hard')) challenges.push('Complex techniques');
      if (content.includes('time') || content.includes('quick')) challenges.push('Time management');
      if (content.includes('ingredients') || content.includes('substitute')) challenges.push('Ingredient knowledge');
      
      // Extract preferences
      if (content.includes('spicy') || content.includes('hot')) preferences.push('Spicy food');
      if (content.includes('mild') || content.includes('gentle')) preferences.push('Mild flavors');
      if (content.includes('healthy') || content.includes('nutritious')) preferences.push('Healthy cooking');
      
      // Extract learning goals
      if (content.includes('learn') || content.includes('teach')) learningGoals.push('Skill development');
      if (content.includes('technique') || content.includes('method')) learningGoals.push('Cooking techniques');
    });

    return {
      emotionalState,
      skillLevel,
      interests: [...new Set(interests)],
      challenges: [...new Set(challenges)],
      preferences: [...new Set(preferences)],
      learningGoals: [...new Set(learningGoals)]
    };
  }

  /**
   * Enhance user preferences with smart context
   */
  private enhanceUserPreferences(
    preferences: UserPreferences, 
    insights: any
  ): UserPreferences {
    return {
      ...preferences,
      // Add smart dietary preferences based on conversation
      dietaryRestrictions: [
        ...preferences.dietaryRestrictions,
        ...(insights.preferences.includes('Healthy cooking') ? ['low-sodium', 'high-fiber'] : []),
        ...(insights.preferences.includes('Spicy food') ? [] : ['mild-spice'])
      ],
      // Add smart cuisine preferences
      cuisines: [
        ...preferences.cuisines,
        ...insights.interests.filter((interest: string) => 
          interest.includes('cuisine') || interest.includes('cooking')
        )
      ],
      // Add smart skill level considerations
      skillLevel: insights.skillLevel,
    };
  }

  /**
   * Enhance recipe with smart metadata
   */
  private async enhanceRecipeWithSmartMetadata(
    recipe: Recipe,
    context: SmartRecipeContext,
    insights: any
  ): Promise<SmartRecipe> {
    // Calculate difficulty score (1-10)
    const difficultyScore = this.calculateDifficultyScore(recipe, context);
    
    // Calculate time score (1-10)
    const timeScore = this.calculateTimeScore(recipe, context);
    
    // Determine skill level match
    const skillLevel = this.determineSkillLevel(recipe, context);
    
    // Calculate mood match
    const moodMatch = this.calculateMoodMatch(recipe, context);
    
    // Calculate occasion match
    const occasionMatch = this.calculateOccasionMatch(recipe, context);
    
    // Calculate learning value
    const learningValue = this.calculateLearningValue(recipe, context, insights);
    
    // Calculate confidence boost
    const confidenceBoost = this.calculateConfidenceBoost(recipe, context, insights);
    
    // Generate emotional appeal tags
    const emotionalAppeal = this.generateEmotionalAppeal(recipe, context);
    
    // Generate cooking tips
    const cookingTips = this.generateCookingTips(recipe, context, insights);
    
    // Generate variations
    const variations = this.generateVariations(recipe, context);
    
    // Generate troubleshooting tips
    const troubleshooting = this.generateTroubleshooting(recipe, context, insights);

    return {
      ...recipe,
      smartMetadata: {
        difficultyScore,
        timeScore,
        skillLevel,
        moodMatch,
        occasionMatch,
        learningValue,
        confidenceBoost,
        emotionalAppeal,
        cookingTips,
        variations,
        troubleshooting
      }
    };
  }

  /**
   * Calculate difficulty score based on recipe complexity
   */
  private calculateDifficultyScore(recipe: Recipe, context: SmartRecipeContext): number {
    let score = 5; // Base score
    
    // Adjust based on number of ingredients
    if (recipe.ingredients.length > 15) score += 2;
    else if (recipe.ingredients.length < 5) score -= 1;
    
    // Adjust based on cooking time
    if (recipe.cookingTime && recipe.cookingTime.includes('hour')) score += 2;
    else if (recipe.cookingTime && recipe.cookingTime.includes('minute') && parseInt(recipe.cookingTime) < 30) score -= 1;
    
    // Adjust based on techniques mentioned
    const techniques = ['sauté', 'braise', 'roast', 'grill', 'fry', 'steam', 'poach'];
    const techniqueCount = techniques.filter(technique => 
      recipe.instructions.some(instruction => instruction.toLowerCase().includes(technique))
    ).length;
    score += techniqueCount;
    
    // Adjust based on user skill level
    if (context.skillLevel === 'beginner') score = Math.min(score, 6);
    else if (context.skillLevel === 'expert') score = Math.max(score, 4);
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Calculate time score based on recipe duration
   */
  private calculateTimeScore(recipe: Recipe, context: SmartRecipeContext): number {
    let score = 5; // Base score
    
    // Extract cooking time
    const cookingTime = recipe.cookingTime || '';
    const timeMatch = cookingTime.match(/(\d+)/);
    const timeMinutes = timeMatch ? parseInt(timeMatch[1]) : 30;
    
    // Adjust based on actual time
    if (timeMinutes < 15) score = 2;
    else if (timeMinutes < 30) score = 4;
    else if (timeMinutes < 60) score = 6;
    else if (timeMinutes < 120) score = 8;
    else score = 10;
    
    // Adjust based on user time constraints
    if (context.timeConstraints === 'quick') score = Math.min(score, 4);
    else if (context.timeConstraints === 'extended') score = Math.max(score, 6);
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Determine skill level match
   */
  private determineSkillLevel(recipe: Recipe, context: SmartRecipeContext): string {
    const difficultyScore = this.calculateDifficultyScore(recipe, context);
    
    if (difficultyScore <= 3) return 'beginner';
    else if (difficultyScore <= 6) return 'intermediate';
    else if (difficultyScore <= 8) return 'advanced';
    else return 'expert';
  }

  /**
   * Calculate mood match
   */
  private calculateMoodMatch(recipe: Recipe, context: SmartRecipeContext): string {
    const mood = context.mood || 'comfort';
    const recipeName = recipe.name.toLowerCase();
    const description = recipe.description?.toLowerCase() || '';
    
    // Comfort food indicators
    if (mood === 'comfort' && (
      recipeName.includes('soup') || 
      recipeName.includes('stew') || 
      recipeName.includes('pasta') ||
      description.includes('comforting') ||
      description.includes('hearty')
    )) return 'high';
    
    // Adventure food indicators
    if (mood === 'adventure' && (
      recipeName.includes('exotic') ||
      recipeName.includes('spicy') ||
      description.includes('unusual') ||
      description.includes('unique')
    )) return 'high';
    
    // Healthy food indicators
    if (mood === 'healthy' && (
      recipeName.includes('salad') ||
      recipeName.includes('grilled') ||
      description.includes('healthy') ||
      description.includes('nutritious')
    )) return 'high';
    
    return 'medium';
  }

  /**
   * Calculate occasion match
   */
  private calculateOccasionMatch(recipe: Recipe, context: SmartRecipeContext): string {
    const occasion = context.occasion || 'weekday';
    const cookingTime = recipe.cookingTime || '';
    
    // Weekday indicators (quick, simple)
    if (occasion === 'weekday' && (
      cookingTime.includes('15') ||
      cookingTime.includes('30') ||
      recipe.name.toLowerCase().includes('quick')
    )) return 'high';
    
    // Weekend indicators (more elaborate)
    if (occasion === 'weekend' && (
      cookingTime.includes('hour') ||
      recipe.ingredients.length > 10
    )) return 'high';
    
    // Special occasion indicators
    if (occasion === 'special' && (
      recipe.name.toLowerCase().includes('special') ||
      recipe.description?.toLowerCase().includes('elegant') ||
      recipe.description?.toLowerCase().includes('fancy')
    )) return 'high';
    
    return 'medium';
  }

  /**
   * Calculate learning value
   */
  private calculateLearningValue(recipe: Recipe, context: SmartRecipeContext, insights: any): number {
    let score = 5; // Base score
    
    // Increase if user wants to learn
    if (insights.learningGoals.includes('Skill development')) score += 2;
    if (insights.learningGoals.includes('Cooking techniques')) score += 2;
    
    // Increase based on new techniques
    const newTechniques = this.identifyNewTechniques(recipe, context);
    score += newTechniques.length;
    
    // Increase based on ingredient variety
    const uniqueIngredients = new Set(recipe.ingredients.map(ing => ing.name.toLowerCase()));
    if (uniqueIngredients.size > 8) score += 1;
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Calculate confidence boost
   */
  private calculateConfidenceBoost(recipe: Recipe, context: SmartRecipeContext, insights: any): number {
    let score = 5; // Base score
    
    // Increase if user is frustrated
    if (insights.emotionalState === 'frustrated') score += 2;
    
    // Increase for beginner-friendly recipes
    if (context.skillLevel === 'beginner' && this.calculateDifficultyScore(recipe, context) <= 4) score += 2;
    
    // Increase if recipe matches user interests
    const interestMatch = insights.interests.some((interest: string) => 
      recipe.name.toLowerCase().includes(interest.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(interest.toLowerCase())
    );
    if (interestMatch) score += 1;
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Generate emotional appeal tags
   */
  private generateEmotionalAppeal(recipe: Recipe, context: SmartRecipeContext): string[] {
    const appeals: string[] = [];
    const recipeName = recipe.name.toLowerCase();
    const description = recipe.description?.toLowerCase() || '';
    
    // Comfort appeals
    if (recipeName.includes('soup') || recipeName.includes('stew') || description.includes('comforting')) {
      appeals.push('Comforting', 'Warm', 'Nostalgic');
    }
    
    // Adventure appeals
    if (recipeName.includes('spicy') || description.includes('exotic') || description.includes('unique')) {
      appeals.push('Adventurous', 'Exciting', 'Bold');
    }
    
    // Healthy appeals
    if (recipeName.includes('salad') || description.includes('healthy') || description.includes('fresh')) {
      appeals.push('Fresh', 'Vibrant', 'Energizing');
    }
    
    // Indulgent appeals
    if (recipeName.includes('chocolate') || recipeName.includes('cheese') || description.includes('rich')) {
      appeals.push('Indulgent', 'Decadent', 'Satisfying');
    }
    
    return appeals.slice(0, 3); // Return top 3
  }

  /**
   * Generate cooking tips
   */
  private generateCookingTips(recipe: Recipe, context: SmartRecipeContext, insights: any): string[] {
    const tips: string[] = [];
    
    // Skill-based tips
    if (context.skillLevel === 'beginner') {
      tips.push('Read through all instructions before starting');
      tips.push('Prepare all ingredients before cooking (mise en place)');
      tips.push('Taste and adjust seasoning as you go');
    }
    
    // Technique-specific tips
    if (recipe.instructions.some(inst => inst.toLowerCase().includes('sauté'))) {
      tips.push('Keep the pan hot and don\'t overcrowd it');
    }
    if (recipe.instructions.some(inst => inst.toLowerCase().includes('roast'))) {
      tips.push('Preheat the oven and use a meat thermometer');
    }
    
    // Challenge-specific tips
    if (insights.challenges.includes('Time management')) {
      tips.push('Prep ingredients the night before to save time');
    }
    if (insights.challenges.includes('Complex techniques')) {
      tips.push('Take it one step at a time and don\'t rush');
    }
    
    return tips.slice(0, 3); // Return top 3
  }

  /**
   * Generate recipe variations
   */
  private generateVariations(recipe: Recipe, context: SmartRecipeContext): string[] {
    const variations: string[] = [];
    
    // Dietary variations
    if (context.userPreferences.dietaryRestrictions.includes('vegetarian')) {
      variations.push('Try with plant-based protein instead of meat');
    }
    if (context.userPreferences.dietaryRestrictions.includes('gluten-free')) {
      variations.push('Use gluten-free flour or pasta');
    }
    
    // Cuisine variations
    if (context.userPreferences.cuisines.includes('Italian')) {
      variations.push('Add Italian herbs like basil and oregano');
    }
    if (context.userPreferences.cuisines.includes('Asian')) {
      variations.push('Add soy sauce and ginger for an Asian twist');
    }
    
    // Skill level variations
    if (context.skillLevel === 'advanced') {
      variations.push('Try the advanced technique version');
    }
    
    return variations.slice(0, 3); // Return top 3
  }

  /**
   * Generate troubleshooting tips
   */
  private generateTroubleshooting(recipe: Recipe, context: SmartRecipeContext, insights: any): string[] {
    const troubleshooting: string[] = [];
    
    // Common issues
    troubleshooting.push('If it\'s too salty, add a pinch of sugar');
    troubleshooting.push('If it\'s too spicy, add dairy or acid');
    troubleshooting.push('If it\'s too dry, add more liquid');
    
    // Skill-specific issues
    if (context.skillLevel === 'beginner') {
      troubleshooting.push('If you burn something, don\'t panic - start over');
      troubleshooting.push('If timing is off, focus on one thing at a time');
    }
    
    return troubleshooting.slice(0, 3); // Return top 3
  }

  /**
   * Identify new techniques in recipe
   */
  private identifyNewTechniques(recipe: Recipe, context: SmartRecipeContext): string[] {
    const techniques = ['sauté', 'braise', 'roast', 'grill', 'fry', 'steam', 'poach', 'blanch', 'caramelize'];
    const recipeText = recipe.instructions.join(' ').toLowerCase();
    
    return techniques.filter(technique => recipeText.includes(technique));
  }

  /**
   * Sort recipes by smart relevance score
   */
  private sortBySmartRelevance(recipes: SmartRecipe[], context: SmartRecipeContext): SmartRecipe[] {
    return recipes.sort((a, b) => {
      if (!a.smartMetadata || !b.smartMetadata) return 0;
      
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, context);
      const scoreB = this.calculateRelevanceScore(b, context);
      
      return scoreB - scoreA; // Higher score first
    });
  }

  /**
   * Calculate relevance score for a recipe
   */
  private calculateRelevanceScore(recipe: SmartRecipe, context: SmartRecipeContext): number {
    if (!recipe.smartMetadata) return 0;
    
    const { smartMetadata } = recipe;
    let score = 0;
    
    // Weight different factors
    score += smartMetadata.confidenceBoost * 0.3; // 30% weight
    score += (10 - smartMetadata.difficultyScore) * 0.2; // 20% weight (easier = better for most users)
    score += smartMetadata.learningValue * 0.2; // 20% weight
    score += (10 - smartMetadata.timeScore) * 0.15; // 15% weight (faster = better for most users)
    score += smartMetadata.moodMatch === 'high' ? 10 : 5; // 10% weight
    score += smartMetadata.occasionMatch === 'high' ? 10 : 5; // 5% weight
    
    return score;
  }
}

// Export singleton instance
export const smartRecipeService = new SmartRecipeService();
