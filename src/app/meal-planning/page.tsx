"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { generatePersonalizedRecipes, Recipe, isGeminiAvailable } from "@/lib/gemini-service";
import { processRecipeImageUrl } from "@/lib/storage-service";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => Promise<void>;
}

// Recipe Detail Modal Component
function RecipeModal({ recipe, isOpen, onClose, onSave }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] w-[95vw] overflow-hidden p-0 flex flex-col" showCloseButton={false}>
        <DialogTitle className="sr-only">{recipe.title}</DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header with Image */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-accent/20 via-accent/10 to-accent/20 flex-shrink-0">
            {recipe.imageUrl ? (
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Utensils className="w-16 h-16 text-accent/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-base sm:text-lg opacity-90 line-clamp-2">{recipe.description}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <div className="p-4 sm:p-6 space-y-6 pb-8">
              {/* Recipe Stats */}
              <div className="flex flex-wrap items-center gap-6 p-4 bg-accent/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.cookingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
                {recipe.calories && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-destructive" />
                    <span className="font-medium">{recipe.calories} calories</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Ingredients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Cooking Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 pb-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                  onClick={() => onSave(recipe)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Recipe
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Add share functionality here if needed
                    if (navigator.share) {
                      navigator.share({
                        title: recipe.title,
                        text: recipe.description,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(`Check out this recipe: ${recipe.title}`);
                      toast.success('Recipe link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Recipe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Clock,
  ChevronDown,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Sandwich,
  Moon,
  Shuffle,
  Save,
  Search,
  X,
  BookOpen,
  Utensils,
  Target,
  Plus,
  RefreshCw,
  Flame,
  Users,
  Star,
  Heart,
  Share2,
  Eye,
  ChefHat
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MealPlan {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  meals: WeeklyMeals;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  status: 'draft' | 'active' | 'completed';
  userId: string;
  preferences: MealPlanPreferences;
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyMeals {
  [key: string]: DayMeals; // 'monday', 'tuesday', etc.
}

interface DayMeals {
  breakfast?: MealSlot;
  lunch?: MealSlot;
  dinner?: MealSlot;
  snack?: MealSlot;
  [key: string]: MealSlot | undefined;
}

interface MealSlot {
  id: string;
  recipe: Recipe;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  scheduledTime?: string;
  notes?: string;
}

interface MealPlanPreferences {
  calorieTarget: number;
  proteinPercentage: number;
  carbPercentage: number;
  fatPercentage: number;
  mealsPerDay: number;
  avoidIngredients: string[];
  preferredCuisines: string[];
  cookingTimePreference: 'quick' | 'medium' | 'long' | 'any';
  inventoryItems?: string[];
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export default function MealPlanningPage() {
  const router = useRouter();
  const { user, userPreferences, signOut, loading } = useAuth();
  const isMobile = useIsMobile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoadingMealPlans, setIsLoadingMealPlans] = useState(false);
  const [isSavingMealPlan, setIsSavingMealPlan] = useState(false);
  const [isDeletingMealPlan, setIsDeletingMealPlan] = useState<string | null>(null);
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calendar and Meal Planning State
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeals>({});
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{day: string, mealType: string} | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Meal Plan Preferences
  const [mealPlanPrefs, setMealPlanPrefs] = useState<MealPlanPreferences>({
    calorieTarget: 2000,
    proteinPercentage: 25,
    carbPercentage: 45,
    fatPercentage: 30,
    mealsPerDay: 3,
    avoidIngredients: [],
    preferredCuisines: [],
    cookingTimePreference: 'any',
    inventoryItems: []
  });
  
  // Nutrition tracking
  const [dailyNutrition, setDailyNutrition] = useState<{[key: string]: NutritionSummary}>({});
  
  // Recipe Modal State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mounting
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router, hasMounted]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && hasMounted) {
      loadMealPlans();
      loadAvailableRecipes();
    }
  }, [user, hasMounted]);
  


  // Initialize meal plan preferences from user preferences
  useEffect(() => {
    if (userPreferences && hasMounted) {
      setMealPlanPrefs(prev => ({
        ...prev,
        calorieTarget: 2000, // Default calorie target since UserPreferences doesn't have calorieGoal
        avoidIngredients: userPreferences.dietaryRestrictions || [],
        preferredCuisines: userPreferences.cuisinePreferences || [],
        cookingTimePreference: userPreferences.cookingTime === '15min' ? 'quick' : 
                              userPreferences.cookingTime === '30min' ? 'medium' : 
                              userPreferences.cookingTime === '1hr+' ? 'long' : 'any'
      }));
    }
  }, [userPreferences, hasMounted]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Utility Functions
  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        name: date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        shortName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }
    return days;
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      case 'snack': return Sandwich;
      default: return Utensils;
    }
  };

  // Load saved recipes for meal planning
  const loadAvailableRecipes = async () => {
    if (!user || !db) return;
    
    try {
      const savedRecipesQuery = query(
        collection(db!, 'savedRecipes'),
        where('userId', '==', user.uid),
        limit(50)
      );
      
      const querySnapshot = await getDocs(savedRecipesQuery);
      const recipes: Recipe[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: data.id || doc.id,
          title: data.title,
          description: data.description,
          ingredients: data.ingredients || [],
          instructions: data.instructions || [],
          cookingTime: data.cookingTime || '30 mins',
          servings: data.servings || 4,
          difficulty: data.difficulty || 'Medium',
          tags: data.tags || [],
          calories: data.calories || null,
          imageUrl: data.imageUrl
        });
      });
      
      setAvailableRecipes(recipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  // Auto-generate meal plan with AI
  const generateMealPlan = async () => {
    if (!user || !userPreferences) {
      toast.error('Please complete your preferences first', {
        description: 'Please go to preferences to set up your dietary preferences and cooking style.'
      });
      return;
    }

    if (!isGeminiAvailable()) {
      toast.error('AI service not available', {
        description: 'Please check your Gemini API key configuration.'
      });
      return;
    }

    setIsGeneratingPlan(true);
    
    try {
      console.log('Starting meal plan generation with preferences:', userPreferences);
      
      toast.info('Generating your personalized meal plan...', {
        description: 'This may take a moment while we create balanced meals for you.'
      });

      // Step 1: Apply user preferences & constraints
      const planPreferences = {
        dietaryRestrictions: userPreferences.dietaryRestrictions || [],
        cuisinePreferences: userPreferences.cuisinePreferences || [],
        mealTypeFocus: userPreferences.mealTypeFocus || [],
        skillLevel: userPreferences.skillLevel || 'beginner',
        cookingTime: userPreferences.cookingTime || '30min',
        goals: userPreferences.goals || [],
        calorieTarget: mealPlanPrefs.calorieTarget,
        inventoryItems: mealPlanPrefs.inventoryItems || []
      };

      console.log('Mapped preferences for AI:', planPreferences);

      // Step 2: Generate recipes for each meal slot
      const weekDays = getWeekDays();
      const newWeeklyMeals: WeeklyMeals = {};
      const usedMainIngredients: string[] = [];
      const usedCuisines: string[] = [];

      for (const day of weekDays) {
        const dayName = day.name;
        newWeeklyMeals[dayName] = {};

        // Generate meals for each slot - only 3 meals for this version
        const mealTypes = ['breakfast', 'lunch', 'dinner'];

        for (const mealType of mealTypes) {
          try {
            console.log(`Generating ${mealType} for ${day.shortName}...`);
            
            // Generate contextual prompt for each meal
            let mealPrompt = `${mealType} recipe for ${day.shortName}`;
            
            // Add variety constraints
            if (usedMainIngredients.length > 0) {
              mealPrompt += `. Avoid using these main ingredients: ${usedMainIngredients.slice(-3).join(', ')}`;
            }
            
            // Add cuisine rotation
            if (usedCuisines.length > 0) {
              mealPrompt += `. Try a different cuisine from: ${planPreferences.cuisinePreferences.join(', ')}`;
            }

            // Add calorie target for meal
            const mealCalorieTarget = Math.round(mealPlanPrefs.calorieTarget / mealPlanPrefs.mealsPerDay);
            mealPrompt += `. Target around ${mealCalorieTarget} calories`;

            console.log(`Calling AI for ${mealType} with target calories: ${mealCalorieTarget}`);
            
            // Generate recipe using AI
            const recipes = await generatePersonalizedRecipes(planPreferences, 1);

            if (recipes.length > 0) {
              const recipe = recipes[0];
              console.log(`Successfully generated recipe: ${recipe.title}`);
              
              // Extract main ingredient and cuisine for variety tracking
              const mainIngredient = recipe.ingredients[0]?.split(' ').slice(-1)[0] || '';
              if (mainIngredient) usedMainIngredients.push(mainIngredient);
              
              // Track cuisine from tags
              const cuisineTag = recipe.tags.find(tag => 
                ['italian', 'mexican', 'asian', 'american', 'indian', 'mediterranean'].includes(tag.toLowerCase())
              );
              if (cuisineTag) usedCuisines.push(cuisineTag);

              // Calculate nutrition
              const estimatedCalories = recipe.calories || mealCalorieTarget;
              const protein = Math.round(estimatedCalories * (mealPlanPrefs.proteinPercentage / 100) / 4);
              const carbs = Math.round(estimatedCalories * (mealPlanPrefs.carbPercentage / 100) / 4);
              const fat = Math.round(estimatedCalories * (mealPlanPrefs.fatPercentage / 100) / 9);

              newWeeklyMeals[dayName][mealType as keyof DayMeals] = {
                id: `${dayName}-${mealType}-${Date.now()}`,
                recipe,
                servings: recipe.servings,
                calories: estimatedCalories,
                protein,
                carbs,
                fat
              };
              
              console.log(`Added ${mealType} to ${dayName}: ${recipe.title} (${estimatedCalories} cal)`);
            } else {
              console.log(`No recipes generated for ${mealType} on ${dayName}`);
            }
          } catch (error) {
            console.error(`Error generating ${mealType} for ${dayName}:`, error);
          }
        }
      }

      console.log('Final weekly meals:', newWeeklyMeals);
      
      if (Object.keys(newWeeklyMeals).length === 0 || Object.values(newWeeklyMeals).every(day => Object.keys(day).length === 0)) {
        toast.error('Failed to generate meal plan', {
          description: 'No recipes were generated. Please check your preferences and try again.'
        });
        return;
      }
      
      setWeeklyMeals(newWeeklyMeals);
      calculateDailyNutrition(newWeeklyMeals);
      
      toast.success('Meal plan generated successfully!', {
        description: `Generated ${Object.values(newWeeklyMeals).reduce((total, day) => total + Object.keys(day).length, 0)} meals for your week.`
      });

    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Calculate daily nutrition totals
  const calculateDailyNutrition = (meals: WeeklyMeals) => {
    const nutrition: {[key: string]: NutritionSummary} = {};
    
    Object.entries(meals).forEach(([day, dayMeals]) => {
      let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      Object.values(dayMeals).forEach(meal => {
        if (meal) {
          dailyTotals.calories += meal.calories;
          dailyTotals.protein += meal.protein;
          dailyTotals.carbs += meal.carbs;
          dailyTotals.fat += meal.fat;
        }
      });
      
      nutrition[day] = dailyTotals;
    });
    
    setDailyNutrition(nutrition);
  };

  // Add recipe to specific meal slot
  const addRecipeToSlot = (day: string, mealType: string, recipe: Recipe) => {
    const estimatedCalories = recipe.calories || Math.round(mealPlanPrefs.calorieTarget / mealPlanPrefs.mealsPerDay);
    const protein = Math.round(estimatedCalories * (mealPlanPrefs.proteinPercentage / 100) / 4);
    const carbs = Math.round(estimatedCalories * (mealPlanPrefs.carbPercentage / 100) / 4);
    const fat = Math.round(estimatedCalories * (mealPlanPrefs.fatPercentage / 100) / 9);

    const newMeal: MealSlot = {
      id: `${day}-${mealType}-${Date.now()}`,
      recipe,
      servings: recipe.servings,
      calories: estimatedCalories,
      protein,
      carbs,
      fat
    };

    setWeeklyMeals(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: newMeal
      }
    }));

    setSelectedMealSlot(null);
    calculateDailyNutrition({
      ...weeklyMeals,
      [day]: {
        ...weeklyMeals[day],
        [mealType]: newMeal
      }
    });
  };

  // Remove meal from slot
  const removeMealFromSlot = (day: string, mealType: string) => {
    setWeeklyMeals(prev => {
      const newMeals = { ...prev };
      if (newMeals[day]) {
        delete newMeals[day][mealType as keyof DayMeals];
      }
      return newMeals;
    });
    
    calculateDailyNutrition(weeklyMeals);
  };

  // Save meal plan to database
  const saveMealPlan = async () => {
    if (!user || !db || Object.keys(weeklyMeals).length === 0) {
      toast.error('No meal plan to save');
      return;
    }

    setIsSavingMealPlan(true);

    try {
      const weekDays = getWeekDays();
      const startDate = weekDays[0].date;
      const endDate = weekDays[6].date;

      // Calculate totals
      const totalNutrition = Object.values(dailyNutrition).reduce(
        (acc, day) => ({
          calories: acc.calories + day.calories,
          protein: acc.protein + day.protein,
          carbs: acc.carbs + day.carbs,
          fat: acc.fat + day.fat
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Clean the meals data for Firestore storage - optimized for size with image processing
      const cleanMeals: WeeklyMeals = {};
      
      // Process all recipes with image uploads first
      for (const [day, dayMeals] of Object.entries(weeklyMeals)) {
        cleanMeals[day] = {};
        
        for (const [mealType, meal] of Object.entries(dayMeals)) {
          if (meal) {
            // Process image URL - upload to Firebase Storage if it's a base64 data URL
            let processedImageUrl = meal.recipe.imageUrl;
            if (meal.recipe.imageUrl && meal.recipe.imageUrl.startsWith('data:')) {
              console.log(`🖼️ Processing image for ${meal.recipe.title} (${mealType})...`);
              processedImageUrl = await processRecipeImageUrl(
                meal.recipe.imageUrl,
                user.uid,
                meal.recipe.title
              );
              console.log(`✅ Image processed for ${meal.recipe.title}:`, processedImageUrl ? 'URL available' : 'No image');
            } else if (meal.recipe.imageUrl) {
              console.log(`🔗 Using existing URL for ${meal.recipe.title}: Already Firebase Storage or HTTP URL`);
            } else {
              console.log(`🚫 No image for ${meal.recipe.title}`);
            }
            
            // Create a minimal meal object to reduce payload size
            const cleanMeal: any = {
              id: meal.id,
              recipe: {
                id: meal.recipe.id,
                title: meal.recipe.title,
                // Truncate description to reduce size
                description: (meal.recipe.description || '').substring(0, 200),
                // Only keep essential ingredients (first 10)
                ingredients: (meal.recipe.ingredients || []).slice(0, 10),
                // Only keep essential instructions (first 5)
                instructions: (meal.recipe.instructions || []).slice(0, 5),
                cookingTime: meal.recipe.cookingTime || '',
                servings: meal.recipe.servings || 1,
                difficulty: meal.recipe.difficulty || 'Medium',
                // Limit tags to reduce size
                tags: (meal.recipe.tags || []).slice(0, 5),
                calories: meal.recipe.calories || null,
                // Store the processed image URL (Firebase Storage URL or HTTP URL)
                imageUrl: processedImageUrl
              },
              servings: meal.servings,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat
            };

            // Only add optional fields if they have values
            if (meal.scheduledTime && meal.scheduledTime.trim() !== '') {
              cleanMeal.scheduledTime = meal.scheduledTime;
            }
            if (meal.notes && meal.notes.trim() !== '') {
              cleanMeal.notes = meal.notes;
            }

            cleanMeals[day][mealType as keyof DayMeals] = cleanMeal;
          }
        }
      }

      const mealPlanData = {
        title: `Meal Plan - ${startDate.toLocaleDateString()}`,
        description: 'AI-generated personalized meal plan',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        meals: cleanMeals,
        totalCalories: totalNutrition.calories,
        totalProtein: totalNutrition.protein,
        totalCarbs: totalNutrition.carbs,
        totalFat: totalNutrition.fat,
        status: 'active' as const,
        userId: user.uid,
        preferences: {
          calorieTarget: mealPlanPrefs.calorieTarget || 2000,
          proteinPercentage: mealPlanPrefs.proteinPercentage || 25,
          carbPercentage: mealPlanPrefs.carbPercentage || 45,
          fatPercentage: mealPlanPrefs.fatPercentage || 30,
          mealsPerDay: 3, // Fixed to 3 meals for this version
          avoidIngredients: mealPlanPrefs.avoidIngredients || [],
          preferredCuisines: mealPlanPrefs.preferredCuisines || [],
          cookingTimePreference: mealPlanPrefs.cookingTimePreference || 'any',
          inventoryItems: mealPlanPrefs.inventoryItems || []
        },
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      // Remove any undefined values from the entire meal plan data
      const cleanMealPlanData = JSON.parse(JSON.stringify(mealPlanData, (key, value) => {
        if (value === undefined) {
          return null; // Convert undefined to null for Firestore
        }
        return value;
      }));

      // Check payload size before saving
      const payloadSize = new Blob([JSON.stringify(cleanMealPlanData)]).size;
      const maxSize = 1000000; // 1MB limit
      
      if (payloadSize > maxSize) {
        console.warn(`Meal plan payload size: ${payloadSize} bytes (${Math.round(payloadSize / 1024)}KB)`);
        
        // Further reduce data if still too large
        if (payloadSize > maxSize * 2) {
          toast.error('Meal plan too large to save', {
            description: 'Please reduce the number of recipes or simplify your meal plan.'
          });
          return;
        }
        
        toast.warning('Large meal plan detected', {
          description: 'Saving optimized version with reduced data.'
        });
      }


      
      // Show progress toast
      toast.info('Saving meal plan...', {
        description: 'Please wait while we save your plan.'
      });
      
      const docRef = await addDoc(collection(db!, 'mealPlans'), cleanMealPlanData);
      
      // Show progress toast for refresh
      toast.info('Refreshing meal plans...', {
        description: 'Loading your updated meal plans list.'
      });

      // Create a minimal meal plan summary for local state (without full meal data)
      const newMealPlan: MealPlan = {
        id: docRef.id,
        title: cleanMealPlanData.title,
        description: cleanMealPlanData.description,
        startDate: new Date(cleanMealPlanData.startDate),
        endDate: new Date(cleanMealPlanData.endDate),
        // Don't store full meals data in local state to reduce memory usage
        meals: {},
        totalCalories: cleanMealPlanData.totalCalories,
        totalProtein: cleanMealPlanData.totalProtein,
        totalCarbs: cleanMealPlanData.totalCarbs,
        totalFat: cleanMealPlanData.totalFat,
        status: cleanMealPlanData.status,
        userId: cleanMealPlanData.userId,
        preferences: cleanMealPlanData.preferences,
        createdAt: new Date(cleanMealPlanData.createdAt),
        updatedAt: new Date()
      };
      

      
      // Add to local state immediately
      setMealPlans(prev => [newMealPlan, ...prev]);
      
      // Refresh meal plans list from Firestore to ensure consistency
      await loadMealPlans();
      
      // Show success message after refresh is complete
      toast.success('Meal plan saved and loaded!', {
        description: `Your meal plan has been saved and is now visible in your saved plans.`
      });
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan', {
        description: 'Please check your connection and try again.'
      });
    } finally {
      // Keep loading state active for a moment to show completion
      setTimeout(() => {
        setIsSavingMealPlan(false);
      }, 500);
    }
  };

  // Load user's meal plans with fallback query strategy
  const loadMealPlans = async () => {
    if (!user || !db) return;
    
    setIsLoadingMealPlans(true);
    
    try {
      
      let mealPlansQuery;
      let plans: MealPlan[] = [];
      
      // Try with createdAt ordering first (if index is ready)
      try {
        mealPlansQuery = query(
          collection(db!, 'mealPlans'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(mealPlansQuery);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Handle both Firestore Timestamp and ISO string dates
          const startDate = data.startDate?.toDate?.() || new Date(data.startDate);
          const endDate = data.endDate?.toDate?.() || new Date(data.endDate);
          const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
          const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);
          
          plans.push({
            ...data,
            id: doc.id,
            startDate,
            endDate,
            createdAt,
            updatedAt
          } as MealPlan);
        });
        
      } catch (indexError) {
        
        // Fallback: query without ordering (uses existing userId index)
        try {
          mealPlansQuery = query(
            collection(db!, 'mealPlans'),
            where('userId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(mealPlansQuery);
          
                  querySnapshot.forEach((doc) => {
          const data = doc.data();
            
            // Handle both Firestore Timestamp and ISO string dates
            const startDate = data.startDate?.toDate?.() || new Date(data.startDate);
            const endDate = data.endDate?.toDate?.() || new Date(data.endDate);
            const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
            const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);
            
            plans.push({
              ...data,
              id: doc.id,
              startDate,
              endDate,
              createdAt,
              updatedAt
            } as MealPlan);
          });
          
          // Sort locally by createdAt (newest first)
          plans.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      setMealPlans(plans);
      
    } catch (error) {
      console.error('Error loading meal plans:', error);
      
      // More specific error message based on error type
      if (error instanceof Error && error.message.includes('index')) {
        toast.error('Index building in progress', {
          description: 'Meal plans will be available shortly. Please wait a few minutes and try again.'
        });
      } else {
        toast.error('Failed to load meal plans', {
          description: 'Please check your connection and try again.'
        });
      }
    } finally {
      setIsLoadingMealPlans(false);
    }
  };

  // Load a saved meal plan into the current view
  const loadSavedMealPlan = async (plan: MealPlan) => {
    if (!user || !db) return;
    
    setIsLoadingMealPlan(plan.id);
    
    try {
      // Load the full meal plan data from Firestore
      const planDoc = await getDoc(doc(db!, 'mealPlans', plan.id));
      
      if (planDoc.exists()) {
        const fullPlanData = planDoc.data();
        

        
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setWeeklyMeals(fullPlanData.meals || {});
        calculateDailyNutrition(fullPlanData.meals || {});
        
        // Set the current week to match the saved plan
        if (plan.startDate) {
          setCurrentWeek(new Date(plan.startDate));
        }
        
        toast.success('Meal plan loaded!', {
          description: `${plan.title} has been loaded into the planner.`
        });
      } else {
        toast.error('Meal plan not found', {
          description: 'The meal plan may have been deleted.'
        });
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      toast.error('Failed to load meal plan', {
        description: 'Please try again.'
      });
    } finally {
      setIsLoadingMealPlan(null);
    }
  };

  // Delete a meal plan
  const deleteMealPlan = async (planId: string) => {
    if (!user || !db) return;
    
    setIsDeletingMealPlan(planId);
    
    try {
      await deleteDoc(doc(db!, 'mealPlans', planId));
      
      toast.success('Meal plan deleted!', {
        description: 'The meal plan has been removed successfully.'
      });
      
      // Remove from local state immediately
      setMealPlans(prev => prev.filter(plan => plan.id !== planId));
      
      // Try to reload meal plans in background
      setTimeout(() => {
        loadMealPlans().catch(error => {
          console.log('Background reload failed after delete:', error);
        });
      }, 500);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan', {
        description: 'Please try again.'
      });
    } finally {
      setIsDeletingMealPlan(null);
    }
  };

  const createNewMealPlan = () => {
    setWeeklyMeals({});
    setDailyNutrition({});
  };

  // Recipe Modal Functions
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user || !db) {
      toast.error('Please sign in to save recipes');
      return;
    }
    
    try {
      // Check if recipe is already saved
      const existingQuery = query(
        collection(db!, 'savedRecipes'),
        where('userId', '==', user.uid),
        where('title', '==', recipe.title)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        toast.info('Recipe already saved!', {
          description: 'This recipe is already in your saved collection.'
        });
        return;
      }
      
      // Process image URL if it's base64
      let processedImageUrl = recipe.imageUrl;
      if (recipe.imageUrl && recipe.imageUrl.startsWith('data:')) {
        processedImageUrl = await processRecipeImageUrl(
          recipe.imageUrl,
          user.uid,
          recipe.title
        );
      }
      
      // Save recipe to Firestore
      const savedRecipeData = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        cookingTime: recipe.cookingTime || '',
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty || 'Medium',
        tags: recipe.tags || [],
        calories: recipe.calories || null,
        imageUrl: processedImageUrl,
        userId: user.uid,
        savedAt: serverTimestamp(),
        createdAt: new Date(),
        updatedAt: serverTimestamp(),
        source: 'meal_planning'
      };
      
      await addDoc(collection(db!, 'savedRecipes'), savedRecipeData);
      
      toast.success('Recipe Saved!', {
        description: `${recipe.title} has been saved to your collection.`
      });
      
      // Close modal
      handleCloseRecipeModal();
      
      // Refresh available recipes
      loadAvailableRecipes();
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe', {
        description: 'Please check your connection and try again.'
      });
    }
  };

  // Loading state - only show after client-side mounting to prevent hydration mismatch
  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"
          />
          <p className="text-muted-foreground font-medium">Loading meal planning...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Link href="/meal-planning" className="flex items-center space-x-3">
                <Image
                  src="/cookitnext_logo.png"
                  alt="CookGPT Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-bold text-foreground">Meal Planning</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/explore-recipes" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
              <Link href="/preferences" className="text-muted-foreground hover:text-foreground transition-colors">Preferences</Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent/50 rounded-lg p-2">
                  <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/preferences">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Meal Planning
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">
                Plan your weekly meals and track nutrition
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={createNewMealPlan}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Meal Planner */}
        <div className="space-y-6">
            {/* Planner Header */}
            <div className="space-y-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() - 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="text-center flex-1 mx-4">
                  <h3 className="text-lg font-semibold">
                    Week of {getWeekDays()[0].date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getWeekDays()[0].date.toLocaleDateString()} - {getWeekDays()[6].date.toLocaleDateString()}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() + 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  onClick={generateMealPlan}
                  disabled={isGeneratingPlan}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground flex-1 sm:flex-none"
                >
                  {isGeneratingPlan ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shuffle className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingPlan ? 'Generating...' : 'Auto Generate'}
                </Button>
                
                {Object.keys(weeklyMeals).length > 0 && (
                  <Button 
                    onClick={saveMealPlan} 
                    variant="outline"
                    disabled={isSavingMealPlan}
                    className="flex-1 sm:flex-none"
                  >
                    {isSavingMealPlan ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSavingMealPlan ? 'Saving...' : 'Save Plan'}
                  </Button>
                )}
              </div>
            </div>

            {/* Weekly Calendar View */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Desktop: Horizontal 7-column layout */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-7 border-b">
                    {getWeekDays().map((day) => (
                      <div key={day.name} className="p-4 text-center border-r last:border-r-0 bg-muted/30">
                        <div className="font-semibold text-sm">{day.shortName}</div>
                        <div className="text-xs text-muted-foreground">{day.dayNumber}</div>
                        {/* Daily Nutrition Summary */}
                        {dailyNutrition[day.name] && (
                          <div className="mt-2 text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(dailyNutrition[day.name].calories)} cal
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Meal Slots Grid */}
                  <div className="grid grid-cols-7">
                    {getWeekDays().map((day) => (
                      <div key={day.name} className="border-r last:border-r-0 min-h-[320px]">
                        <div className="space-y-2 p-2">
                          {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                            const meal = weeklyMeals[day.name]?.[mealType as keyof DayMeals];
                            const IconComponent = getMealTypeIcon(mealType);
                            
                            return (
                              <div key={mealType} className="relative group">
                                {meal ? (
                                  <Card 
                                    className="p-3 hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => handleViewRecipe(meal.recipe)}
                                  >
                                    <div className="flex items-start gap-2">
                                      <IconComponent className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium line-clamp-2">
                                          {meal.recipe.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {meal.calories} cal • {meal.recipe.cookingTime}
                                        </div>
                                        {meal.recipe.imageUrl && (
                                          <div className="mt-1">
                                            <img 
                                              src={meal.recipe.imageUrl} 
                                              alt={meal.recipe.title}
                                              className="w-full h-16 object-cover rounded"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeMealFromSlot(day.name, mealType);
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </Card>
                                ) : (
                                  <Card 
                                    className="p-3 border-dashed border-2 hover:border-primary/40 hover:bg-accent/20 cursor-pointer transition-colors h-24 flex items-center justify-center"
                                    onClick={() => setSelectedMealSlot({ day: day.name, mealType })}
                                  >
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                      <IconComponent className="w-4 h-4" />
                                      <span className="text-xs capitalize">{mealType}</span>
                                    </div>
                                  </Card>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: Vertical day-by-day layout */}
                <div className="lg:hidden">
                  {getWeekDays().map((day) => (
                    <div key={day.name} className="border-b last:border-b-0">
                      {/* Day Header */}
                      <div className="p-4 bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-base capitalize">{day.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {day.date.toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          {/* Daily Nutrition Summary */}
                          {dailyNutrition[day.name] && (
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                              {Math.round(dailyNutrition[day.name].calories)} cal
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Meal Slots for this day */}
                      <div className="p-4 space-y-3">
                        {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                          const meal = weeklyMeals[day.name]?.[mealType as keyof DayMeals];
                          const IconComponent = getMealTypeIcon(mealType);
                          
                          return (
                            <div key={mealType} className="relative">
                              {meal ? (
                                // Filled meal slot - Mobile optimized
                                <Card 
                                  className="p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                                  onClick={() => handleViewRecipe(meal.recipe)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <IconComponent className="w-5 h-5 text-primary" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                            {meal.recipe.title}
                                          </h4>
                                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {meal.recipe.description}
                                          </p>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                              <Flame className="w-3 h-3" />
                                              {meal.calories} cal
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {meal.recipe.cookingTime}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {meal.recipe.difficulty}
                                            </Badge>
                                          </div>
                                        </div>
                                        {meal.recipe.imageUrl && (
                                          <div className="flex-shrink-0 ml-2">
                                            <img 
                                              src={meal.recipe.imageUrl} 
                                              alt={meal.recipe.title}
                                              className="w-16 h-16 object-cover rounded-lg"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Mobile action buttons */}
                                      <div className="flex items-center gap-2 mt-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 text-xs h-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewRecipe(meal.recipe);
                                          }}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          View Recipe
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeMealFromSlot(day.name, mealType);
                                          }}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ) : (
                                // Empty meal slot - Mobile optimized
                                <Card 
                                  className="p-4 border-dashed border-2 hover:border-primary/40 hover:bg-accent/20 cursor-pointer transition-colors active:scale-[0.98]"
                                  onClick={() => setSelectedMealSlot({ day: day.name, mealType })}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
                                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm capitalize text-muted-foreground">
                                        Add {mealType}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        Tap to add a recipe for this meal
                                      </p>
                                    </div>
                                    <div className="text-muted-foreground">
                                      <Plus className="w-5 h-5" />
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compact Nutrition Summary */}
            {Object.keys(dailyNutrition).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Weekly Nutrition Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Desktop: 7-column grid */}
                  <div className="hidden lg:grid grid-cols-7 gap-2">
                    {Object.entries(dailyNutrition).map(([day, nutrition]) => (
                      <div key={day} className="text-center p-2 bg-gradient-to-b from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                        <div className="font-medium text-xs capitalize mb-1 text-primary">
                          {day.slice(0, 3)}
                        </div>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-orange-500" />
                            <span className="font-semibold">{Math.round(nutrition.calories)}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-xs">{Math.round(nutrition.protein)}g</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs">{Math.round(nutrition.carbs)}g</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            <span className="text-xs">{Math.round(nutrition.fat)}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile: Scrollable horizontal list */}
                  <div className="lg:hidden">
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 pb-2">
                        {Object.entries(dailyNutrition).map(([day, nutrition]) => (
                          <div key={day} className="flex-shrink-0 text-center p-3 bg-gradient-to-b from-accent/10 to-accent/5 rounded-lg border border-accent/20 min-w-[100px]">
                            <div className="font-medium text-sm capitalize mb-2 text-primary">
                              {day}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                <span className="font-semibold">{Math.round(nutrition.calories)}</span>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs">{Math.round(nutrition.protein)}g</span>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs">{Math.round(nutrition.carbs)}g</span>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-xs">{Math.round(nutrition.fat)}g</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Weekly Totals */}
                  <div className="mt-4 pt-3 border-t border-border/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <span className="font-medium text-muted-foreground">Weekly Totals:</span>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="font-semibold">
                            {Math.round(Object.values(dailyNutrition).reduce((sum, day) => sum + day.calories, 0))} cal
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium">
                            {Math.round(Object.values(dailyNutrition).reduce((sum, day) => sum + day.protein, 0))}g protein
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium">
                            {Math.round(Object.values(dailyNutrition).reduce((sum, day) => sum + day.carbs, 0))}g carbs
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">
                            {Math.round(Object.values(dailyNutrition).reduce((sum, day) => sum + day.fat, 0))}g fat
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

                        {/* Saved Meal Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Saved Meal Plans ({mealPlans.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isLoadingMealPlans ? 'Loading...' : `${mealPlans.length} plans`}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMealPlans}
                      disabled={isLoadingMealPlans || isSavingMealPlan}
                      className="text-xs"
                    >
                      {isLoadingMealPlans || isSavingMealPlan ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      {isLoadingMealPlans || isSavingMealPlan ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                </div>

              </CardHeader>
                <CardContent>
                  {isLoadingMealPlans ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p className="text-sm font-medium mb-1">Loading meal plans...</p>
                      <p className="text-xs">Please wait while we fetch your saved plans</p>
                    </div>
                  ) : mealPlans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium mb-1">No saved meal plans yet</p>
                      <p className="text-xs">Create and save a meal plan to see it here</p>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadMealPlans}
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Try Loading Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mealPlans.map((plan) => (
                        <div key={plan.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-accent/10 rounded-lg border">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{plan.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Total: {Math.round(plan.totalCalories)} cal</span>
                              <span className="hidden sm:inline">Protein: {Math.round(plan.totalProtein)}g</span>
                              <span className="hidden sm:inline">Carbs: {Math.round(plan.totalCarbs)}g</span>
                              <span className="hidden sm:inline">Fat: {Math.round(plan.totalFat)}g</span>
                            </div>
                            {/* Mobile nutrition details */}
                            <div className="sm:hidden mt-2 space-y-1">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Protein: {Math.round(plan.totalProtein)}g</span>
                                <span>Carbs: {Math.round(plan.totalCarbs)}g</span>
                                <span>Fat: {Math.round(plan.totalFat)}g</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {plan.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadSavedMealPlan(plan)}
                              disabled={isLoadingMealPlan === plan.id || isDeletingMealPlan === plan.id}
                              className="flex-1 sm:flex-none"
                            >
                              {isLoadingMealPlan === plan.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : null}
                              {isLoadingMealPlan === plan.id ? 'Loading...' : 'Load'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                              onClick={() => deleteMealPlan(plan.id)}
                              disabled={isLoadingMealPlan === plan.id || isDeletingMealPlan === plan.id}
                            >
                              {isDeletingMealPlan === plan.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              <span className="hidden sm:inline ml-1">
                                {isDeletingMealPlan === plan.id ? 'Deleting...' : 'Delete'}
                              </span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
        </div>

        {/* Recipe Selection Dialog */}
        <Dialog open={selectedMealSlot !== null} onOpenChange={() => setSelectedMealSlot(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Add Recipe for {selectedMealSlot?.mealType} - {selectedMealSlot?.day}
              </DialogTitle>
              <DialogDescription>
                Choose a recipe from your saved recipes or search for new ones
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Available Recipes */}
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                  {availableRecipes
                    .filter(recipe => 
                      searchQuery === '' || 
                      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((recipe) => (
                      <Card 
                        key={recipe.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-3">
                          <div 
                            className="cursor-pointer"
                            onClick={() => selectedMealSlot && addRecipeToSlot(
                              selectedMealSlot.day, 
                              selectedMealSlot.mealType, 
                              recipe
                            )}
                          >
                            {recipe.imageUrl && (
                              <img 
                                src={recipe.imageUrl} 
                                alt={recipe.title}
                                className="w-full h-32 object-cover rounded mb-2"
                              />
                            )}
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{recipe.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {recipe.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {recipe.cookingTime}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {recipe.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-xs"
                            onClick={() => handleViewRecipe(recipe)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                
                {availableRecipes.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No saved recipes found</p>
                    <p className="text-sm text-muted-foreground">Save some recipes first to add them to your meal plan</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recipe Detail Modal */}
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={isRecipeModalOpen}
          onClose={handleCloseRecipeModal}
          onSave={handleSaveRecipe}
        />
      </div>
    </div>
  );
}
