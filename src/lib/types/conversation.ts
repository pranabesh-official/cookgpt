// Enhanced conversation types for intelligent chef assistant

export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentIntent: UserIntent;
  conversationHistory: ConversationTurn[];
  userPreferences: UserPreferences;
  availableIngredients: string[];
  timeContext: TimeContext;
  mealContext: MealContext;
  nutritionalGoals: NutritionalGoal[];
  cookingConstraints: CookingConstraint[];
}

export interface UserIntent {
  type: IntentType;
  confidence: number;
  entities: ExtractedEntity[];
  recipeCountPreference: number;
  specificRequirements: string[];
}

export type IntentType = 
  | 'recipe_request'
  | 'ingredient_based_cooking'
  | 'nutritional_advice'
  | 'cooking_technique_help'
  | 'meal_planning'
  | 'dietary_modification'
  | 'cooking_troubleshooting';

export interface ExtractedEntity {
  type: 'ingredient' | 'cuisine' | 'meal_type' | 'cooking_method' | 'dietary_restriction';
  value: string;
  confidence: number;
}

export interface ConversationTurn {
  id: string;
  userMessage: string;
  botResponse: string;
  timestamp: Date;
  intent?: UserIntent;
  recipes?: Recipe[];
  context?: Partial<ConversationContext>;
}

export interface ConversationMemory {
  shortTermMemory: ShortTermMemory;
  longTermMemory: LongTermMemory;
  userPreferences: UserPreferences;
  conversationHistory: ConversationTurn[];
}

export interface ShortTermMemory {
  currentSession: ConversationTurn[];
  recentPreferences: UserPreference[];
  contextualIngredients: string[];
  currentMealContext: MealContext;
}

export interface LongTermMemory {
  dietaryRestrictions: DietaryRestriction[];
  favoriteIngredients: string[];
  cookingSkillLevel: SkillLevel;
  preferredCuisines: string[];
  healthGoals: HealthGoal[];
  conversationSummaries: ConversationSummary[];
}

export interface ConversationSummary {
  id: string;
  userId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  keyTopics: string[];
  learnedPreferences: UserPreference[];
  recipeInterests: string[];
  summary: string;
}

export interface UserPreference {
  type: 'dietary' | 'cuisine' | 'ingredient' | 'cooking_method' | 'meal_timing';
  value: string;
  strength: number; // 0-1, how strong this preference is
  lastUpdated: Date;
  source: 'explicit' | 'inferred';
}

export interface TimeContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  isWeekend: boolean;
}

export interface MealContext {
  mealType: MealType;
  servingSize: number;
  timeConstraints: TimeConstraint;
  occasionType: 'casual' | 'formal' | 'family' | 'entertaining';
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'appetizer';

export interface TimeConstraint {
  maxPrepTime: number; // minutes
  maxCookTime: number; // minutes
  urgency: 'low' | 'medium' | 'high';
}

export interface NutritionalGoal {
  type: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'heart_health' | 'diabetes_management';
  priority: 'low' | 'medium' | 'high';
  targetValue?: number;
}

export interface CookingConstraint {
  type: 'equipment' | 'skill_level' | 'dietary' | 'budget' | 'time';
  description: string;
  severity: 'flexible' | 'moderate' | 'strict';
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface ConversationResponse {
  message: string;
  recipes?: Recipe[];
  nutritionalAdvice?: NutritionalAdvice;
  cookingTips?: CookingTip[];
  followUpQuestions?: string[];
  recipeCount: number; // 1-7 based on context
  confidence: number;
  intent: UserIntent;
}

export interface NutritionalAdvice {
  category: 'general' | 'specific_condition' | 'ingredient_focus';
  advice: string;
  scientificBasis?: string;
  applicableRecipes?: string[];
}

export interface CookingTip {
  category: 'preparation' | 'cooking' | 'seasoning' | 'presentation' | 'storage';
  tip: string;
  reasoning: string;
  difficulty: SkillLevel;
}

// Re-export existing Recipe interface with enhancements
export interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: EnhancedIngredient[];
  instructions: EnhancedInstruction[];
  cookingTime: string;
  prepTime?: string;
  totalTime?: string;
  servings: number;
  difficulty: SkillLevel;
  tags: string[];
  cuisine?: string;
  mealType?: MealType[];
  calories?: number;
  imageUrl?: string;
  
  // Enhanced nutritional information
  nutritionalInfo?: NutritionalAnalysis;
  healthBenefits?: HealthBenefit[];
  dietaryCompliance?: DietaryCompliance;
  
  // Professional insights
  chefTips?: ChefTip[];
  cookingTechniques?: CookingTechnique[];
  equipmentRecommendations?: EquipmentRecommendation[];
  
  // Customization options
  substitutions?: IngredientSubstitution[];
  scalingOptions?: ScalingOption[];
  flavorVariations?: FlavorVariation[];
  
  // AI generation metadata
  generationContext?: GenerationContext;
  confidenceScore?: number;
}

export interface EnhancedIngredient {
  name: string;
  amount: string;
  unit: string;
  category?: IngredientCategory;
  nutritionalValue?: NutritionalValue;
  seasonality?: SeasonalInfo;
  substitutions?: string[];
  preparationNotes?: string;
}

export interface EnhancedInstruction {
  step: number;
  instruction: string;
  technique?: CookingTechnique;
  timeEstimate?: string;
  temperature?: string;
  visualCues?: string[];
  commonMistakes?: string[];
  chefTips?: string[];
}

export interface NutritionalAnalysis {
  calories: number;
  macronutrients: Macronutrients;
  micronutrients: Micronutrient[];
  healthScore: number;
  dietaryFiberContent: number;
  sodiumContent: number;
  sugarContent: number;
  healthBenefits: string[];
  nutritionalWarnings?: string[];
}

export interface Macronutrients {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface Micronutrient {
  name: string;
  amount: number;
  unit: string;
  dailyValuePercentage?: number;
}

export interface HealthBenefit {
  benefit: string;
  description: string;
  scientificBasis?: string;
}

export interface DietaryCompliance {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
  lowSodium: boolean;
  lowSugar: boolean;
  keto: boolean;
  paleo: boolean;
}

export interface ChefTip {
  category: 'preparation' | 'cooking' | 'seasoning' | 'presentation';
  tip: string;
  reasoning: string;
  applicableSteps?: number[];
}

export interface CookingTechnique {
  name: string;
  description: string;
  difficulty: SkillLevel;
  timeRequired: string;
  equipmentNeeded: string[];
  tips: string[];
  commonMistakes: string[];
}

export interface EquipmentRecommendation {
  equipment: string;
  necessity: 'required' | 'recommended' | 'optional';
  alternatives?: string[];
  reason: string;
}

export interface IngredientSubstitution {
  original: string;
  substitute: string;
  ratio: string;
  notes?: string;
}

export interface ScalingOption {
  servings: number;
  adjustments: {
    ingredient: string;
    newAmount: string;
  }[];
}

export interface FlavorVariation {
  name: string;
  description: string;
  modifications: {
    ingredient: string;
    change: string;
  }[];
}

export interface GenerationContext {
  prompt: string;
  userPreferences: UserPreferences;
  constraints: CookingConstraint[];
  timestamp: Date;
}

export type IngredientCategory = 
  | 'protein' 
  | 'vegetable' 
  | 'fruit' 
  | 'grain' 
  | 'dairy' 
  | 'spice' 
  | 'herb' 
  | 'condiment' 
  | 'oil' 
  | 'sweetener';

export interface NutritionalValue {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface SeasonalInfo {
  peakSeason: string[];
  availability: 'year-round' | 'seasonal' | 'limited';
  bestMonths?: string[];
}

// User preferences from existing auth context
export interface UserPreferences {
  onboardingCompleted?: boolean;
  dietaryRestrictions?: DietaryRestriction[];
  cuisinePreferences?: string[];
  cookingSkillLevel?: SkillLevel;
  healthGoals?: HealthGoal[];
  allergies?: string[];
  favoriteIngredients?: string[];
  dislikedIngredients?: string[];
  mealPlanningPreferences?: MealPlanningPreference;
}

export interface DietaryRestriction {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
}

export interface HealthGoal {
  type: string;
  target?: number;
  timeframe?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MealPlanningPreference {
  mealsPerDay: number;
  prepTime: 'minimal' | 'moderate' | 'extensive';
  batchCooking: boolean;
  budgetConstraints?: 'low' | 'medium' | 'high';
}