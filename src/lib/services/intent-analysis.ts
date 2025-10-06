import { 
  UserIntent, 
  ConversationContext, 
  IntentType, 
  ExtractedEntity 
} from "@/lib/types/conversation";

export class IntentAnalysisService {
  private intentPatterns: Map<IntentType, RegExp[]>;
  private entityPatterns: Map<string, RegExp>;

  constructor() {
    this.initializePatterns();
  }

  /**
   * Analyze user intent from message and context
   */
  async analyzeIntent(message: string, context: ConversationContext): Promise<UserIntent> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Determine intent type
    const intentType = this.classifyIntent(normalizedMessage, context);
    
    // Extract entities
    const entities = this.extractEntities(normalizedMessage);
    
    // Determine recipe count preference
    const recipeCountPreference = this.extractRecipeCountPreference(normalizedMessage);
    
    // Extract specific requirements
    const specificRequirements = this.extractSpecificRequirements(normalizedMessage, entities);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(intentType, entities, normalizedMessage);

    return {
      type: intentType,
      confidence,
      entities,
      recipeCountPreference,
      specificRequirements,
    };
  }

  /**
   * Classify the intent type based on message patterns
   */
  private classifyIntent(message: string, context: ConversationContext): IntentType {
    const scores: Map<IntentType, number> = new Map();

    // Check each intent type against patterns
    for (const [intentType, patterns] of this.intentPatterns.entries()) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          score += 1;
        }
      }
      scores.set(intentType, score);
    }

    // Consider context for intent classification
    this.adjustScoresWithContext(scores, message, context);

    // Return the intent with highest score
    let maxScore = 0;
    let bestIntent: IntentType = 'recipe_request';

    for (const [intent, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    return bestIntent;
  }

  /**
   * Extract entities from the message
   */
  private extractEntities(message: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    for (const [entityType, pattern] of this.entityPatterns.entries()) {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: entityType as any,
            value: match.trim(),
            confidence: 0.8,
          });
        });
      }
    }

    return entities;
  }

  /**
   * Extract recipe count preference from message
   */
  private extractRecipeCountPreference(message: string): number {
    // Look for explicit numbers
    const numberMatches = message.match(/\b(\d+)\s*(recipe|option|idea|suggestion)s?\b/i);
    if (numberMatches) {
      const count = parseInt(numberMatches[1]);
      return Math.min(Math.max(count, 1), 7); // Clamp between 1-7
    }

    // Look for quantity words
    if (/\b(a|one|single)\b/i.test(message)) return 1;
    if (/\b(couple|two|pair)\b/i.test(message)) return 2;
    if (/\b(few|several|some)\b/i.test(message)) return 3;
    if (/\b(many|lots|bunch|variety)\b/i.test(message)) return 5;
    if (/\b(all|everything|comprehensive|extensive)\b/i.test(message)) return 7;

    return 0; // No preference specified
  }

  /**
   * Extract specific requirements from message
   */
  private extractSpecificRequirements(message: string, entities: ExtractedEntity[]): string[] {
    const requirements: string[] = [];

    // Time-based requirements
    if (/\b(quick|fast|rapid|speedy|hurry)\b/i.test(message)) {
      requirements.push('quick preparation');
    }
    if (/\b(slow|leisurely|weekend|elaborate)\b/i.test(message)) {
      requirements.push('elaborate preparation');
    }

    // Difficulty requirements
    if (/\b(easy|simple|basic|beginner)\b/i.test(message)) {
      requirements.push('easy difficulty');
    }
    if (/\b(challenging|advanced|complex|professional)\b/i.test(message)) {
      requirements.push('advanced difficulty');
    }

    // Health requirements
    if (/\b(healthy|nutritious|wholesome|clean)\b/i.test(message)) {
      requirements.push('healthy options');
    }
    if (/\b(low.calorie|diet|weight.loss)\b/i.test(message)) {
      requirements.push('low calorie');
    }

    // Cooking method requirements
    if (/\b(baked?|baking|oven)\b/i.test(message)) {
      requirements.push('baked dishes');
    }
    if (/\b(grilled?|grilling|bbq)\b/i.test(message)) {
      requirements.push('grilled dishes');
    }
    if (/\b(fried?|frying|pan.fried)\b/i.test(message)) {
      requirements.push('fried dishes');
    }

    // Add entity-based requirements
    entities.forEach(entity => {
      if (entity.type === 'ingredient') {
        requirements.push(`using ${entity.value}`);
      }
      if (entity.type === 'cuisine') {
        requirements.push(`${entity.value} cuisine`);
      }
    });

    return requirements;
  }

  /**
   * Calculate confidence score for the intent classification
   */
  private calculateConfidence(
    intentType: IntentType, 
    entities: ExtractedEntity[], 
    message: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on pattern matches
    const patterns = this.intentPatterns.get(intentType) || [];
    const matchCount = patterns.filter(pattern => pattern.test(message)).length;
    confidence += matchCount * 0.1;

    // Boost confidence based on entity extraction
    confidence += entities.length * 0.05;

    // Boost confidence for specific keywords
    if (intentType === 'recipe_request' && /\b(recipe|cook|make|prepare)\b/i.test(message)) {
      confidence += 0.2;
    }

    // Reduce confidence for ambiguous messages
    if (message.length < 10) {
      confidence -= 0.2;
    }

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  /**
   * Adjust intent scores based on conversation context
   */
  private adjustScoresWithContext(
    scores: Map<IntentType, number>,
    message: string,
    context: ConversationContext
  ): void {
    // If user has dietary restrictions, boost dietary modification intent
    if (context.userPreferences.dietaryRestrictions?.length > 0) {
      if (/\b(modify|change|adapt|substitute)\b/i.test(message)) {
        scores.set('dietary_modification', (scores.get('dietary_modification') || 0) + 1);
      }
    }

    // If it's meal time, boost recipe requests
    const currentHour = new Date().getHours();
    if ((currentHour >= 11 && currentHour <= 13) || (currentHour >= 17 && currentHour <= 20)) {
      scores.set('recipe_request', (scores.get('recipe_request') || 0) + 0.5);
    }

    // If user mentioned ingredients in context, boost ingredient-based cooking
    if (context.availableIngredients.length > 0) {
      scores.set('ingredient_based_cooking', (scores.get('ingredient_based_cooking') || 0) + 1);
    }

    // If user has health goals, boost nutritional advice
    if (context.nutritionalGoals.length > 0) {
      if (/\b(nutrition|health|diet|calories|macro)\b/i.test(message)) {
        scores.set('nutritional_advice', (scores.get('nutritional_advice') || 0) + 1);
      }
    }
  }

  /**
   * Initialize intent and entity patterns
   */
  private initializePatterns(): void {
    this.intentPatterns = new Map([
      ['recipe_request', [
        /\b(recipe|cook|make|prepare|dish|meal)\b/i,
        /\b(what (can|should) i (cook|make|prepare))\b/i,
        /\b(show me|give me|find me|suggest)\b.*\b(recipe|dish)\b/i,
        /\b(i want to (cook|make|prepare))\b/i,
      ]],
      ['ingredient_based_cooking', [
        /\b(i have|using|with|from)\b.*\b(ingredient|chicken|beef|vegetable)\b/i,
        /\b(what can i make with|cook with|use)\b/i,
        /\b(leftover|remaining|available)\b.*\b(ingredient|food)\b/i,
        /\b(in my (fridge|pantry|kitchen))\b/i,
      ]],
      ['nutritional_advice', [
        /\b(nutrition|nutritional|healthy|health|diet|calorie|macro|vitamin|mineral)\b/i,
        /\b(lose weight|gain weight|build muscle|heart health)\b/i,
        /\b(is.*healthy|nutritional value|health benefit)\b/i,
        /\b(dietitian|nutritionist|diet plan)\b/i,
      ]],
      ['cooking_technique_help', [
        /\b(how to (cook|prepare|make)|cooking (method|technique|tip))\b/i,
        /\b(sauté|braise|roast|grill|steam|boil|fry|bake)\b/i,
        /\b(cooking (time|temperature)|how long|what temperature)\b/i,
        /\b(technique|method|skill|tip|trick)\b/i,
      ]],
      ['meal_planning', [
        /\b(meal plan|weekly plan|menu|planning)\b/i,
        /\b(week of (meals|food)|meal prep|batch cook)\b/i,
        /\b(plan my (meals|week|menu))\b/i,
        /\b(grocery list|shopping list)\b/i,
      ]],
      ['dietary_modification', [
        /\b(modify|change|adapt|substitute|replace|alternative)\b/i,
        /\b(make it (vegan|vegetarian|gluten.free|dairy.free))\b/i,
        /\b(without|instead of|substitute for)\b/i,
        /\b(allergy|intolerance|restriction|can't eat)\b/i,
      ]],
      ['cooking_troubleshooting', [
        /\b(help|problem|issue|wrong|failed|disaster)\b/i,
        /\b(overcooked|undercooked|burnt|soggy|dry|tough)\b/i,
        /\b(went wrong|didn't work|fix|save|rescue)\b/i,
        /\b(why (did|is)|what happened|troubleshoot)\b/i,
      ]],
    ]);

    this.entityPatterns = new Map([
      ['ingredient', /\b(chicken|beef|pork|fish|salmon|shrimp|tofu|eggs|rice|pasta|potato|tomato|onion|garlic|cheese|milk|flour|sugar|salt|pepper|oil|butter|herbs?|spices?|vegetables?|fruits?)\b/gi],
      ['cuisine', /\b(italian|chinese|mexican|indian|thai|japanese|french|mediterranean|american|korean|vietnamese|greek|spanish|moroccan|lebanese)\b/gi],
      ['meal_type', /\b(breakfast|lunch|dinner|snack|dessert|appetizer|brunch|supper)\b/gi],
      ['cooking_method', /\b(bake|baking|roast|roasting|grill|grilling|fry|frying|sauté|sautéing|steam|steaming|boil|boiling|simmer|simmering|braise|braising|stir.fry)\b/gi],
      ['dietary_restriction', /\b(vegetarian|vegan|gluten.free|dairy.free|nut.free|keto|paleo|low.carb|low.fat|low.sodium|sugar.free)\b/gi],
    ]);
  }

  /**
   * Update patterns based on user feedback (for future enhancement)
   */
  updatePatterns(intentType: IntentType, newPattern: string, isPositive: boolean): void {
    // This could be used for machine learning improvements
    console.log(`Pattern feedback: ${intentType} - ${newPattern} - ${isPositive ? 'positive' : 'negative'}`);
  }

  /**
   * Get intent confidence threshold
   */
  getConfidenceThreshold(intentType: IntentType): number {
    const thresholds: Map<IntentType, number> = new Map([
      ['recipe_request', 0.6],
      ['ingredient_based_cooking', 0.7],
      ['nutritional_advice', 0.8],
      ['cooking_technique_help', 0.7],
      ['meal_planning', 0.8],
      ['dietary_modification', 0.8],
      ['cooking_troubleshooting', 0.7],
    ]);

    return thresholds.get(intentType) || 0.7;
  }
}