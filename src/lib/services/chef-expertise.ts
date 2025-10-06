import {
  Recipe,
  CookingTechnique,
  ChefTip,
  EquipmentRecommendation,
  SkillLevel,
  CookingTip
} from "@/lib/types/conversation";

export interface FlavorEnhancement {
  name: string;
  description: string;
  ingredients: string[];
  technique: string;
  skillLevel: SkillLevel;
}

export interface CookingIssue {
  problem: string;
  context: string;
  ingredients?: string[];
  cookingMethod?: string;
}

export interface TroubleshootingSolution {
  diagnosis: string;
  immediateActions: string[];
  preventionTips: string[];
  alternativeApproaches: string[];
  skillLevel: SkillLevel;
}

export class ChefExpertiseService {
  private cookingTechniques!: Map<string, CookingTechnique>;
  private equipmentDatabase!: Map<string, any>;
  private flavorProfiles!: Map<string, any>;
  private troubleshootingDatabase!: Map<string, any>;

  constructor() {
    this.initializeCookingTechniques();
    this.initializeEquipmentDatabase();
    this.initializeFlavorProfiles();
    this.initializeTroubleshootingDatabase();
  }

  /**
   * Get cooking techniques for a recipe
   */
  async getCookingTechniques(recipe: Recipe): Promise<CookingTechnique[]> {
    const techniques: CookingTechnique[] = [];
    const instructions = recipe.instructions || [];

    // Analyze instructions to identify techniques
    instructions.forEach(instruction => {
      const instText = typeof instruction === 'string' ? instruction : instruction.instruction;
      const identifiedTechniques = this.identifyTechniquesInText(instText);
      techniques.push(...identifiedTechniques);
    });

    // Remove duplicates and sort by complexity
    const uniqueTechniques = Array.from(
      new Map(techniques.map(t => [t.name, t])).values()
    );

    return uniqueTechniques.sort((a, b) =>
      this.getDifficultyScore(a.difficulty) - this.getDifficultyScore(b.difficulty)
    );
  }

  /**
   * Get professional chef tips for recipes with enhanced conversational tone
   */
  async getRecipeCookingTips(recipes: Recipe[], skillLevel: SkillLevel): Promise<CookingTip[]> {
    const tips: CookingTip[] = [];

    for (const recipe of recipes) {
      const recipeTips = await this.generateRecipeSpecificTips(recipe, skillLevel);
      tips.push(...recipeTips);
    }

    // Remove duplicates and limit to most relevant tips
    const uniqueTips = Array.from(
      new Map(tips.map(t => [t.tip, t])).values()
    );

    // Enhance tips with more conversational, professional language
    const enhancedTips = uniqueTips.map(tip => ({
      ...tip,
      tip: this.enhanceLanguageForProfessionalism(tip.tip, skillLevel),
      reasoning: this.addChefPersonality(tip.reasoning)
    }));

    return enhancedTips.slice(0, 5); // Limit to 5 most relevant tips
  }

  /**
   * Get cooking technique tips for specific methods
   */
  async getCookingTechniqueTips(cookingMethod: string, skillLevel: SkillLevel): Promise<CookingTip[]> {
    const technique = this.cookingTechniques.get(cookingMethod.toLowerCase());

    if (!technique) {
      return this.getGeneralCookingTips(skillLevel);
    }

    const tips: CookingTip[] = [];

    // Add technique-specific tips
    technique.tips.forEach(tip => {
      tips.push({
        category: 'cooking',
        tip,
        reasoning: `Essential for proper ${technique.name.toLowerCase()} technique`,
        difficulty: technique.difficulty,
      });
    });

    // Add common mistakes as tips
    technique.commonMistakes.forEach(mistake => {
      tips.push({
        category: 'cooking',
        tip: `Avoid: ${mistake}`,
        reasoning: `Common mistake that can ruin ${technique.name.toLowerCase()}`,
        difficulty: technique.difficulty,
      });
    });

    // Add skill-level appropriate tips
    const skillTips = this.getSkillLevelTips(technique, skillLevel);
    tips.push(...skillTips);

    return tips;
  }

  /**
   * Get ingredient preparation tips
   */
  async getIngredientPreparationTips(ingredients: string[]): Promise<CookingTip[]> {
    const tips: CookingTip[] = [];

    ingredients.forEach(ingredient => {
      const prepTips = this.getIngredientSpecificTips(ingredient);
      tips.push(...prepTips);
    });

    return tips.slice(0, 8); // Limit to most relevant tips
  }

  /**
   * Recommend equipment for recipes
   */
  async recommendEquipment(recipe: Recipe): Promise<EquipmentRecommendation[]> {
    const recommendations: EquipmentRecommendation[] = [];
    const instructions = recipe.instructions || [];

    // Analyze cooking methods to determine equipment needs
    instructions.forEach(instruction => {
      const instText = typeof instruction === 'string' ? instruction : instruction.instruction;
      const equipment = this.identifyRequiredEquipment(instText);
      recommendations.push(...equipment);
    });

    // Add ingredient-specific equipment recommendations
    const ingredients = recipe.ingredients || [];
    ingredients.forEach(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
      const equipment = this.getIngredientEquipment(ingredientName);
      recommendations.push(...equipment);
    });

    // Remove duplicates and prioritize by necessity
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(r => [r.equipment, r])).values()
    );

    return uniqueRecommendations.sort((a, b) => {
      const necessityOrder = { 'required': 0, 'recommended': 1, 'optional': 2 };
      return necessityOrder[a.necessity] - necessityOrder[b.necessity];
    });
  }

  /**
   * Suggest flavor enhancements
   */
  async suggestFlavorEnhancements(
    recipe: Recipe,
    userPreferences: any
  ): Promise<FlavorEnhancement[]> {
    const enhancements: FlavorEnhancement[] = [];
    const cuisine = recipe.cuisine || 'international';
    const ingredients = recipe.ingredients || [];

    // Get cuisine-specific enhancements
    const cuisineEnhancements = this.getCuisineFlavorEnhancements(cuisine);
    enhancements.push(...cuisineEnhancements);

    // Get ingredient-based enhancements
    ingredients.forEach(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
      const ingredientEnhancements = this.getIngredientFlavorEnhancements(ingredientName);
      enhancements.push(...ingredientEnhancements);
    });

    // Filter based on user preferences
    const filteredEnhancements = this.filterEnhancementsByPreferences(
      enhancements,
      userPreferences
    );

    return filteredEnhancements.slice(0, 4); // Limit to 4 suggestions
  }

  /**
   * Provide cooking troubleshooting
   */
  async provideCookingTroubleshooting(issueDescription: string): Promise<CookingTip[]> {
    const issue = this.parseIssueDescription(issueDescription);
    const solutions = this.getTroubleshootingSolutions(issue);

    const tips: CookingTip[] = [];

    // Convert solutions to cooking tips
    solutions.immediateActions.forEach(action => {
      tips.push({
        category: 'cooking',
        tip: action,
        reasoning: `Immediate action to address: ${issue.problem}`,
        difficulty: 'intermediate',
      });
    });

    solutions.preventionTips.forEach(prevention => {
      tips.push({
        category: 'preparation',
        tip: prevention,
        reasoning: `Prevention strategy for: ${issue.problem}`,
        difficulty: 'beginner',
      });
    });

    solutions.alternativeApproaches.forEach(alternative => {
      tips.push({
        category: 'cooking',
        tip: alternative,
        reasoning: `Alternative approach for: ${issue.problem}`,
        difficulty: 'advanced',
      });
    });

    return tips;
  }

  /**
   * Generate conversational cooking advice with chef personality
   */
  async generateConversationalAdvice(
    userMessage: string,
    context: { recipes?: Recipe[], previousTips?: CookingTip[] }
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Analyze user intent and provide contextual, conversational responses
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      return this.generateHelpfulResponse(userMessage, context);
    }

    if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return this.generateImprovementAdvice(userMessage, context);
    }

    if (lowerMessage.includes('beginner') || lowerMessage.includes('new to cooking')) {
      return this.generateBeginnerEncouragement(userMessage, context);
    }

    return this.generateGeneralCulinaryAdvice(userMessage, context);
  }

  /**
   * Enhance language to sound more professional and human-like
   */
  private enhanceLanguageForProfessionalism(tip: string, skillLevel: SkillLevel): string {
    const professionalPhrases = {
      beginner: [
        "Here's a chef's secret: ",
        "In my experience, ",
        "A technique I always teach: ",
        "Something that will elevate your cooking: "
      ],
      intermediate: [
        "As you develop your skills, ",
        "A professional approach is to ",
        "Building on your foundation, ",
        "To take this to the next level: "
      ],
      advanced: [
        "At this stage in your culinary journey, ",
        "A master technique involves ",
        "Professional kitchens rely on ",
        "The hallmark of advanced cooking is "
      ],
      professional: [
        "In professional kitchens, we ",
        "Industry standard practice dictates ",
        "Executive chefs understand that ",
        "The culinary arts demand that we "
      ]
    };

    const phrases = professionalPhrases[skillLevel] || professionalPhrases.intermediate;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // Make the tip more conversational and professional
    const enhancedTip = tip
      .replace(/^(Avoid:|Don't|Never)/, 'I recommend avoiding')
      .replace(/^(Use|Try|Add)/, 'Consider using')
      .replace(/\.$/, ', which will significantly improve your results.');

    return `${randomPhrase}${enhancedTip.charAt(0).toLowerCase()}${enhancedTip.slice(1)}`;
  }

  /**
   * Add chef personality to reasoning
   */
  private addChefPersonality(reasoning: string): string {
    const personalityPhrases = [
      "This is fundamental because ",
      "In my culinary experience, ",
      "What makes this technique special is that ",
      "The science behind this is fascinating - ",
      "Professional chefs know that "
    ];

    const randomPhrase = personalityPhrases[Math.floor(Math.random() * personalityPhrases.length)];
    return `${randomPhrase}${reasoning.charAt(0).toLowerCase()}${reasoning.slice(1)}`;
  }

  /**
   * Generate helpful response for users asking for help
   */
  private generateHelpfulResponse(userMessage: string, context: any): string {
    const responses = [
      "I'm here to guide you through this! Let's break down what you're working on step by step.",
      "Don't worry - every chef faces challenges. Let me share some professional insights to help you succeed.",
      "I understand the frustration. In professional kitchens, we solve problems like this systematically.",
      "Let's troubleshoot this together. I've seen this situation many times in my culinary experience."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate improvement advice
   */
  private generateImprovementAdvice(userMessage: string, context: any): string {
    const responses = [
      "Excellent question! There are several professional techniques that can elevate your cooking significantly.",
      "I love your enthusiasm for improvement! Let me share some chef-level strategies.",
      "That's the mindset of a true culinary artist. Here are some advanced techniques to consider.",
      "Your dedication to excellence reminds me of the best chefs I've worked with. Let's explore some refinements."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate beginner encouragement
   */
  private generateBeginnerEncouragement(userMessage: string, context: any): string {
    const responses = [
      "Welcome to the wonderful world of cooking! Every master chef started exactly where you are now.",
      "I'm excited to be part of your culinary journey! Let's start with some foundational techniques that will serve you well.",
      "Cooking is one of life's greatest pleasures, and you're taking the perfect first steps.",
      "Your curiosity and willingness to learn are the most important ingredients in any kitchen. Let's build your confidence together."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate general culinary advice
   */
  private generateGeneralCulinaryAdvice(userMessage: string, context: any): string {
    const responses = [
      "That's a great culinary question! Let me share some professional insights on this topic.",
      "I appreciate your attention to detail - that's what separates good cooks from great ones.",
      "Your question touches on some fundamental principles of cooking. Let me explain the professional approach.",
      "This is exactly the kind of thoughtful inquiry that leads to culinary mastery."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Private helper methods

  private identifyTechniquesInText(text: string): CookingTechnique[] {
    const techniques: CookingTechnique[] = [];
    const lowerText = text.toLowerCase();

    // Check for technique keywords
    for (const [key, technique] of this.cookingTechniques.entries()) {
      if (lowerText.includes(key) ||
        technique.name.toLowerCase().split(' ').some(word => lowerText.includes(word))) {
        techniques.push(technique);
      }
    }

    return techniques;
  }

  private getDifficultyScore(difficulty: SkillLevel): number {
    const scores = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'professional': 4 };
    return scores[difficulty] || 2;
  }

  private async generateRecipeSpecificTips(recipe: Recipe, skillLevel: SkillLevel): Promise<CookingTip[]> {
    const tips: CookingTip[] = [];
    const ingredients = recipe.ingredients || [];
    const instructions = recipe.instructions || [];

    // Generate tips based on ingredients
    ingredients.forEach(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : (ingredient as any)?.name || String(ingredient);

      if (ingredientName.toLowerCase().includes('garlic')) {
        tips.push({
          category: 'preparation',
          tip: 'Crush garlic with the flat side of your knife before mincing to release more flavor compounds',
          reasoning: 'Crushing breaks cell walls, releasing allicin and other flavor compounds',
          difficulty: 'beginner',
        });
      }

      if (ingredientName.toLowerCase().includes('onion')) {
        tips.push({
          category: 'preparation',
          tip: 'Chill onions in the refrigerator for 30 minutes before cutting to reduce tears',
          reasoning: 'Cold temperatures slow the release of tear-inducing compounds',
          difficulty: 'beginner',
        });
      }

      if (ingredientName.toLowerCase().includes('meat') || ingredientName.toLowerCase().includes('chicken')) {
        tips.push({
          category: 'cooking',
          tip: 'Let meat rest at room temperature for 15-30 minutes before cooking for even cooking',
          reasoning: 'Room temperature meat cooks more evenly and retains more juices',
          difficulty: 'intermediate',
        });
      }
    });

    // Generate tips based on cooking methods
    instructions.forEach(instruction => {
      const instText = typeof instruction === 'string' ? instruction : (instruction as any)?.instruction || String(instruction);

      if (/sauté|pan.fry/i.test(instText)) {
        tips.push({
          category: 'cooking',
          tip: 'Heat the pan before adding oil, and heat the oil before adding ingredients',
          reasoning: 'Proper heating sequence prevents sticking and ensures even cooking',
          difficulty: 'intermediate',
        });
      }

      if (/season|salt/i.test(instText)) {
        tips.push({
          category: 'seasoning',
          tip: 'Season in layers throughout cooking, not just at the end',
          reasoning: 'Layered seasoning builds complex flavors and ensures even distribution',
          difficulty: 'intermediate',
        });
      }
    });

    // Add skill-level appropriate tips
    if (skillLevel === 'beginner') {
      tips.push({
        category: 'preparation',
        tip: 'Read through the entire recipe before starting and prep all ingredients first',
        reasoning: 'Mise en place (everything in place) prevents mistakes and ensures smooth cooking',
        difficulty: 'beginner',
      });
    }

    return tips;
  }

  private getGeneralCookingTips(skillLevel: SkillLevel): CookingTip[] {
    const tips: CookingTip[] = [
      {
        category: 'preparation',
        tip: 'Keep your knives sharp - a sharp knife is safer and more efficient than a dull one',
        reasoning: 'Sharp knives require less pressure and give you better control',
        difficulty: 'beginner',
      },
      {
        category: 'cooking',
        tip: 'Taste as you go and adjust seasoning throughout the cooking process',
        reasoning: 'Continuous tasting allows you to build flavors and catch issues early',
        difficulty: 'beginner',
      },
      {
        category: 'cooking',
        tip: 'Don\'t overcrowd the pan when searing or sautéing',
        reasoning: 'Overcrowding causes steaming instead of browning, reducing flavor development',
        difficulty: 'intermediate',
      },
    ];

    if (skillLevel === 'advanced' || skillLevel === 'professional') {
      tips.push({
        category: 'cooking',
        tip: 'Use the Maillard reaction to your advantage - proper browning creates complex flavors',
        reasoning: 'The Maillard reaction between amino acids and sugars creates hundreds of flavor compounds',
        difficulty: 'advanced',
      });
    }

    return tips;
  }

  private getSkillLevelTips(technique: CookingTechnique, skillLevel: SkillLevel): CookingTip[] {
    const tips: CookingTip[] = [];

    if (skillLevel === 'beginner' && technique.difficulty !== 'beginner') {
      tips.push({
        category: 'preparation',
        tip: `${technique.name} is an ${technique.difficulty} technique - take your time and practice`,
        reasoning: 'Building skills gradually leads to better results and confidence',
        difficulty: technique.difficulty,
      });
    }

    if (skillLevel === 'advanced' || skillLevel === 'professional') {
      tips.push({
        category: 'cooking',
        tip: `For ${technique.name.toLowerCase()}, focus on temperature control and timing precision`,
        reasoning: 'Advanced techniques require precise control for optimal results',
        difficulty: technique.difficulty,
      });
    }

    return tips;
  }

  private getIngredientSpecificTips(ingredient: string): CookingTip[] {
    const tips: CookingTip[] = [];
    const lowerIngredient = ingredient.toLowerCase();

    const ingredientTips: { [key: string]: CookingTip[] } = {
      'tomato': [{
        category: 'preparation',
        tip: 'Score an X on the bottom of tomatoes and blanch in boiling water for easy peeling',
        reasoning: 'The score allows the skin to separate easily when heated',
        difficulty: 'intermediate',
      }],
      'potato': [{
        category: 'preparation',
        tip: 'Soak cut potatoes in cold water to remove excess starch for crispier results',
        reasoning: 'Removing surface starch prevents gumminess and improves texture',
        difficulty: 'beginner',
      }],
      'mushroom': [{
        category: 'preparation',
        tip: 'Don\'t wash mushrooms - wipe them clean with a damp paper towel instead',
        reasoning: 'Mushrooms absorb water like sponges, which can make them soggy when cooked',
        difficulty: 'beginner',
      }],
      'herb': [{
        category: 'preparation',
        tip: 'Add delicate herbs like basil and parsley at the end of cooking to preserve their flavor',
        reasoning: 'Heat breaks down delicate herb compounds, reducing their flavor impact',
        difficulty: 'intermediate',
      }],
    };

    // Check for ingredient matches
    for (const [key, tipList] of Object.entries(ingredientTips)) {
      if (lowerIngredient.includes(key)) {
        tips.push(...tipList);
      }
    }

    return tips;
  }

  private identifyRequiredEquipment(instruction: string): EquipmentRecommendation[] {
    const equipment: EquipmentRecommendation[] = [];
    const lowerInstruction = instruction.toLowerCase();

    const equipmentPatterns: { [key: string]: EquipmentRecommendation } = {
      'sauté|pan.fry': {
        equipment: 'Large skillet or sauté pan',
        necessity: 'required',
        alternatives: ['Non-stick pan', 'Cast iron skillet', 'Stainless steel pan'],
        reason: 'Essential for proper sautéing technique and heat distribution',
      },
      'bake|roast': {
        equipment: 'Oven-safe baking dish or sheet pan',
        necessity: 'required',
        alternatives: ['Glass baking dish', 'Metal roasting pan', 'Cast iron Dutch oven'],
        reason: 'Required for oven cooking methods',
      },
      'whisk|whip': {
        equipment: 'Wire whisk',
        necessity: 'recommended',
        alternatives: ['Fork', 'Electric mixer', 'Immersion blender'],
        reason: 'Incorporates air and creates smooth textures',
      },
      'blend|puree': {
        equipment: 'Blender or food processor',
        necessity: 'required',
        alternatives: ['Immersion blender', 'Food mill', 'Potato masher'],
        reason: 'Necessary for achieving smooth, uniform textures',
      },
    };

    for (const [pattern, equipmentRec] of Object.entries(equipmentPatterns)) {
      if (new RegExp(pattern, 'i').test(lowerInstruction)) {
        equipment.push(equipmentRec);
      }
    }

    return equipment;
  }

  private getIngredientEquipment(ingredient: string): EquipmentRecommendation[] {
    const equipment: EquipmentRecommendation[] = [];
    const lowerIngredient = ingredient.toLowerCase();

    if (lowerIngredient.includes('garlic')) {
      equipment.push({
        equipment: 'Garlic press or microplane grater',
        necessity: 'recommended',
        alternatives: ['Sharp knife', 'Mortar and pestle'],
        reason: 'Efficiently processes garlic for maximum flavor release',
      });
    }

    if (lowerIngredient.includes('cheese') && lowerIngredient.includes('grated')) {
      equipment.push({
        equipment: 'Box grater or microplane',
        necessity: 'required',
        alternatives: ['Food processor with grating disc'],
        reason: 'Necessary for grating cheese to desired texture',
      });
    }

    return equipment;
  }

  private getCuisineFlavorEnhancements(cuisine: string): FlavorEnhancement[] {
    const enhancements: { [key: string]: FlavorEnhancement[] } = {
      'italian': [{
        name: 'Fresh Herb Finish',
        description: 'Add fresh basil, oregano, and parsley at the end of cooking',
        ingredients: ['fresh basil', 'oregano', 'parsley', 'extra virgin olive oil'],
        technique: 'Tear herbs by hand and drizzle with quality olive oil',
        skillLevel: 'beginner',
      }],
      'asian': [{
        name: 'Aromatic Oil Infusion',
        description: 'Create flavored oil with ginger, garlic, and scallions',
        ingredients: ['ginger', 'garlic', 'scallions', 'sesame oil'],
        technique: 'Gently heat oil with aromatics until fragrant',
        skillLevel: 'intermediate',
      }],
      'mexican': [{
        name: 'Citrus and Spice Finish',
        description: 'Brighten dishes with lime juice and fresh cilantro',
        ingredients: ['lime juice', 'cilantro', 'chili powder', 'cumin'],
        technique: 'Add citrus just before serving to maintain brightness',
        skillLevel: 'beginner',
      }],
    };

    return enhancements[cuisine.toLowerCase()] || [];
  }

  private getIngredientFlavorEnhancements(ingredient: string): FlavorEnhancement[] {
    const enhancements: FlavorEnhancement[] = [];
    const lowerIngredient = ingredient.toLowerCase();

    if (lowerIngredient.includes('chicken')) {
      enhancements.push({
        name: 'Herb Crust',
        description: 'Create a flavorful herb crust for chicken',
        ingredients: ['fresh thyme', 'rosemary', 'garlic', 'lemon zest'],
        technique: 'Mix herbs with oil and rub under and over skin',
        skillLevel: 'intermediate',
      });
    }

    if (lowerIngredient.includes('vegetable')) {
      enhancements.push({
        name: 'Caramelized Finish',
        description: 'Enhance vegetables with caramelization',
        ingredients: ['butter', 'brown sugar', 'balsamic vinegar'],
        technique: 'Cook until edges are golden and slightly sweet',
        skillLevel: 'intermediate',
      });
    }

    return enhancements;
  }

  private filterEnhancementsByPreferences(
    enhancements: FlavorEnhancement[],
    preferences: any
  ): FlavorEnhancement[] {
    // Filter based on dietary restrictions and preferences
    return enhancements.filter(enhancement => {
      // Check dietary restrictions
      if (preferences.dietaryRestrictions) {
        for (const restriction of preferences.dietaryRestrictions) {
          if (restriction.type === 'vegan' &&
            enhancement.ingredients.some(ing => /butter|dairy|meat/i.test(ing))) {
            return false;
          }
        }
      }

      // Check cuisine preferences
      if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
        // Prefer enhancements that match user's cuisine preferences
        return true; // For now, include all - would be more sophisticated in production
      }

      return true;
    });
  }

  private parseIssueDescription(description: string): CookingIssue {
    const lowerDesc = description.toLowerCase();

    let problem = 'general cooking issue';
    let context = description;

    // Identify common problems
    if (/overcooked|burnt|dry/i.test(lowerDesc)) {
      problem = 'overcooking';
    } else if (/undercooked|raw|tough/i.test(lowerDesc)) {
      problem = 'undercooking';
    } else if (/soggy|mushy|watery/i.test(lowerDesc)) {
      problem = 'texture issues';
    } else if (/bland|no flavor|tasteless/i.test(lowerDesc)) {
      problem = 'lack of flavor';
    } else if (/stuck|burning|smoking/i.test(lowerDesc)) {
      problem = 'heat management';
    }

    return { problem, context };
  }

  private getTroubleshootingSolutions(issue: CookingIssue): TroubleshootingSolution {
    const solutions = this.troubleshootingDatabase.get(issue.problem);

    if (solutions) {
      return solutions;
    }

    // Default solution
    return {
      diagnosis: 'General cooking challenge identified',
      immediateActions: [
        'Stop cooking immediately to prevent further issues',
        'Assess the current state of the dish',
        'Adjust heat or cooking method as needed',
      ],
      preventionTips: [
        'Monitor cooking progress more frequently',
        'Use proper temperature control',
        'Follow recipe timing guidelines',
      ],
      alternativeApproaches: [
        'Consider a different cooking method',
        'Adjust ingredient proportions',
        'Modify cooking temperature or time',
      ],
      skillLevel: 'intermediate',
    };
  }

  // Initialization methods

  private initializeCookingTechniques(): void {
    this.cookingTechniques = new Map([
      ['sauté', {
        name: 'Sauté',
        description: 'Quick cooking in a small amount of fat over medium-high to high heat with frequent stirring',
        difficulty: 'intermediate',
        timeRequired: '2-8 minutes',
        equipmentNeeded: ['skillet or sauté pan', 'spatula or wooden spoon'],
        tips: [
          'Heat pan before adding oil',
          'Don\'t overcrowd the pan',
          'Keep ingredients moving for even cooking',
          'Use high smoke point oils like canola or grapeseed',
        ],
        commonMistakes: [
          'Using too low heat',
          'Adding ingredients to cold pan',
          'Overcrowding the pan',
          'Not moving ingredients enough',
        ],
      }],
      ['roast', {
        name: 'Roast',
        description: 'Cooking with dry heat in an oven, typically at high temperatures',
        difficulty: 'beginner',
        timeRequired: '20 minutes to 3+ hours',
        equipmentNeeded: ['oven', 'roasting pan or sheet pan', 'meat thermometer'],
        tips: [
          'Preheat oven completely before cooking',
          'Use a meat thermometer for accuracy',
          'Let meat rest after roasting',
          'Don\'t open oven door frequently',
        ],
        commonMistakes: [
          'Not preheating oven',
          'Opening oven door too often',
          'Not using a thermometer',
          'Overcrowding the pan',
        ],
      }],
      ['braise', {
        name: 'Braise',
        description: 'Combination cooking method using both wet and dry heat - sear first, then slow cook in liquid',
        difficulty: 'advanced',
        timeRequired: '1.5-4 hours',
        equipmentNeeded: ['heavy pot with lid', 'oven'],
        tips: [
          'Sear meat thoroughly for flavor development',
          'Use low, steady heat',
          'Keep liquid at gentle simmer',
          'Don\'t rush the process',
        ],
        commonMistakes: [
          'Skipping the searing step',
          'Using too high heat',
          'Not enough liquid',
          'Lifting lid too frequently',
        ],
      }],
      ['grill', {
        name: 'Grill',
        description: 'Cooking over direct heat, typically on a grate over an open flame or hot coals',
        difficulty: 'intermediate',
        timeRequired: '5-30 minutes',
        equipmentNeeded: ['grill', 'grill brush', 'tongs', 'meat thermometer'],
        tips: [
          'Preheat grill thoroughly',
          'Clean and oil grates',
          'Create heat zones for different cooking needs',
          'Don\'t flip too frequently',
        ],
        commonMistakes: [
          'Not preheating grill',
          'Dirty grates',
          'Flipping too often',
          'Not managing heat zones',
        ],
      }],
      ['steam', {
        name: 'Steam',
        description: 'Cooking with moist heat using steam from boiling water',
        difficulty: 'beginner',
        timeRequired: '3-20 minutes',
        equipmentNeeded: ['steamer basket', 'pot with lid', 'water'],
        tips: [
          'Don\'t let water touch the food',
          'Keep lid on during cooking',
          'Don\'t overcook - vegetables should be crisp-tender',
          'Season after steaming',
        ],
        commonMistakes: [
          'Using too much water',
          'Overcooking vegetables',
          'Lifting lid during cooking',
          'Not seasoning properly',
        ],
      }],
      ['poach', {
        name: 'Poach',
        description: 'Gentle cooking in barely simmering liquid at low temperatures',
        difficulty: 'advanced',
        timeRequired: '5-45 minutes',
        equipmentNeeded: ['wide, shallow pan', 'slotted spoon'],
        tips: [
          'Keep liquid just below simmering',
          'Use acidulated water for eggs',
          'Don\'t let liquid boil vigorously',
          'Use fresh ingredients for best results',
        ],
        commonMistakes: [
          'Water too hot (boiling)',
          'Using old eggs for poaching',
          'Not using enough liquid',
          'Overcooking delicate items',
        ],
      }],
    ]);
  }

  private initializeEquipmentDatabase(): void {
    this.equipmentDatabase = new Map([
      ['knife', {
        types: ['chef\'s knife', 'paring knife', 'serrated knife'],
        maintenance: 'Keep sharp, hand wash, store properly',
        alternatives: ['food processor for chopping'],
      }],
      ['pan', {
        types: ['non-stick', 'stainless steel', 'cast iron', 'carbon steel'],
        maintenance: 'Season cast iron, avoid high heat with non-stick',
        alternatives: ['different pan materials for different techniques'],
      }],
      ['thermometer', {
        types: ['instant-read', 'probe', 'infrared'],
        maintenance: 'Calibrate regularly, clean after use',
        alternatives: ['visual and touch cues for experienced cooks'],
      }],
    ]);
  }

  private initializeFlavorProfiles(): void {
    this.flavorProfiles = new Map([
      ['umami', {
        ingredients: ['mushrooms', 'tomatoes', 'parmesan', 'soy sauce', 'anchovies'],
        techniques: ['browning', 'caramelization', 'fermentation'],
        pairings: ['works with most cuisines'],
      }],
      ['acid', {
        ingredients: ['lemon', 'lime', 'vinegar', 'wine', 'yogurt'],
        techniques: ['deglazing', 'marinating', 'finishing'],
        pairings: ['balances rich and fatty foods'],
      }],
      ['heat', {
        ingredients: ['chili peppers', 'black pepper', 'ginger', 'horseradish'],
        techniques: ['infusion', 'direct addition', 'oil infusion'],
        pairings: ['complements sweet and savory dishes'],
      }],
    ]);
  }

  private initializeTroubleshootingDatabase(): void {
    this.troubleshootingDatabase = new Map([
      ['overcooking', {
        diagnosis: 'Food has been exposed to heat for too long or at too high temperature',
        immediateActions: [
          'Remove from heat immediately',
          'If meat is overcooked, slice thinly and serve with sauce',
          'For vegetables, shock in ice water to stop cooking',
        ],
        preventionTips: [
          'Use a timer and check food regularly',
          'Use lower heat and cook longer',
          'Use a meat thermometer for proteins',
          'Learn visual and tactile cues for doneness',
        ],
        alternativeApproaches: [
          'Turn overcooked meat into a stew or soup',
          'Puree overcooked vegetables into a soup',
          'Use overcooked items as ingredients in other dishes',
        ],
        skillLevel: 'beginner',
      }],
      ['undercooking', {
        diagnosis: 'Food hasn\'t been cooked long enough or at sufficient temperature',
        immediateActions: [
          'Continue cooking with appropriate heat',
          'Check internal temperature with thermometer',
          'Cut food to check doneness throughout',
        ],
        preventionTips: [
          'Use proper cooking temperatures',
          'Allow adequate cooking time',
          'Don\'t rush the cooking process',
          'Learn proper doneness indicators',
        ],
        alternativeApproaches: [
          'Finish in the oven if stovetop cooking isn\'t working',
          'Cut into smaller pieces for faster cooking',
          'Use different cooking method (steam, braise, etc.)',
        ],
        skillLevel: 'beginner',
      }],
      ['texture issues', {
        diagnosis: 'Food has undesirable texture - too soft, mushy, or watery',
        immediateActions: [
          'Drain excess liquid if present',
          'Increase heat to evaporate moisture',
          'Add thickening agent if appropriate',
        ],
        preventionTips: [
          'Control moisture levels during cooking',
          'Don\'t overcook vegetables',
          'Use proper cooking techniques for each ingredient',
          'Salt vegetables to draw out moisture before cooking',
        ],
        alternativeApproaches: [
          'Transform into a puree or soup',
          'Add crunchy elements for texture contrast',
          'Use as filling for other dishes',
        ],
        skillLevel: 'intermediate',
      }],
      ['lack of flavor', {
        diagnosis: 'Dish is bland and lacks seasoning or flavor development',
        immediateActions: [
          'Taste and adjust seasoning gradually',
          'Add acid (lemon, vinegar) to brighten flavors',
          'Add fresh herbs or aromatics',
        ],
        preventionTips: [
          'Season in layers throughout cooking',
          'Taste frequently and adjust',
          'Build flavors with browning and caramelization',
          'Use quality ingredients and proper techniques',
        ],
        alternativeApproaches: [
          'Create a flavorful sauce or garnish',
          'Add umami-rich ingredients',
          'Use finishing salts or flavored oils',
        ],
        skillLevel: 'beginner',
      }],
      ['heat management', {
        diagnosis: 'Issues with temperature control causing burning, sticking, or uneven cooking',
        immediateActions: [
          'Adjust heat immediately',
          'Move pan off heat if necessary',
          'Add liquid if food is sticking',
        ],
        preventionTips: [
          'Preheat pans properly',
          'Use appropriate heat levels for each technique',
          'Monitor cooking closely',
          'Use proper cookware for the job',
        ],
        alternativeApproaches: [
          'Transfer to oven for more even heat',
          'Use different cookware',
          'Adjust cooking method entirely',
        ],
        skillLevel: 'intermediate',
      }],
    ]);
  }
}