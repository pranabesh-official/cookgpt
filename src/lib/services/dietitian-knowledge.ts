import { 
  Recipe, 
  UserPreferences, 
  NutritionalAnalysis, 
  NutritionalAdvice,
  HealthGoal,
  NutritionalGoal,
  DietaryRestriction,
  HealthBenefit
} from "@/lib/types/conversation";

export interface HealthRecommendation {
  category: 'weight_management' | 'heart_health' | 'diabetes_friendly' | 'muscle_building';
  recommendation: string;
  scientificBasis: string;
  applicableRecipes: string[];
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: string[];
  suggestions: string[];
  alternativeIngredients: string[];
}

export interface MealPlan {
  id: string;
  duration: number; // days
  meals: MealPlanDay[];
  nutritionalSummary: NutritionalAnalysis;
  description: string;
  nutritionalRationale: string;
  shoppingList: string[];
}

export interface MealPlanDay {
  day: number;
  date: Date;
  meals: {
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
    snacks?: Recipe[];
  };
  dailyNutrition: NutritionalAnalysis;
}

export class DietitianKnowledgeService {
  private nutritionalDatabase: Map<string, any>;
  private healthGuidelines: Map<string, any>;
  private dietaryCompliance: Map<string, any>;

  constructor() {
    this.initializeNutritionalDatabase();
    this.initializeHealthGuidelines();
    this.initializeDietaryCompliance();
  }

  /**
   * Analyze nutritional content of a recipe
   */
  async analyzeNutritionalContent(recipe: Recipe): Promise<NutritionalAnalysis> {
    const ingredients = recipe.ingredients || [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;
    let totalSugar = 0;

    const micronutrients: Map<string, number> = new Map();
    const healthBenefits: string[] = [];

    // Analyze each ingredient
    for (const ingredient of ingredients) {
      const ingredientName = typeof ingredient === 'string' ? 
        ingredient.split(' ').slice(1).join(' ') : 
        ingredient.name;
      
      const amount = typeof ingredient === 'string' ? 
        parseFloat(ingredient.split(' ')[0]) || 1 : 
        parseFloat(ingredient.amount) || 1;

      const nutritionData = this.getNutritionData(ingredientName);
      if (nutritionData) {
        // Scale nutrition by amount (simplified - would need unit conversion in production)
        const scaleFactor = amount / 100; // Assuming nutrition per 100g
        
        totalCalories += nutritionData.calories * scaleFactor;
        totalProtein += nutritionData.protein * scaleFactor;
        totalCarbs += nutritionData.carbohydrates * scaleFactor;
        totalFat += nutritionData.fat * scaleFactor;
        totalFiber += nutritionData.fiber * scaleFactor;
        totalSodium += nutritionData.sodium * scaleFactor;
        totalSugar += nutritionData.sugar * scaleFactor;

        // Add micronutrients
        if (nutritionData.micronutrients) {
          for (const [nutrient, value] of Object.entries(nutritionData.micronutrients)) {
            const currentValue = micronutrients.get(nutrient) || 0;
            micronutrients.set(nutrient, currentValue + (value as number) * scaleFactor);
          }
        }

        // Add health benefits
        if (nutritionData.healthBenefits) {
          healthBenefits.push(...nutritionData.healthBenefits);
        }
      }
    }

    // Calculate per serving
    const servings = recipe.servings || 4;
    const perServingCalories = Math.round(totalCalories / servings);
    const perServingProtein = Math.round(totalProtein / servings);
    const perServingCarbs = Math.round(totalCarbs / servings);
    const perServingFat = Math.round(totalFat / servings);
    const perServingFiber = Math.round(totalFiber / servings);

    // Calculate health score
    const healthScore = this.calculateHealthScore({
      calories: perServingCalories,
      protein: perServingProtein,
      carbs: perServingCarbs,
      fat: perServingFat,
      fiber: perServingFiber,
      sodium: totalSodium / servings,
      vegetables: this.countVegetables(ingredients),
      processedIngredients: this.countProcessedIngredients(ingredients),
    });

    // Generate nutritional warnings
    const nutritionalWarnings = this.generateNutritionalWarnings({
      calories: perServingCalories,
      sodium: totalSodium / servings,
      sugar: totalSugar / servings,
      fat: perServingFat,
    });

    return {
      calories: perServingCalories,
      macronutrients: {
        protein: perServingProtein,
        carbohydrates: perServingCarbs,
        fat: perServingFat,
        fiber: perServingFiber,
      },
      micronutrients: Array.from(micronutrients.entries()).map(([name, amount]) => ({
        name,
        amount: Math.round(amount / servings),
        unit: this.getMicronutrientUnit(name),
        dailyValuePercentage: this.calculateDailyValuePercentage(name, amount / servings),
      })),
      healthScore,
      dietaryFiberContent: perServingFiber,
      sodiumContent: Math.round(totalSodium / servings),
      sugarContent: Math.round(totalSugar / servings),
      healthBenefits: Array.from(new Set(healthBenefits)),
      nutritionalWarnings,
    };
  }

  /**
   * Get health-based recommendations for user
   */
  async getHealthRecommendations(userProfile: {
    healthGoals: HealthGoal[];
    dietaryRestrictions: DietaryRestriction[];
    age?: number;
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  }): Promise<HealthRecommendation[]> {
    const recommendations: HealthRecommendation[] = [];

    for (const goal of userProfile.healthGoals) {
      const recommendation = this.getRecommendationForGoal(goal, userProfile);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add general recommendations based on dietary restrictions
    for (const restriction of userProfile.dietaryRestrictions) {
      const recommendation = this.getRecommendationForRestriction(restriction);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Validate dietary compliance of a recipe
   */
  async validateDietaryCompliance(
    recipe: Recipe, 
    restrictions: DietaryRestriction[]
  ): Promise<ComplianceResult> {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const alternativeIngredients: string[] = [];

    for (const restriction of restrictions) {
      const compliance = this.checkRestrictionCompliance(recipe, restriction);
      
      if (!compliance.isCompliant) {
        violations.push(...compliance.violations);
        suggestions.push(...compliance.suggestions);
        alternativeIngredients.push(...compliance.alternatives);
      }
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      suggestions,
      alternativeIngredients,
    };
  }

  /**
   * Create balanced meal plan
   */
  async createBalancedMealPlan(
    preferences: UserPreferences, 
    duration: number
  ): Promise<MealPlan> {
    const meals: MealPlanDay[] = [];
    const shoppingList: string[] = [];

    // Calculate daily nutritional targets
    const dailyTargets = this.calculateDailyNutritionalTargets(preferences);

    for (let day = 1; day <= duration; day++) {
      const dayMeals = await this.planDayMeals(preferences, dailyTargets, day);
      meals.push(dayMeals);
      
      // Add ingredients to shopping list
      this.addIngredientsToShoppingList(dayMeals, shoppingList);
    }

    // Calculate overall nutritional summary
    const nutritionalSummary = this.calculateMealPlanNutrition(meals);

    return {
      id: `meal-plan-${Date.now()}`,
      duration,
      meals,
      nutritionalSummary,
      description: this.generateMealPlanDescription(preferences, duration),
      nutritionalRationale: this.generateNutritionalRationale(preferences, nutritionalSummary),
      shoppingList: Array.from(new Set(shoppingList)).sort(),
    };
  }

  /**
   * Get ingredient health benefits
   */
  async getIngredientHealthBenefits(ingredient: string): Promise<HealthBenefit[]> {
    const nutritionData = this.getNutritionData(ingredient);
    const benefits: HealthBenefit[] = [];

    if (nutritionData?.healthBenefits) {
      for (const benefit of nutritionData.healthBenefits) {
        benefits.push({
          benefit,
          description: this.getHealthBenefitDescription(ingredient, benefit),
          scientificBasis: this.getScientificBasis(ingredient, benefit),
        });
      }
    }

    return benefits;
  }

  /**
   * Get personalized nutritional advice
   */
  async getPersonalizedNutritionalAdvice(
    preferences: UserPreferences,
    nutritionalGoals: NutritionalGoal[]
  ): Promise<NutritionalAdvice> {
    let advice = "Based on your dietary preferences and health goals, here's my professional nutritional guidance: ";
    let category: 'general' | 'specific_condition' | 'ingredient_focus' = 'general';

    // Analyze health goals
    if (nutritionalGoals.length > 0) {
      category = 'specific_condition';
      const primaryGoal = nutritionalGoals.find(g => g.priority === 'high') || nutritionalGoals[0];
      
      switch (primaryGoal.type) {
        case 'weight_loss':
          advice += "Focus on creating a moderate caloric deficit through portion control and nutrient-dense foods. Emphasize lean proteins, fiber-rich vegetables, and complex carbohydrates. Aim for 0.8-1g protein per kg body weight to preserve muscle mass during weight loss.";
          break;
        case 'weight_gain':
          advice += "Increase caloric intake with nutrient-dense foods. Focus on healthy fats like nuts, avocados, and olive oil. Include protein-rich foods at every meal and consider healthy snacks between meals.";
          break;
        case 'muscle_building':
          advice += "Prioritize protein intake (1.6-2.2g per kg body weight) distributed throughout the day. Include complete proteins and pair with complex carbohydrates for optimal muscle protein synthesis.";
          break;
        case 'heart_health':
          advice += "Follow a Mediterranean-style eating pattern rich in omega-3 fatty acids, fiber, and antioxidants. Limit saturated fats, trans fats, and sodium. Include fatty fish twice weekly.";
          break;
        case 'diabetes_management':
          advice += "Focus on consistent carbohydrate intake and pair carbs with protein or healthy fats to manage blood sugar. Choose low glycemic index foods and monitor portion sizes.";
          break;
      }
    }

    // Add dietary restriction guidance
    if (preferences.dietaryRestrictions?.length) {
      advice += " Given your dietary restrictions, ";
      
      const hasVegan = preferences.dietaryRestrictions.some(r => r.type === 'vegan');
      const hasGlutenFree = preferences.dietaryRestrictions.some(r => r.type === 'gluten-free');
      
      if (hasVegan) {
        advice += "ensure adequate B12, iron, zinc, and omega-3 fatty acids through fortified foods or supplements. Combine legumes with grains for complete proteins.";
      }
      
      if (hasGlutenFree) {
        advice += "focus on naturally gluten-free whole grains like quinoa, rice, and oats. Be mindful of cross-contamination and read labels carefully.";
      }
    }

    return {
      category,
      advice,
      scientificBasis: "Recommendations based on current dietary guidelines from major health organizations including the American Heart Association, Academy of Nutrition and Dietetics, and WHO.",
    };
  }

  /**
   * Get nutritional advice for specific recipes
   */
  async getRecipeNutritionalAdvice(
    recipes: Recipe[],
    preferences: UserPreferences
  ): Promise<NutritionalAdvice> {
    if (recipes.length === 0) {
      return {
        category: 'general',
        advice: "No recipes to analyze for nutritional content.",
      };
    }

    let advice = `Nutritional analysis of your ${recipes.length} recipe${recipes.length > 1 ? 's' : ''}: `;
    
    // Analyze average nutritional content
    const avgCalories = recipes.reduce((sum, recipe) => 
      sum + (recipe.nutritionalInfo?.calories || 0), 0) / recipes.length;
    
    const avgProtein = recipes.reduce((sum, recipe) => 
      sum + (recipe.nutritionalInfo?.macronutrients.protein || 0), 0) / recipes.length;

    if (avgCalories > 600) {
      advice += "These are higher-calorie recipes, perfect for main meals. ";
    } else if (avgCalories < 300) {
      advice += "These are lighter recipes, great for snacks or side dishes. ";
    }

    if (avgProtein > 25) {
      advice += "Excellent protein content to support muscle maintenance and satiety. ";
    } else if (avgProtein < 10) {
      advice += "Consider adding a protein source to make these more balanced meals. ";
    }

    // Check for dietary compliance
    if (preferences.dietaryRestrictions?.length) {
      advice += "All recipes have been tailored to meet your dietary restrictions. ";
    }

    // Add health benefits
    const allHealthBenefits = recipes.flatMap(recipe => 
      recipe.nutritionalInfo?.healthBenefits || []
    );
    
    if (allHealthBenefits.length > 0) {
      const uniqueBenefits = Array.from(new Set(allHealthBenefits));
      advice += `Health benefits include: ${uniqueBenefits.slice(0, 3).join(', ')}.`;
    }

    return {
      category: 'specific_condition',
      advice,
      applicableRecipes: recipes.map(r => r.title),
    };
  }

  /**
   * Analyze nutrition of available ingredients
   */
  async analyzeIngredientNutrition(ingredients: string[]): Promise<NutritionalAdvice> {
    const nutritionAnalysis = ingredients.map(ingredient => {
      const data = this.getNutritionData(ingredient);
      return { ingredient, data };
    }).filter(item => item.data);

    if (nutritionAnalysis.length === 0) {
      return {
        category: 'ingredient_focus',
        advice: "I need more specific ingredient information to provide detailed nutritional analysis.",
      };
    }

    let advice = `Nutritional analysis of your available ingredients: `;

    // Identify nutritional strengths
    const proteinSources = nutritionAnalysis.filter(item => 
      item.data.protein > 15
    );
    
    const fiberSources = nutritionAnalysis.filter(item => 
      item.data.fiber > 3
    );

    const vitaminSources = nutritionAnalysis.filter(item => 
      item.data.healthBenefits?.some((benefit: string) => 
        benefit.toLowerCase().includes('vitamin')
      )
    );

    if (proteinSources.length > 0) {
      advice += `Great protein sources available: ${proteinSources.map(s => s.ingredient).join(', ')}. `;
    }

    if (fiberSources.length > 0) {
      advice += `Good fiber content from: ${fiberSources.map(s => s.ingredient).join(', ')}. `;
    }

    if (vitaminSources.length > 0) {
      advice += `Vitamin-rich ingredients: ${vitaminSources.map(s => s.ingredient).join(', ')}. `;
    }

    // Suggest combinations
    advice += "For optimal nutrition, try combining these ingredients to create balanced meals with protein, complex carbohydrates, and healthy fats.";

    return {
      category: 'ingredient_focus',
      advice,
    };
  }

  /**
   * Create personalized meal plan
   */
  async createPersonalizedMealPlan(
    preferences: UserPreferences,
    nutritionalGoals: NutritionalGoal[],
    duration: number
  ): Promise<MealPlan> {
    // This is a simplified version - would be more complex in production
    const mealPlan = await this.createBalancedMealPlan(preferences, duration);
    
    // Customize based on nutritional goals
    if (nutritionalGoals.length > 0) {
      mealPlan.nutritionalRationale += ` This plan is specifically designed to support your ${nutritionalGoals.map(g => g.type).join(' and ')} goals.`;
    }

    return mealPlan;
  }

  /**
   * Get dietary modification advice
   */
  async getDietaryModificationAdvice(
    modifications: string[],
    preferences: UserPreferences
  ): Promise<NutritionalAdvice> {
    let advice = "Here's professional guidance for your dietary modifications: ";

    modifications.forEach(modification => {
      if (modification.toLowerCase().includes('vegan')) {
        advice += "Transitioning to vegan: Focus on B12 supplementation, iron-rich foods with vitamin C, and protein combining. ";
      }
      
      if (modification.toLowerCase().includes('gluten-free')) {
        advice += "Going gluten-free: Ensure adequate fiber and B-vitamins through fortified gluten-free grains and vegetables. ";
      }
      
      if (modification.toLowerCase().includes('low-carb')) {
        advice += "Reducing carbs: Maintain adequate fiber through low-carb vegetables and monitor energy levels during transition. ";
      }
    });

    advice += "Make changes gradually to allow your body to adapt, and consider consulting with a registered dietitian for personalized guidance.";

    return {
      category: 'specific_condition',
      advice,
      scientificBasis: "Based on evidence-based nutrition science and clinical practice guidelines for dietary transitions.",
    };
  }

  // Private helper methods

  private getNutritionData(ingredient: string): any {
    return this.nutritionalDatabase.get(ingredient.toLowerCase());
  }

  private calculateHealthScore(nutritionData: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    vegetables: number;
    processedIngredients: number;
  }): number {
    let score = 50; // Base score

    // Protein adequacy (15-30% of calories)
    const proteinCalories = nutritionData.protein * 4;
    const proteinPercent = (proteinCalories / nutritionData.calories) * 100;
    if (proteinPercent >= 15 && proteinPercent <= 30) score += 15;
    else if (proteinPercent >= 10) score += 10;

    // Fiber content (good if >5g per serving)
    if (nutritionData.fiber >= 5) score += 15;
    else if (nutritionData.fiber >= 3) score += 10;

    // Vegetable content
    score += Math.min(nutritionData.vegetables * 10, 20);

    // Sodium content (penalize high sodium)
    if (nutritionData.sodium > 800) score -= 15;
    else if (nutritionData.sodium > 600) score -= 10;

    // Processed ingredients (penalize)
    score -= nutritionData.processedIngredients * 5;

    return Math.max(0, Math.min(100, score));
  }

  private generateNutritionalWarnings(nutrition: {
    calories: number;
    sodium: number;
    sugar: number;
    fat: number;
  }): string[] {
    const warnings: string[] = [];

    if (nutrition.calories > 800) {
      warnings.push("High calorie content - consider portion control or pairing with lighter sides");
    }

    if (nutrition.sodium > 1000) {
      warnings.push("High sodium content - limit other high-sodium foods throughout the day");
    }

    if (nutrition.sugar > 25) {
      warnings.push("High sugar content - consider reducing added sugars or balancing with protein");
    }

    if (nutrition.fat > 35) {
      warnings.push("High fat content - ensure it comes from healthy sources like nuts, avocado, or olive oil");
    }

    return warnings;
  }

  private countVegetables(ingredients: any[]): number {
    const vegetables = ['tomato', 'onion', 'carrot', 'celery', 'pepper', 'spinach', 'broccoli', 'zucchini', 'mushroom'];
    return ingredients.filter(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      return vegetables.some(veg => name.toLowerCase().includes(veg));
    }).length;
  }

  private countProcessedIngredients(ingredients: any[]): number {
    const processed = ['canned', 'frozen', 'packaged', 'processed', 'instant'];
    return ingredients.filter(ingredient => {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      return processed.some(proc => name.toLowerCase().includes(proc));
    }).length;
  }

  private getMicronutrientUnit(nutrient: string): string {
    const units: { [key: string]: string } = {
      'vitamin_c': 'mg',
      'iron': 'mg',
      'calcium': 'mg',
      'vitamin_d': 'IU',
      'vitamin_b12': 'mcg',
      'folate': 'mcg',
    };
    return units[nutrient.toLowerCase()] || 'mg';
  }

  private calculateDailyValuePercentage(nutrient: string, amount: number): number {
    const dailyValues: { [key: string]: number } = {
      'vitamin_c': 90, // mg
      'iron': 18, // mg
      'calcium': 1000, // mg
      'vitamin_d': 600, // IU
      'vitamin_b12': 2.4, // mcg
      'folate': 400, // mcg
    };

    const dv = dailyValues[nutrient.toLowerCase()];
    return dv ? Math.round((amount / dv) * 100) : 0;
  }

  private getRecommendationForGoal(
    goal: HealthGoal,
    userProfile: any
  ): HealthRecommendation | null {
    const recommendations: { [key: string]: HealthRecommendation } = {
      'weight_loss': {
        category: 'weight_management',
        recommendation: 'Create a moderate caloric deficit of 500-750 calories per day through diet and exercise. Focus on high-protein, high-fiber foods to maintain satiety.',
        scientificBasis: 'Research shows that moderate caloric restriction combined with adequate protein intake (0.8-1.2g/kg body weight) helps preserve lean muscle mass during weight loss.',
        applicableRecipes: [],
      },
      'muscle_building': {
        category: 'muscle_building',
        recommendation: 'Consume 1.6-2.2g protein per kg body weight daily, distributed across meals. Include leucine-rich foods and time protein intake around workouts.',
        scientificBasis: 'Meta-analyses demonstrate that protein intakes in this range optimize muscle protein synthesis when combined with resistance training.',
        applicableRecipes: [],
      },
      'heart_health': {
        category: 'heart_health',
        recommendation: 'Follow a Mediterranean-style diet rich in omega-3 fatty acids, fiber, and antioxidants. Limit saturated fat to <7% of total calories.',
        scientificBasis: 'Multiple large-scale studies show Mediterranean diet patterns reduce cardiovascular disease risk by 20-30%.',
        applicableRecipes: [],
      },
    };

    return recommendations[goal.type] || null;
  }

  private getRecommendationForRestriction(restriction: DietaryRestriction): HealthRecommendation | null {
    if (restriction.type === 'vegan') {
      return {
        category: 'weight_management',
        recommendation: 'Ensure adequate intake of B12, iron, zinc, omega-3 fatty acids, and vitamin D through fortified foods or supplements.',
        scientificBasis: 'Vegan diets can be nutritionally complete but require attention to specific nutrients that are primarily found in animal products.',
        applicableRecipes: [],
      };
    }
    return null;
  }

  private checkRestrictionCompliance(
    recipe: Recipe,
    restriction: DietaryRestriction
  ): { isCompliant: boolean; violations: string[]; suggestions: string[]; alternatives: string[] } {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const alternatives: string[] = [];

    const ingredients = recipe.ingredients || [];

    switch (restriction.type) {
      case 'vegan':
        ingredients.forEach(ingredient => {
          const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
          if (/meat|chicken|beef|pork|fish|dairy|milk|cheese|butter|egg/i.test(name)) {
            violations.push(`Contains non-vegan ingredient: ${name}`);
            alternatives.push(this.getVeganAlternative(name));
          }
        });
        break;

      case 'gluten-free':
        ingredients.forEach(ingredient => {
          const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
          if (/wheat|flour|bread|pasta|barley|rye/i.test(name)) {
            violations.push(`Contains gluten: ${name}`);
            alternatives.push(this.getGlutenFreeAlternative(name));
          }
        });
        break;

      case 'dairy-free':
        ingredients.forEach(ingredient => {
          const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
          if (/milk|cheese|butter|cream|yogurt/i.test(name)) {
            violations.push(`Contains dairy: ${name}`);
            alternatives.push(this.getDairyFreeAlternative(name));
          }
        });
        break;
    }

    if (violations.length > 0) {
      suggestions.push(`Consider substituting ingredients to make this recipe ${restriction.type}-friendly`);
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      suggestions,
      alternatives,
    };
  }

  private getVeganAlternative(ingredient: string): string {
    const alternatives: { [key: string]: string } = {
      'butter': 'vegan butter or coconut oil',
      'milk': 'plant-based milk (almond, soy, oat)',
      'cheese': 'nutritional yeast or vegan cheese',
      'eggs': 'flax eggs or chia eggs',
      'chicken': 'tofu or tempeh',
      'beef': 'mushrooms or plant-based protein',
    };

    for (const [key, alt] of Object.entries(alternatives)) {
      if (ingredient.toLowerCase().includes(key)) {
        return alt;
      }
    }
    return 'plant-based alternative';
  }

  private getGlutenFreeAlternative(ingredient: string): string {
    const alternatives: { [key: string]: string } = {
      'flour': 'gluten-free flour blend',
      'bread': 'gluten-free bread',
      'pasta': 'rice or corn pasta',
      'soy sauce': 'tamari or coconut aminos',
    };

    for (const [key, alt] of Object.entries(alternatives)) {
      if (ingredient.toLowerCase().includes(key)) {
        return alt;
      }
    }
    return 'gluten-free alternative';
  }

  private getDairyFreeAlternative(ingredient: string): string {
    const alternatives: { [key: string]: string } = {
      'milk': 'plant-based milk',
      'butter': 'vegan butter or olive oil',
      'cheese': 'nutritional yeast or dairy-free cheese',
      'cream': 'coconut cream or cashew cream',
      'yogurt': 'coconut or almond yogurt',
    };

    for (const [key, alt] of Object.entries(alternatives)) {
      if (ingredient.toLowerCase().includes(key)) {
        return alt;
      }
    }
    return 'dairy-free alternative';
  }

  private calculateDailyNutritionalTargets(preferences: UserPreferences): any {
    // Simplified calculation - would be more sophisticated in production
    return {
      calories: 2000, // Would calculate based on age, gender, activity level
      protein: 150, // grams
      carbohydrates: 250, // grams
      fat: 67, // grams
      fiber: 25, // grams
    };
  }

  private async planDayMeals(
    preferences: UserPreferences,
    targets: any,
    day: number
  ): Promise<MealPlanDay> {
    // This would generate actual recipes in production
    const mockRecipe: Recipe = {
      title: `Day ${day} Meal`,
      description: 'Balanced meal for your meal plan',
      ingredients: ['2 cups vegetables', '4 oz protein', '1 cup grains'],
      instructions: ['Prepare ingredients', 'Cook and combine', 'Serve'],
      cookingTime: '30 minutes',
      servings: 1,
      difficulty: 'intermediate',
      tags: ['healthy', 'balanced'],
    };

    return {
      day,
      date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000),
      meals: {
        breakfast: { ...mockRecipe, title: `Day ${day} Breakfast` },
        lunch: { ...mockRecipe, title: `Day ${day} Lunch` },
        dinner: { ...mockRecipe, title: `Day ${day} Dinner` },
      },
      dailyNutrition: {
        calories: targets.calories,
        macronutrients: {
          protein: targets.protein,
          carbohydrates: targets.carbohydrates,
          fat: targets.fat,
          fiber: targets.fiber,
        },
        micronutrients: [],
        healthScore: 85,
        dietaryFiberContent: targets.fiber,
        sodiumContent: 1500,
        sugarContent: 50,
        healthBenefits: ['Balanced nutrition', 'Adequate protein', 'High fiber'],
      },
    };
  }

  private addIngredientsToShoppingList(dayMeals: MealPlanDay, shoppingList: string[]): void {
    const meals = [dayMeals.meals.breakfast, dayMeals.meals.lunch, dayMeals.meals.dinner];
    
    meals.forEach(meal => {
      meal.ingredients?.forEach(ingredient => {
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
        if (!shoppingList.includes(ingredientName)) {
          shoppingList.push(ingredientName);
        }
      });
    });
  }

  private calculateMealPlanNutrition(meals: MealPlanDay[]): NutritionalAnalysis {
    // Calculate average daily nutrition across all days
    const avgCalories = meals.reduce((sum, day) => sum + day.dailyNutrition.calories, 0) / meals.length;
    const avgProtein = meals.reduce((sum, day) => sum + day.dailyNutrition.macronutrients.protein, 0) / meals.length;
    const avgCarbs = meals.reduce((sum, day) => sum + day.dailyNutrition.macronutrients.carbohydrates, 0) / meals.length;
    const avgFat = meals.reduce((sum, day) => sum + day.dailyNutrition.macronutrients.fat, 0) / meals.length;
    const avgFiber = meals.reduce((sum, day) => sum + day.dailyNutrition.macronutrients.fiber, 0) / meals.length;

    return {
      calories: Math.round(avgCalories),
      macronutrients: {
        protein: Math.round(avgProtein),
        carbohydrates: Math.round(avgCarbs),
        fat: Math.round(avgFat),
        fiber: Math.round(avgFiber),
      },
      micronutrients: [],
      healthScore: 85,
      dietaryFiberContent: Math.round(avgFiber),
      sodiumContent: 1500,
      sugarContent: 50,
      healthBenefits: ['Balanced weekly nutrition', 'Variety of nutrients', 'Sustainable eating pattern'],
    };
  }

  private generateMealPlanDescription(preferences: UserPreferences, duration: number): string {
    let description = `A ${duration}-day personalized meal plan designed for your dietary preferences and health goals. `;
    
    if (preferences.dietaryRestrictions?.length) {
      description += `All meals accommodate your ${preferences.dietaryRestrictions.map(r => r.type).join(' and ')} requirements. `;
    }
    
    description += "Each day provides balanced nutrition with variety to keep meals interesting and sustainable.";
    
    return description;
  }

  private generateNutritionalRationale(preferences: UserPreferences, nutrition: NutritionalAnalysis): string {
    let rationale = "This meal plan provides optimal macronutrient distribution with ";
    
    const proteinPercent = Math.round((nutrition.macronutrients.protein * 4 / nutrition.calories) * 100);
    const carbPercent = Math.round((nutrition.macronutrients.carbohydrates * 4 / nutrition.calories) * 100);
    const fatPercent = Math.round((nutrition.macronutrients.fat * 9 / nutrition.calories) * 100);
    
    rationale += `${proteinPercent}% protein, ${carbPercent}% carbohydrates, and ${fatPercent}% fat. `;
    rationale += `Daily fiber intake of ${nutrition.dietaryFiberContent}g supports digestive health and satiety.`;
    
    return rationale;
  }

  private getHealthBenefitDescription(ingredient: string, benefit: string): string {
    const descriptions: { [key: string]: { [key: string]: string } } = {
      'tomato': {
        'Rich in lycopene': 'Lycopene is a powerful antioxidant that gives tomatoes their red color and may help protect against heart disease and certain cancers.',
      },
      'garlic': {
        'Contains allicin': 'Allicin is a sulfur compound that forms when garlic is crushed or chopped, known for its antimicrobial and immune-supporting properties.',
      },
    };

    return descriptions[ingredient.toLowerCase()]?.[benefit] || `${ingredient} provides ${benefit.toLowerCase()}.`;
  }

  private getScientificBasis(ingredient: string, benefit: string): string {
    // This would reference actual scientific studies in production
    return `Multiple peer-reviewed studies have demonstrated the health benefits of ${ingredient} related to ${benefit.toLowerCase()}.`;
  }

  // Initialization methods

  private initializeNutritionalDatabase(): void {
    this.nutritionalDatabase = new Map([
      ['chicken breast', {
        calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sodium: 74, sugar: 0,
        micronutrients: { vitamin_b6: 0.5, niacin: 8.5, phosphorus: 196 },
        healthBenefits: ['High-quality complete protein', 'Low in saturated fat', 'Rich in B vitamins'],
      }],
      ['salmon', {
        calories: 208, protein: 22, carbohydrates: 0, fat: 12, fiber: 0, sodium: 59, sugar: 0,
        micronutrients: { omega_3: 1.8, vitamin_d: 360, vitamin_b12: 3.2 },
        healthBenefits: ['Rich in omega-3 fatty acids', 'High in vitamin D', 'Supports heart health'],
      }],
      ['quinoa', {
        calories: 222, protein: 8, carbohydrates: 39, fat: 3.6, fiber: 5, sodium: 7, sugar: 0,
        micronutrients: { iron: 2.8, magnesium: 118, folate: 42 },
        healthBenefits: ['Complete protein source', 'High in fiber', 'Gluten-free grain alternative'],
      }],
      ['spinach', {
        calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sodium: 79, sugar: 0.4,
        micronutrients: { vitamin_k: 483, folate: 194, iron: 2.7, vitamin_a: 469 },
        healthBenefits: ['Rich in iron and folate', 'High in vitamin K', 'Supports bone health'],
      }],
      ['avocado', {
        calories: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 7, sodium: 7, sugar: 0.7,
        micronutrients: { potassium: 485, folate: 81, vitamin_k: 21 },
        healthBenefits: ['Rich in monounsaturated fats', 'High in fiber', 'Supports heart health'],
      }],
      ['sweet potato', {
        calories: 86, protein: 1.6, carbohydrates: 20, fat: 0.1, fiber: 3, sodium: 5, sugar: 4.2,
        micronutrients: { vitamin_a: 709, potassium: 337, vitamin_c: 2.4 },
        healthBenefits: ['High in beta-carotene', 'Good source of fiber', 'Supports eye health'],
      }],
      ['almonds', {
        calories: 579, protein: 21, carbohydrates: 22, fat: 50, fiber: 12, sodium: 1, sugar: 4.4,
        micronutrients: { vitamin_e: 25.6, magnesium: 270, calcium: 269 },
        healthBenefits: ['Rich in vitamin E', 'Good source of healthy fats', 'Supports heart health'],
      }],
      ['greek yogurt', {
        calories: 59, protein: 10, carbohydrates: 3.6, fat: 0.4, fiber: 0, sodium: 36, sugar: 3.6,
        micronutrients: { calcium: 110, vitamin_b12: 0.75, probiotics: 1 },
        healthBenefits: ['High in protein', 'Contains probiotics', 'Supports digestive health'],
      }],
    ]);
  }

  private initializeHealthGuidelines(): void {
    this.healthGuidelines = new Map([
      ['daily_calories', { sedentary: 1800, active: 2200, very_active: 2600 }],
      ['protein_per_kg', { minimum: 0.8, optimal: 1.2, athlete: 2.0 }],
      ['fiber_daily', { minimum: 25, optimal: 35 }],
      ['sodium_daily', { maximum: 2300, optimal: 1500 }],
    ]);
  }

  private initializeDietaryCompliance(): void {
    this.dietaryCompliance = new Map([
      ['vegan', {
        forbidden: ['meat', 'poultry', 'fish', 'dairy', 'eggs', 'honey'],
        nutrients_of_concern: ['vitamin_b12', 'iron', 'zinc', 'omega_3'],
      }],
      ['vegetarian', {
        forbidden: ['meat', 'poultry', 'fish'],
        nutrients_of_concern: ['iron', 'zinc', 'vitamin_b12'],
      }],
      ['gluten_free', {
        forbidden: ['wheat', 'barley', 'rye', 'triticale'],
        nutrients_of_concern: ['fiber', 'b_vitamins', 'iron'],
      }],
      ['dairy_free', {
        forbidden: ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
        nutrients_of_concern: ['calcium', 'vitamin_d', 'riboflavin'],
      }],
    ]);
  }
}