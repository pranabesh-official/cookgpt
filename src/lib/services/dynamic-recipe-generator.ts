import { 
  Recipe, 
  ConversationContext, 
  UserPreferences,
  EnhancedIngredient,
  EnhancedInstruction,
  NutritionalAnalysis,
  ChefTip,
  CookingTechnique,
  SkillLevel,
  MealType,
  TimeConstraint,
  DifficultyLevel,
  NutritionalGoal
} from "@/lib/types/conversation";
import { generatePersonalizedRecipes, isGeminiAvailable } from "@/lib/gemini-service";

export interface RecipeRequest {
  query: string;
  ingredients?: string[];
  mealType?: MealType;
  timeConstraints?: TimeConstraint;
  servingSize?: number;
  difficultyPreference?: SkillLevel;
  nutritionalGoals?: NutritionalGoal[];
}

export class DynamicRecipeGenerator {
  private nutritionalDatabase: Map<string, any>;
  private cookingTechniques: Map<string, CookingTechnique>;

  constructor() {
    this.initializeNutritionalDatabase();
    this.initializeCookingTechniques();
  }

  /**
   * Generate recipes with dynamic count based on context
   */
  async generateRecipes(
    request: RecipeRequest,
    context: ConversationContext,
    recipeCount: number = 3
  ): Promise<Recipe[]> {
    try {
      // Validate Gemini availability
      if (!isGeminiAvailable()) {
        console.warn('Gemini not available, using fallback recipe generation');
        return this.generateFallbackRecipes(request, context, recipeCount);
      }

      // Build enhanced prompt for recipe generation
      const enhancedPrompt = this.buildEnhancedPrompt(request, context, recipeCount);

      // Generate base recipes using existing Gemini service
      const baseRecipes = await generatePersonalizedRecipes(context.userPreferences, recipeCount);

      // Enhance recipes with professional insights
      const enhancedRecipes = await Promise.all(
        baseRecipes.map(recipe => this.enhanceRecipe(recipe, request, context))
      );

      return enhancedRecipes;
    } catch (error) {
      console.error('Error generating recipes:', error);
      return this.generateFallbackRecipes(request, context, recipeCount);
    }
  }

  /**
   * Generate recipes from available ingredients
   */
  async generateFromIngredients(
    ingredients: string[],
    preferences: UserPreferences,
    recipeCount: number = 3
  ): Promise<Recipe[]> {
    try {
      // Create ingredient-focused prompt
      const ingredientPrompt = this.buildIngredientPrompt(ingredients, preferences, recipeCount);

      // Generate recipes using Gemini with ingredient focus
      const recipes = await generatePersonalizedRecipes(preferences, recipeCount);

      // Filter and enhance recipes to focus on available ingredients
      const ingredientFocusedRecipes = recipes.map(recipe => 
        this.adaptRecipeForIngredients(recipe, ingredients, preferences)
      );

      return ingredientFocusedRecipes;
    } catch (error) {
      console.error('Error generating ingredient-based recipes:', error);
      return this.generateIngredientFallbackRecipes(ingredients, preferences, recipeCount);
    }
  }

  /**
   * Customize recipe based on user preferences
   */
  async customizeRecipe(baseRecipe: Recipe, preferences: UserPreferences): Promise<Recipe> {
    const customizedRecipe = { ...baseRecipe };

    // Apply dietary restrictions
    if (preferences.dietaryRestrictions) {
      customizedRecipe.ingredients = this.adaptIngredientsForDiet(
        customizedRecipe.ingredients,
        preferences.dietaryRestrictions
      );
    }

    // Adjust difficulty based on skill level
    if (preferences.cookingSkillLevel) {
      customizedRecipe.instructions = this.adjustInstructionsForSkill(
        customizedRecipe.instructions,
        preferences.cookingSkillLevel
      );
    }

    // Add health-focused modifications
    if (preferences.healthGoals) {
      customizedRecipe.nutritionalInfo = await this.optimizeNutritionForGoals(
        customizedRecipe,
        preferences.healthGoals
      );
    }

    return customizedRecipe;
  }

  /**
   * Enhance recipe with professional insights
   */
  private async enhanceRecipe(
    baseRecipe: Recipe,
    request: RecipeRequest,
    context: ConversationContext
  ): Promise<Recipe> {
    const enhanced: Recipe = {
      ...baseRecipe,
      ingredients: this.enhanceIngredients(baseRecipe.ingredients || []),
      instructions: this.enhanceInstructions(baseRecipe.instructions || []),
      nutritionalInfo: await this.calculateNutritionalInfo(baseRecipe),
      chefTips: this.generateChefTips(baseRecipe, context.userPreferences.cookingSkillLevel),
      cookingTechniques: this.identifyCookingTechniques(baseRecipe),
      equipmentRecommendations: this.generateEquipmentRecommendations(baseRecipe),
      substitutions: this.generateSubstitutions(baseRecipe, context.userPreferences),
      scalingOptions: this.generateScalingOptions(baseRecipe),
      flavorVariations: this.generateFlavorVariations(baseRecipe),
      generationContext: {
        prompt: request.query,
        userPreferences: context.userPreferences,
        constraints: context.cookingConstraints,
        timestamp: new Date(),
      },
      confidenceScore: this.calculateRecipeConfidence(baseRecipe, request, context),
    };

    return enhanced;
  }

  /**
   * Enhance ingredients with detailed information
   */
  private enhanceIngredients(ingredients: string[]): EnhancedIngredient[] {
    return ingredients.map((ingredient, index) => {
      const [amount, ...nameParts] = ingredient.split(' ');
      const name = nameParts.join(' ');
      
      return {
        name: name || ingredient,
        amount: amount || '1',
        unit: this.extractUnit(ingredient),
        category: this.categorizeIngredient(name || ingredient),
        nutritionalValue: this.getNutritionalValue(name || ingredient),
        seasonality: this.getSeasonalInfo(name || ingredient),
        substitutions: this.getIngredientSubstitutions(name || ingredient),
        preparationNotes: this.getPreparationNotes(name || ingredient),
      };
    });
  }

  /**
   * Enhance instructions with professional details
   */
  private enhanceInstructions(instructions: string[]): EnhancedInstruction[] {
    return instructions.map((instruction, index) => ({
      step: index + 1,
      instruction,
      technique: this.identifyTechnique(instruction),
      timeEstimate: this.estimateStepTime(instruction),
      temperature: this.extractTemperature(instruction),
      visualCues: this.generateVisualCues(instruction),
      commonMistakes: this.getCommonMistakes(instruction),
      chefTips: this.getStepSpecificTips(instruction),
    }));
  }

  /**
   * Calculate nutritional information
   */
  private async calculateNutritionalInfo(recipe: Recipe): Promise<NutritionalAnalysis> {
    // This would integrate with a nutritional database in production
    const baseCalories = this.estimateCalories(recipe.ingredients || []);
    
    return {
      calories: baseCalories,
      macronutrients: {
        protein: Math.round(baseCalories * 0.15 / 4), // 15% protein
        carbohydrates: Math.round(baseCalories * 0.55 / 4), // 55% carbs
        fat: Math.round(baseCalories * 0.30 / 9), // 30% fat
        fiber: Math.round(baseCalories * 0.02), // Estimated fiber
      },
      micronutrients: this.estimateMicronutrients(recipe.ingredients || []),
      healthScore: this.calculateHealthScore(recipe),
      dietaryFiberContent: Math.round(baseCalories * 0.02),
      sodiumContent: this.estimateSodium(recipe.ingredients || []),
      sugarContent: this.estimateSugar(recipe.ingredients || []),
      healthBenefits: this.identifyHealthBenefits(recipe.ingredients || []),
      nutritionalWarnings: this.identifyNutritionalWarnings(recipe),
    };
  }

  /**
   * Generate chef tips for the recipe
   */
  private generateChefTips(recipe: Recipe, skillLevel?: SkillLevel): ChefTip[] {
    const tips: ChefTip[] = [];

    // Add skill-appropriate tips
    if (skillLevel === 'beginner') {
      tips.push({
        category: 'preparation',
        tip: 'Read through the entire recipe before starting to ensure you have all ingredients and understand each step.',
        reasoning: 'Preparation prevents mistakes and ensures smooth cooking flow.',
      });
    }

    // Add ingredient-specific tips
    const ingredients = recipe.ingredients || [];
    if (ingredients.some(ing => typeof ing === 'string' ? ing.includes('garlic') : ing.name.includes('garlic'))) {
      tips.push({
        category: 'preparation',
        tip: 'Crush garlic with the flat side of your knife before mincing to release more flavor.',
        reasoning: 'Crushing breaks down cell walls, releasing more aromatic compounds.',
      });
    }

    // Add cooking method tips
    if (recipe.instructions?.some(inst => typeof inst === 'string' ? inst.includes('sauté') : inst.instruction.includes('sauté'))) {
      tips.push({
        category: 'cooking',
        tip: 'Heat the pan before adding oil, and heat the oil before adding ingredients for better searing.',
        reasoning: 'Proper heating prevents sticking and ensures even cooking.',
      });
    }

    return tips.slice(0, 3); // Limit to 3 most relevant tips
  }

  /**
   * Identify cooking techniques used in the recipe
   */
  private identifyCookingTechniques(recipe: Recipe): CookingTechnique[] {
    const techniques: CookingTechnique[] = [];
    const instructions = recipe.instructions || [];

    // Analyze instructions for techniques
    instructions.forEach(instruction => {
      const instText = typeof instruction === 'string' ? instruction : instruction.instruction;
      
      if (/sauté|pan.fry/i.test(instText)) {
        techniques.push(this.cookingTechniques.get('sauté') || this.getDefaultTechnique('sauté'));
      }
      if (/roast|bake/i.test(instText)) {
        techniques.push(this.cookingTechniques.get('roast') || this.getDefaultTechnique('roast'));
      }
      if (/braise/i.test(instText)) {
        techniques.push(this.cookingTechniques.get('braise') || this.getDefaultTechnique('braise'));
      }
    });

    return Array.from(new Set(techniques)); // Remove duplicates
  }

  /**
   * Build enhanced prompt for recipe generation
   */
  private buildEnhancedPrompt(
    request: RecipeRequest,
    context: ConversationContext,
    recipeCount: number
  ): string {
    let prompt = `As a professional chef and dietitian, create ${recipeCount} personalized recipe${recipeCount > 1 ? 's' : ''} for: ${request.query}`;

    // Add user preferences
    if (context.userPreferences.dietaryRestrictions?.length) {
      prompt += `\nDietary restrictions: ${context.userPreferences.dietaryRestrictions.map(r => r.type).join(', ')}`;
    }

    if (context.userPreferences.cookingSkillLevel) {
      prompt += `\nCooking skill level: ${context.userPreferences.cookingSkillLevel}`;
    }

    // Add constraints
    if (request.timeConstraints) {
      prompt += `\nTime constraints: max ${request.timeConstraints.maxPrepTime} min prep, ${request.timeConstraints.maxCookTime} min cooking`;
    }

    if (request.ingredients?.length) {
      prompt += `\nAvailable ingredients: ${request.ingredients.join(', ')}`;
    }

    // Add nutritional goals
    if (context.nutritionalGoals.length) {
      prompt += `\nNutritional goals: ${context.nutritionalGoals.map(g => g.type).join(', ')}`;
    }

    prompt += `\n\nFor each recipe, provide detailed nutritional information, professional cooking tips, and technique explanations appropriate for the user's skill level.`;

    return prompt;
  }

  /**
   * Build ingredient-focused prompt
   */
  private buildIngredientPrompt(
    ingredients: string[],
    preferences: UserPreferences,
    recipeCount: number
  ): string {
    let prompt = `Create ${recipeCount} recipe${recipeCount > 1 ? 's' : ''} using primarily these ingredients: ${ingredients.join(', ')}`;

    if (preferences.dietaryRestrictions?.length) {
      prompt += `\nMust accommodate: ${preferences.dietaryRestrictions.map(r => r.type).join(', ')}`;
    }

    prompt += `\nYou may add common pantry staples (salt, pepper, oil, herbs, spices) as needed.`;
    prompt += `\nFocus on maximizing the use of the provided ingredients while creating delicious, balanced meals.`;

    return prompt;
  }

  /**
   * Generate fallback recipes when Gemini is unavailable
   */
  private generateFallbackRecipes(
    request: RecipeRequest,
    context: ConversationContext,
    recipeCount: number
  ): Recipe[] {
    const fallbackRecipes: Recipe[] = [];

    // Generate simple fallback recipes based on request
    for (let i = 0; i < recipeCount; i++) {
      fallbackRecipes.push({
        title: `Simple ${request.mealType || 'Dish'} Recipe ${i + 1}`,
        description: `A delicious ${request.mealType || 'dish'} recipe tailored to your preferences.`,
        ingredients: this.generateFallbackIngredients(request),
        instructions: this.generateFallbackInstructions(request),
        cookingTime: request.timeConstraints?.maxCookTime ? `${request.timeConstraints.maxCookTime} minutes` : '30 minutes',
        prepTime: request.timeConstraints?.maxPrepTime ? `${request.timeConstraints.maxPrepTime} minutes` : '15 minutes',
        servings: request.servingSize || 4,
        difficulty: context.userPreferences.cookingSkillLevel || 'intermediate',
        tags: this.generateFallbackTags(request, context),
        cuisine: this.inferCuisine(request, context),
        mealType: request.mealType ? [request.mealType] : ['dinner'],
      });
    }

    return fallbackRecipes;
  }

  // Helper methods for recipe enhancement

  private extractUnit(ingredient: string): string {
    const units = ['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'];
    for (const unit of units) {
      if (ingredient.toLowerCase().includes(unit)) {
        return unit;
      }
    }
    return 'piece';
  }

  private categorizeIngredient(ingredient: string): any {
    const categories = {
      protein: ['chicken', 'beef', 'pork', 'fish', 'tofu', 'eggs', 'beans'],
      vegetable: ['onion', 'garlic', 'tomato', 'carrot', 'celery', 'pepper'],
      grain: ['rice', 'pasta', 'bread', 'flour', 'oats'],
      dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
      spice: ['salt', 'pepper', 'cumin', 'paprika', 'oregano'],
    };

    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => ingredient.toLowerCase().includes(item))) {
        return category;
      }
    }
    return 'other';
  }

  private getNutritionalValue(ingredient: string): any {
    // Simplified nutritional values - would use real database in production
    const nutrition = this.nutritionalDatabase.get(ingredient.toLowerCase()) || {
      calories: 50,
      protein: 2,
      carbs: 8,
      fat: 1,
      fiber: 1,
    };
    return nutrition;
  }

  private getSeasonalInfo(ingredient: string): any {
    const seasonal = {
      'tomato': { peakSeason: ['summer'], availability: 'seasonal', bestMonths: ['June', 'July', 'August'] },
      'apple': { peakSeason: ['fall'], availability: 'seasonal', bestMonths: ['September', 'October', 'November'] },
      'onion': { peakSeason: ['year-round'], availability: 'year-round' },
    };

    return seasonal[ingredient.toLowerCase()] || { peakSeason: ['year-round'], availability: 'year-round' };
  }

  private getIngredientSubstitutions(ingredient: string): string[] {
    const substitutions: { [key: string]: string[] } = {
      'butter': ['olive oil', 'coconut oil', 'margarine'],
      'milk': ['almond milk', 'soy milk', 'oat milk'],
      'eggs': ['flax eggs', 'chia eggs', 'applesauce'],
      'flour': ['almond flour', 'coconut flour', 'oat flour'],
    };

    return substitutions[ingredient.toLowerCase()] || [];
  }

  private getPreparationNotes(ingredient: string): string {
    const notes: { [key: string]: string } = {
      'garlic': 'Remove green germ from center if present to avoid bitterness',
      'onion': 'Chill in refrigerator before cutting to reduce tears',
      'tomato': 'Score an X on bottom and blanch to easily remove skin',
    };

    return notes[ingredient.toLowerCase()] || '';
  }

  private identifyTechnique(instruction: string): CookingTechnique | undefined {
    if (/sauté/i.test(instruction)) return this.cookingTechniques.get('sauté');
    if (/roast|bake/i.test(instruction)) return this.cookingTechniques.get('roast');
    if (/braise/i.test(instruction)) return this.cookingTechniques.get('braise');
    return undefined;
  }

  private estimateStepTime(instruction: string): string {
    if (/\d+\s*min/i.test(instruction)) {
      const match = instruction.match(/(\d+)\s*min/i);
      return match ? `${match[1]} minutes` : '5 minutes';
    }
    
    // Estimate based on cooking method
    if (/sauté|fry/i.test(instruction)) return '3-5 minutes';
    if (/simmer/i.test(instruction)) return '10-15 minutes';
    if (/bake|roast/i.test(instruction)) return '20-30 minutes';
    
    return '5 minutes';
  }

  private extractTemperature(instruction: string): string | undefined {
    const tempMatch = instruction.match(/(\d+)°?[CF]/i);
    return tempMatch ? tempMatch[0] : undefined;
  }

  private generateVisualCues(instruction: string): string[] {
    const cues: string[] = [];
    
    if (/sauté/i.test(instruction)) {
      cues.push('Ingredients should sizzle when added to pan');
      cues.push('Edges should start to brown lightly');
    }
    
    if (/simmer/i.test(instruction)) {
      cues.push('Small bubbles should break the surface occasionally');
      cues.push('Liquid should move gently, not vigorously boil');
    }
    
    return cues;
  }

  private getCommonMistakes(instruction: string): string[] {
    const mistakes: string[] = [];
    
    if (/sauté/i.test(instruction)) {
      mistakes.push('Adding ingredients to cold pan');
      mistakes.push('Overcrowding the pan');
    }
    
    if (/season/i.test(instruction)) {
      mistakes.push('Not tasting before adding more seasoning');
      mistakes.push('Adding salt too early to vegetables');
    }
    
    return mistakes;
  }

  private getStepSpecificTips(instruction: string): string[] {
    const tips: string[] = [];
    
    if (/chop|dice/i.test(instruction)) {
      tips.push('Keep fingertips curled under for safety');
      tips.push('Use a rocking motion with the knife');
    }
    
    if (/heat.*oil/i.test(instruction)) {
      tips.push('Oil should shimmer but not smoke');
      tips.push('Test with a small piece of food first');
    }
    
    return tips;
  }

  private estimateCalories(ingredients: (string | EnhancedIngredient)[]): number {
    let totalCalories = 0;
    
    ingredients.forEach(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      const nutrition = this.nutritionalDatabase.get(name.toLowerCase());
      if (nutrition) {
        totalCalories += nutrition.calories;
      } else {
        totalCalories += 50; // Default estimate
      }
    });
    
    return Math.round(totalCalories);
  }

  private estimateMicronutrients(ingredients: (string | EnhancedIngredient)[]): any[] {
    // Simplified micronutrient estimation
    return [
      { name: 'Vitamin C', amount: 15, unit: 'mg', dailyValuePercentage: 17 },
      { name: 'Iron', amount: 2, unit: 'mg', dailyValuePercentage: 11 },
      { name: 'Calcium', amount: 100, unit: 'mg', dailyValuePercentage: 10 },
    ];
  }

  private calculateHealthScore(recipe: Recipe): number {
    let score = 50; // Base score
    
    const ingredients = recipe.ingredients || [];
    
    // Boost for vegetables
    const vegetableCount = ingredients.filter(ing => 
      typeof ing === 'string' ? 
        /vegetable|tomato|onion|carrot|pepper|spinach|broccoli/i.test(ing) :
        ing.category === 'vegetable'
    ).length;
    score += vegetableCount * 10;
    
    // Boost for lean proteins
    const proteinCount = ingredients.filter(ing =>
      typeof ing === 'string' ?
        /chicken breast|fish|tofu|beans/i.test(ing) :
        ing.category === 'protein'
    ).length;
    score += proteinCount * 5;
    
    // Reduce for processed ingredients
    const processedCount = ingredients.filter(ing =>
      typeof ing === 'string' ?
        /processed|canned|frozen|packaged/i.test(ing) :
        false
    ).length;
    score -= processedCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private estimateSodium(ingredients: (string | EnhancedIngredient)[]): number {
    // Simplified sodium estimation in mg
    let sodium = 0;
    
    ingredients.forEach(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      if (/salt|soy sauce|cheese|bacon/i.test(name)) {
        sodium += 200;
      } else {
        sodium += 50; // Base sodium content
      }
    });
    
    return sodium;
  }

  private estimateSugar(ingredients: (string | EnhancedIngredient)[]): number {
    // Simplified sugar estimation in grams
    let sugar = 0;
    
    ingredients.forEach(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      if (/sugar|honey|maple syrup|fruit/i.test(name)) {
        sugar += 10;
      } else {
        sugar += 1; // Natural sugars
      }
    });
    
    return sugar;
  }

  private identifyHealthBenefits(ingredients: (string | EnhancedIngredient)[]): string[] {
    const benefits: string[] = [];
    
    ingredients.forEach(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      
      if (/tomato/i.test(name)) {
        benefits.push('Rich in lycopene, an antioxidant that may reduce cancer risk');
      }
      if (/garlic/i.test(name)) {
        benefits.push('Contains allicin, which may boost immune system');
      }
      if (/olive oil/i.test(name)) {
        benefits.push('High in monounsaturated fats, good for heart health');
      }
    });
    
    return Array.from(new Set(benefits)); // Remove duplicates
  }

  private identifyNutritionalWarnings(recipe: Recipe): string[] {
    const warnings: string[] = [];
    
    if (recipe.nutritionalInfo?.sodiumContent && recipe.nutritionalInfo.sodiumContent > 1000) {
      warnings.push('High sodium content - consider reducing salt or using herbs for flavor');
    }
    
    if (recipe.nutritionalInfo?.calories && recipe.nutritionalInfo.calories > 800) {
      warnings.push('High calorie content - consider smaller portions or lighter sides');
    }
    
    return warnings;
  }

  private generateEquipmentRecommendations(recipe: Recipe): any[] {
    const equipment: any[] = [];
    const instructions = recipe.instructions || [];
    
    instructions.forEach(instruction => {
      const instText = typeof instruction === 'string' ? instruction : instruction.instruction;
      
      if (/sauté|fry/i.test(instText)) {
        equipment.push({
          equipment: 'Non-stick or stainless steel pan',
          necessity: 'required',
          alternatives: ['Cast iron skillet', 'Carbon steel pan'],
          reason: 'Needed for proper sautéing and heat distribution',
        });
      }
      
      if (/bake|roast/i.test(instText)) {
        equipment.push({
          equipment: 'Oven-safe baking dish or sheet pan',
          necessity: 'required',
          alternatives: ['Glass baking dish', 'Metal roasting pan'],
          reason: 'Required for oven cooking methods',
        });
      }
    });
    
    return equipment;
  }

  private generateSubstitutions(recipe: Recipe, preferences: UserPreferences): any[] {
    const substitutions: any[] = [];
    const ingredients = recipe.ingredients || [];
    
    // Generate substitutions based on dietary restrictions
    if (preferences.dietaryRestrictions) {
      preferences.dietaryRestrictions.forEach(restriction => {
        if (restriction.type === 'vegan') {
          ingredients.forEach(ingredient => {
            const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
            if (/butter/i.test(name)) {
              substitutions.push({
                original: 'butter',
                substitute: 'vegan butter or coconut oil',
                ratio: '1:1',
                notes: 'Coconut oil may add slight coconut flavor',
              });
            }
          });
        }
      });
    }
    
    return substitutions;
  }

  private generateScalingOptions(recipe: Recipe): any[] {
    const servings = recipe.servings || 4;
    const scalingOptions: any[] = [];
    
    [2, 6, 8].forEach(newServings => {
      if (newServings !== servings) {
        const ratio = newServings / servings;
        scalingOptions.push({
          servings: newServings,
          adjustments: (recipe.ingredients || []).map(ingredient => {
            const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
            const amount = typeof ingredient === 'string' ? 
              ingredient.split(' ')[0] : 
              ingredient.amount;
            
            const numericAmount = parseFloat(amount) || 1;
            const newAmount = (numericAmount * ratio).toFixed(1);
            
            return {
              ingredient: name,
              newAmount: `${newAmount} ${typeof ingredient === 'string' ? 
                ingredient.split(' ').slice(1).join(' ') : 
                ingredient.unit}`,
            };
          }),
        });
      }
    });
    
    return scalingOptions;
  }

  private generateFlavorVariations(recipe: Recipe): any[] {
    const variations: any[] = [];
    
    // Add cuisine-based variations
    variations.push({
      name: 'Mediterranean Style',
      description: 'Add Mediterranean flavors with herbs and olive oil',
      modifications: [
        { ingredient: 'herbs', change: 'Add oregano, basil, and thyme' },
        { ingredient: 'oil', change: 'Use extra virgin olive oil' },
        { ingredient: 'vegetables', change: 'Add sun-dried tomatoes and olives' },
      ],
    });
    
    variations.push({
      name: 'Asian Fusion',
      description: 'Incorporate Asian flavors and cooking techniques',
      modifications: [
        { ingredient: 'seasonings', change: 'Add ginger, garlic, and soy sauce' },
        { ingredient: 'vegetables', change: 'Include bok choy or snow peas' },
        { ingredient: 'garnish', change: 'Top with sesame seeds and green onions' },
      ],
    });
    
    return variations;
  }

  private calculateRecipeConfidence(
    recipe: Recipe,
    request: RecipeRequest,
    context: ConversationContext
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Boost confidence if recipe matches dietary restrictions
    if (context.userPreferences.dietaryRestrictions) {
      // This would check recipe compliance in production
      confidence += 0.1;
    }
    
    // Boost confidence if recipe matches skill level
    if (context.userPreferences.cookingSkillLevel === recipe.difficulty) {
      confidence += 0.1;
    }
    
    // Boost confidence if recipe uses requested ingredients
    if (request.ingredients && request.ingredients.length > 0) {
      const recipeIngredients = recipe.ingredients || [];
      const matchCount = request.ingredients.filter(reqIng =>
        recipeIngredients.some(recipeIng =>
          (typeof recipeIng === 'string' ? recipeIng : recipeIng.name)
            .toLowerCase().includes(reqIng.toLowerCase())
        )
      ).length;
      
      confidence += (matchCount / request.ingredients.length) * 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Initialization methods

  private initializeNutritionalDatabase(): void {
    this.nutritionalDatabase = new Map([
      ['chicken', { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }],
      ['beef', { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 }],
      ['rice', { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 }],
      ['tomato', { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }],
      ['onion', { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }],
      ['garlic', { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 }],
      ['olive oil', { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }],
      ['butter', { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 }],
    ]);
  }

  private initializeCookingTechniques(): void {
    this.cookingTechniques = new Map([
      ['sauté', {
        name: 'Sauté',
        description: 'Quick cooking in a small amount of fat over high heat',
        difficulty: 'intermediate',
        timeRequired: '3-8 minutes',
        equipmentNeeded: ['pan', 'spatula'],
        tips: ['Heat pan before adding oil', 'Don\'t overcrowd the pan'],
        commonMistakes: ['Using too low heat', 'Not moving ingredients enough'],
      }],
      ['roast', {
        name: 'Roast',
        description: 'Cooking with dry heat in an oven',
        difficulty: 'beginner',
        timeRequired: '20-60 minutes',
        equipmentNeeded: ['oven', 'roasting pan'],
        tips: ['Preheat oven fully', 'Don\'t open oven door frequently'],
        commonMistakes: ['Not preheating oven', 'Overcrowding the pan'],
      }],
      ['braise', {
        name: 'Braise',
        description: 'Combination cooking method using both wet and dry heat',
        difficulty: 'advanced',
        timeRequired: '1-3 hours',
        equipmentNeeded: ['heavy pot', 'oven'],
        tips: ['Sear meat first for flavor', 'Use low, steady heat'],
        commonMistakes: ['Using too high heat', 'Not enough liquid'],
      }],
    ]);
  }

  private getDefaultTechnique(name: string): CookingTechnique {
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description: `${name} cooking technique`,
      difficulty: 'intermediate',
      timeRequired: '10-20 minutes',
      equipmentNeeded: ['basic kitchen equipment'],
      tips: [`Follow recipe instructions for ${name}`],
      commonMistakes: [`Common ${name} mistakes to avoid`],
    };
  }

  // Fallback recipe generation methods

  private generateFallbackIngredients(request: RecipeRequest): EnhancedIngredient[] {
    const baseIngredients = request.ingredients || [
      '2 cups main ingredient',
      '1 onion',
      '2 cloves garlic',
      '2 tbsp olive oil',
      'Salt and pepper to taste',
    ];

    return this.enhanceIngredients(baseIngredients);
  }

  private generateFallbackInstructions(request: RecipeRequest): EnhancedInstruction[] {
    const baseInstructions = [
      'Prepare all ingredients by washing, chopping, and measuring.',
      'Heat oil in a large pan over medium heat.',
      'Add aromatics and cook until fragrant, about 2 minutes.',
      'Add main ingredients and cook according to recipe requirements.',
      'Season with salt and pepper to taste.',
      'Serve hot and enjoy!',
    ];

    return this.enhanceInstructions(baseInstructions);
  }

  private generateFallbackTags(request: RecipeRequest, context: ConversationContext): string[] {
    const tags = ['homemade', 'delicious'];
    
    if (request.mealType) tags.push(request.mealType);
    if (context.userPreferences.cookingSkillLevel) tags.push(context.userPreferences.cookingSkillLevel);
    if (request.timeConstraints?.urgency === 'high') tags.push('quick');
    
    return tags;
  }

  private inferCuisine(request: RecipeRequest, context: ConversationContext): string {
    if (context.userPreferences.cuisinePreferences?.length) {
      return context.userPreferences.cuisinePreferences[0];
    }
    
    // Infer from ingredients
    if (request.ingredients?.some(ing => /soy sauce|ginger|sesame/i.test(ing))) {
      return 'Asian';
    }
    if (request.ingredients?.some(ing => /tomato|basil|mozzarella/i.test(ing))) {
      return 'Italian';
    }
    
    return 'International';
  }

  private generateIngredientFallbackRecipes(
    ingredients: string[],
    preferences: UserPreferences,
    recipeCount: number
  ): Recipe[] {
    // Generate simple recipes using available ingredients
    return Array.from({ length: recipeCount }, (_, i) => ({
      title: `${ingredients[0]} Recipe ${i + 1}`,
      description: `A delicious recipe featuring ${ingredients.slice(0, 3).join(', ')}`,
      ingredients: this.enhanceIngredients([
        ...ingredients.slice(0, 5),
        'Salt and pepper to taste',
        '2 tbsp cooking oil',
      ]),
      instructions: this.enhanceInstructions([
        'Prepare all ingredients.',
        `Cook ${ingredients[0]} as the main component.`,
        'Add seasonings and serve.',
      ]),
      cookingTime: '25 minutes',
      servings: 4,
      difficulty: preferences.cookingSkillLevel || 'intermediate',
      tags: ['ingredient-based', 'homemade'],
    }));
  }

  private adaptIngredientsForDiet(
    ingredients: (string | EnhancedIngredient)[],
    restrictions: any[]
  ): EnhancedIngredient[] {
    return ingredients.map(ingredient => {
      const enhanced = typeof ingredient === 'string' ? 
        this.enhanceIngredients([ingredient])[0] : 
        ingredient;

      // Apply dietary adaptations
      restrictions.forEach(restriction => {
        if (restriction.type === 'vegan' && /dairy|meat|egg/i.test(enhanced.name)) {
          enhanced.substitutions = enhanced.substitutions || [];
          enhanced.substitutions.push(`Vegan alternative to ${enhanced.name}`);
        }
      });

      return enhanced;
    });
  }

  private adjustInstructionsForSkill(
    instructions: (string | EnhancedInstruction)[],
    skillLevel: SkillLevel
  ): EnhancedInstruction[] {
    return instructions.map(instruction => {
      const enhanced = typeof instruction === 'string' ?
        this.enhanceInstructions([instruction])[0] :
        instruction;

      // Add skill-appropriate details
      if (skillLevel === 'beginner') {
        enhanced.chefTips = [
          ...(enhanced.chefTips || []),
          'Take your time and don\'t rush this step',
        ];
      }

      return enhanced;
    });
  }

  private async optimizeNutritionForGoals(
    recipe: Recipe,
    healthGoals: any[]
  ): Promise<NutritionalAnalysis> {
    const baseNutrition = await this.calculateNutritionalInfo(recipe);

    // Adjust nutritional analysis based on health goals
    healthGoals.forEach(goal => {
      if (goal.type === 'weight_loss') {
        baseNutrition.healthBenefits.push('Optimized for weight management');
      }
      if (goal.type === 'muscle_building') {
        baseNutrition.healthBenefits.push('High protein content for muscle building');
      }
    });

    return baseNutrition;
  }

  private adaptRecipeForIngredients(
    recipe: Recipe,
    availableIngredients: string[],
    preferences: UserPreferences
  ): Recipe {
    // Modify recipe to prioritize available ingredients
    const adaptedRecipe = { ...recipe };
    
    // Update title to reflect ingredient focus
    const primaryIngredient = availableIngredients[0];
    adaptedRecipe.title = `${primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1)} ${recipe.title}`;
    
    // Update description
    adaptedRecipe.description = `${recipe.description} This recipe makes great use of your available ${availableIngredients.slice(0, 3).join(', ')}.`;
    
    return adaptedRecipe;
  }
}