"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  ChefHat,
  Clock,
  Users,
  Flame,
  Star,
  Utensils,
  X,
  SlidersHorizontal,
  Target,
  User,
  LogOut,
  Menu,
  Calendar,
  ChevronDown
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RecipeCard from "@/components/ui/recipe-card";
import RecipePanel from "@/components/ui/recipe-panel";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";

// Recipe interface matching the one from gemini-service
interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  tags: string[];
  calories?: number;
  imageUrl?: string;
}

// Filter options
interface FilterOptions {
  difficulty: string[];
  cookingTime: string[];
  cuisine: string[];
  dietary: string[];
  mealType: string[];
  goals: string[];
  calories: string[];
}

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const COOKING_TIME_OPTIONS = ['15 minutes', '30 minutes', '1 hour', '1+ hours'];
const CUISINE_OPTIONS = ['Italian', 'Asian', 'Mexican', 'Indian', 'Mediterranean', 'American', 'French', 'Chinese', 'Thai', 'Greek'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Paleo'];
const MEAL_TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const GOAL_OPTIONS = ['Weight Loss', 'Muscle Gain', 'Healthy Eating', 'Quick Meals', 'Family Cooking', 'Meal Prep'];
const CALORIES_OPTIONS = ['Under 300', '300-500', '500-700', '700-900', '900+'];
// Removed IMAGE_FILTER_OPTIONS since we now automatically filter broken images

export default function ExploreRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: [],
    cookingTime: [],
    cuisine: [],
    dietary: [],
    mealType: [],
    goals: [],
    calories: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipePanelOpen, setIsRecipePanelOpen] = useState(false);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isMobile = useIsMobile();
  const { user, userPreferences, signOut } = useAuth();

  // Inline search states for long lists
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [dietarySearch, setDietarySearch] = useState("");
  const [mealTypeSearch, setMealTypeSearch] = useState("");
  const [goalsSearch, setGoalsSearch] = useState("");

  // Quick presets
  const quickPresets = [
    {
      label: "Vegan • ≤30m", apply: () => {
        setFilters(prev => ({
          ...prev,
          dietary: Array.from(new Set([...(prev.dietary || []), "Vegan"])),
          cookingTime: Array.from(new Set([...(prev.cookingTime || []), "30 minutes"]))
        }));
      }
    },
    {
      label: "< 500 kcal", apply: () => {
        setFilters(prev => ({
          ...prev,
          calories: Array.from(new Set([...(prev.calories || []), "Under 300", "300-500"]))
        }));
      }
    },

    {
      label: "Breakfast Quick", apply: () => {
        setFilters(prev => ({
          ...prev,
          mealType: Array.from(new Set([...(prev.mealType || []), "Breakfast"])),
          cookingTime: Array.from(new Set([...(prev.cookingTime || []), "15 minutes"]))
        }));
      }
    },
  ];

  const RECIPES_PER_PAGE = 18;

  // Recipe Modal Component for Mobile/Tablet
  interface RecipeModalProps {
    recipe: Recipe;
    onClose: () => void;
    user: any;
  }

  function RecipeModal({ recipe, onClose, user }: RecipeModalProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.warn(`Image failed to load for recipe: ${recipe.title}`);
      setImageError(true);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-4xl w-full h-[98vh] sm:h-[95vh] bg-background rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm hover:bg-background rounded-lg border border-border/50 shadow-sm"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Recipe Content */}
          <div className="relative flex-1 flex flex-col">
            {/* Header with Image */}
            <div className="relative h-48 sm:h-64 bg-gradient-to-br from-accent/20 via-accent/10 to-accent/20 flex-shrink-0">
              {recipe.imageUrl && !imageError ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-accent/20 via-accent/10 to-accent/20">
                  <div className="text-center">
                    <Utensils className="w-16 h-16 text-accent/50 mx-auto mb-2" />
                    <p className="text-sm text-accent/70 font-medium">
                      {imageError ? 'Image Error' : 'No Image'}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{recipe.title}</h1>
                <p className="text-base sm:text-lg opacity-90 line-clamp-2">{recipe.description}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-12">
              {/* Recipe Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-accent/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{recipe.cookingTime}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{recipe.servings}</p>
                    <p className="text-xs text-muted-foreground">Servings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{recipe.difficulty}</p>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                  </div>
                </div>
                {recipe.calories && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{recipe.calories}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-sm px-3 py-1 bg-background/50 border-border/50 text-foreground/70"
                  >
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
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm leading-relaxed">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
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

              {/* Extra spacing to ensure content is not cut off */}
              <div className="h-8"></div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 pb-4">
                {user ? (
                  <>
                    <Button className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
                      Save Recipe
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-accent/50 hover:border-border/60 transition-all duration-200"
                      onClick={() => window.location.href = '/meal-planning'}
                    >
                      Add to Meal Plan
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
                        Sign In to Save Recipe
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-accent/50 hover:border-border/60 transition-all duration-200"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: recipe.title,
                            text: recipe.description,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(`Check out this recipe: ${recipe.title}`);
                        }
                      }}
                    >
                      Share Recipe
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Simple image URL validation (synchronous)
  const isValidImageUrl = (imageUrl: string): boolean => {
    if (!imageUrl || imageUrl.trim() === '') return false;

    // Basic URL validation
    try {
      const url = new URL(imageUrl);
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(url.protocol)) return false;

      // Check if it has a valid image extension or is from common image hosts
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const validHosts = ['images.unsplash.com', 'cdn.pixabay.com', 'images.pexels.com', 'firebasestorage.googleapis.com'];

      const hasValidExtension = validExtensions.some(ext =>
        url.pathname.toLowerCase().includes(ext)
      );
      const isValidHost = validHosts.some(host =>
        url.hostname.includes(host)
      );

      return hasValidExtension || isValidHost;
    } catch {
      return false;
    }
  };

  // Validation functions
  const validateRecipe = (recipe: any): boolean => {
    // Check for blank/incomplete recipes with stricter criteria
    if (!recipe.title || recipe.title.trim() === '') return false;
    if (!recipe.description || recipe.description.trim() === '') return false;
    if (!recipe.cookingTime || recipe.cookingTime.trim() === '') return false;

    // Check minimum length requirements
    if (recipe.title.trim().length < 3) return false;
    if (recipe.description.trim().length < 10) return false;

    // Check for placeholder/dummy content
    const title = recipe.title.trim().toLowerCase();
    const description = recipe.description.trim().toLowerCase();

    // Common placeholder patterns
    const placeholderPatterns = [
      /^¥\d+$/,           // ¥4, ¥123, etc.
      /^test/,            // test, testing, etc.
      /^sample/,          // sample recipe
      /^placeholder/,     // placeholder text
      /^lorem ipsum/,     // lorem ipsum text
      /^untitled/,        // untitled recipe
      /^recipe \d+$/,     // recipe 1, recipe 2, etc.
      /^new recipe$/,     // new recipe
      /^\d+$/,            // just numbers
      /^[a-z]$/,          // single letters
    ];

    // Check if title matches any placeholder pattern
    if (placeholderPatterns.some(pattern => pattern.test(title))) {
      return false;
    }

    // Check if description matches any placeholder pattern
    if (placeholderPatterns.some(pattern => pattern.test(description))) {
      return false;
    }

    // Validate arrays with meaningful content
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false;
    if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) return false;

    // Check that ingredients and instructions have meaningful content
    const validIngredients = recipe.ingredients.filter((ing: string) =>
      ing && ing.trim().length > 2 && !placeholderPatterns.some(pattern => pattern.test(ing.trim().toLowerCase()))
    );

    const validInstructions = recipe.instructions.filter((inst: string) =>
      inst && inst.trim().length > 5 && !placeholderPatterns.some(pattern => pattern.test(inst.trim().toLowerCase()))
    );

    if (validIngredients.length === 0) {
      return false;
    }

    if (validInstructions.length === 0) {
      return false;
    }

    // Check for valid servings
    if (!recipe.servings || recipe.servings < 1) return false;

    return true;
  };

  const removeDuplicateRecipes = (recipes: Recipe[]): Recipe[] => {
    const uniqueRecipes: Recipe[] = [];
    const seenTitles = new Map<string, Recipe>();

    for (const recipe of recipes) {
      // Normalize title for comparison
      const normalizedTitle = recipe.title.toLowerCase().trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' '); // Normalize whitespace

      // Check for exact title match first
      if (seenTitles.has(normalizedTitle)) {
        const existingRecipe = seenTitles.get(normalizedTitle)!;
        if (process.env.NODE_ENV === 'development') {
          console.log(`Exact duplicate recipe removed: "${recipe.title}"`);
        }
        continue;
      }

      // Check for similar titles (fuzzy matching)
      let isDuplicate = false;
      for (const [existingTitle, existingRecipe] of seenTitles.entries()) {
        // Calculate similarity (simple approach)
        const similarity = calculateSimilarity(normalizedTitle, existingTitle);
        if (similarity > 0.8) { // 80% similarity threshold
          if (process.env.NODE_ENV === 'development') {
            console.log(`Similar recipe removed: "${recipe.title}" (similarity: ${similarity.toFixed(2)})`);
          }
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        seenTitles.set(normalizedTitle, recipe);
        uniqueRecipes.push(recipe);
      }
    }

    return uniqueRecipes;
  };

  // Simple similarity calculation function
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const allWords = new Set([...words1, ...words2]);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / allWords.size;
  };

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch recipes from Firebase
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration

    const fetchRecipes = async () => {
      if (!db) {
        console.log('Database not initialized, retrying...');
        setTimeout(fetchRecipes, 1000);
        return;
      }

      try {
        setLoading(true);
        // Fetch recipes from Firebase
        const recipesQuery = query(
          collection(db, 'recipes'),
          limit(100)
        );

        const querySnapshot = await getDocs(recipesQuery);

        const fetchedRecipes: Recipe[] = [];
        let invalidRecipeCount = 0;
        let invalidImageCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Basic logging for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log(`Processing recipe ${doc.id}: "${data.title}"`);
          }

          // Validate recipe content first
          if (!validateRecipe(data)) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`❌ Invalid recipe skipped: ${doc.id} - "${data.title || 'No title'}"`);
            }
            invalidRecipeCount++;
            return;
          }

          // If recipe has an image URL, validate it
          if (data.imageUrl && data.imageUrl.trim() !== '') {
            if (!isValidImageUrl(data.imageUrl)) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`❌ Invalid image URL for recipe ${doc.id} - "${data.title}"`);
              }
              invalidImageCount++;
              return; // Skip recipes with invalid image URLs
            }
          }

          fetchedRecipes.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            cookingTime: data.cookingTime || '',
            servings: data.servings || 1,
            difficulty: data.difficulty || 'Medium',
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            tags: data.tags || [],
            calories: data.calories || undefined,
            imageUrl: data.imageUrl || undefined,
          });
        });

        // Remove duplicate recipes
        const uniqueRecipes = removeDuplicateRecipes(fetchedRecipes);
        const duplicateCount = fetchedRecipes.length - uniqueRecipes.length;

        // Final validation pass - double check all recipes
        const finalValidRecipes = uniqueRecipes.filter(recipe => {
          const isValid = validateRecipe(recipe);
          if (!isValid) {
            console.warn(`❌ Final validation failed for: "${recipe.title}"`);
          }
          return isValid;
        });

        // Sort recipes by title for consistent display
        finalValidRecipes.sort((a, b) => a.title.localeCompare(b.title));

        const finalInvalidCount = uniqueRecipes.length - finalValidRecipes.length;

        // Validation complete - statistics logged to console

        // Log summary only in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Recipe Processing Summary:`);
          console.log(`  Total documents: ${querySnapshot.size}`);
          console.log(`  Invalid content: ${invalidRecipeCount}`);
          console.log(`  Invalid images: ${invalidImageCount}`);
          console.log(`  Duplicates removed: ${duplicateCount}`);
          console.log(`  Final validation failures: ${finalInvalidCount}`);
          console.log(`  ✅ Valid recipes: ${finalValidRecipes.length}`);
        }

        setRecipes(finalValidRecipes);
        setFilteredRecipes(finalValidRecipes);
      } catch (error: any) {
        console.error('Error fetching recipes:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error);

        // Set empty array to avoid undefined state
        setRecipes([]);
        setFilteredRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [isClient]);

  // Update displayed recipes when filtered recipes change
  useEffect(() => {
    setDisplayedRecipes(filteredRecipes.slice(0, RECIPES_PER_PAGE));
    setCurrentPage(1);
    setHasMore(filteredRecipes.length > RECIPES_PER_PAGE);
  }, [filteredRecipes]);

  // Load more recipes function
  const loadMoreRecipes = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;

    const newRecipes = filteredRecipes.slice(startIndex, endIndex);
    setDisplayedRecipes(prev => [...prev, ...newRecipes]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < filteredRecipes.length);
    setLoadingMore(false);
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when user is near bottom (within 200px)
    if (scrollTop + windowHeight >= documentHeight - 200) {
      loadMoreRecipes();
    }
  }, [loadingMore, hasMore]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Apply search and filters
  useEffect(() => {
    let filtered = recipes;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(query)
        ) ||
        recipe.tags.some(tag =>
          tag.toLowerCase().includes(query)
        )
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(recipe =>
        filters.difficulty.includes(recipe.difficulty)
      );
    }

    // Apply cooking time filter
    if (filters.cookingTime.length > 0) {
      filtered = filtered.filter(recipe => {
        const time = recipe.cookingTime.toLowerCase();
        return filters.cookingTime.some(filterTime =>
          time.includes(filterTime.toLowerCase())
        );
      });
    }

    // Apply cuisine filter (based on tags)
    if (filters.cuisine.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag =>
          filters.cuisine.some(cuisine =>
            tag.toLowerCase().includes(cuisine.toLowerCase())
          )
        )
      );
    }

    // Apply dietary filter (based on tags)
    if (filters.dietary.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag =>
          filters.dietary.some(dietary =>
            tag.toLowerCase().includes(dietary.toLowerCase())
          )
        )
      );
    }

    // Apply meal type filter (based on tags)
    if (filters.mealType.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag =>
          filters.mealType.some(mealType =>
            tag.toLowerCase().includes(mealType.toLowerCase())
          )
        )
      );
    }

    // Apply goals filter (based on tags)
    if (filters.goals.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag =>
          filters.goals.some(goal =>
            tag.toLowerCase().includes(goal.toLowerCase())
          )
        )
      );
    }

    // Apply calories filter
    if (filters.calories.length > 0) {
      filtered = filtered.filter(recipe => {
        if (!recipe.calories) return false;
        return filters.calories.some(calorieRange => {
          const calories = recipe.calories!; // Non-null assertion since we checked above
          switch (calorieRange) {
            case 'Under 300': return calories < 300;
            case '300-500': return calories >= 300 && calories <= 500;
            case '500-700': return calories >= 500 && calories <= 700;
            case '700-900': return calories >= 700 && calories <= 900;
            case '900+': return calories >= 900;
            default: return false;
          }
        });
      });
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, filters]);

  const handleFilterToggle = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: [],
      cookingTime: [],
      cuisine: [],
      dietary: [],
      mealType: [],
      goals: [],
      calories: []
    });
    setSearchQuery('');
  };

  // Clear a single filter group for better UX
  const clearFilterGroup = (filterType: keyof FilterOptions) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: []
    }));
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);

    // Use panel for desktop (large screens), modal for mobile/tablet (small screens)
    if (isMobile || typeof isMobile === 'undefined') {
      setIsRecipePanelOpen(false);
    } else {
      setIsRecipePanelOpen(true);
    }
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  const handleCloseRecipePanel = () => {
    setIsRecipePanelOpen(false);
    setSelectedRecipe(null);
  };

  const activeFiltersCount = Object.values(filters).flat().length + (searchQuery ? 1 : 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleMealPlanner = () => {
    window.location.href = '/meal-planning';
  };

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/cookitnext_logo.png"
                alt="CookGPT Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-foreground">CookGPT</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>

            {/* User Authentication Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                // Logged in user - show user menu and quick actions
                <>
                  <div className="hidden md:flex items-center space-x-3">
                    <Button
                      onClick={handleDashboard}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                    <Button
                      onClick={handleMealPlanner}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Meal Planner</span>
                    </Button>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Menu className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-foreground">
                            {user.displayName || 'Welcome back!'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDashboard}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleMealPlanner}>
                          <ChefHat className="w-4 h-4 mr-2" />
                          Meal Planner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = '/preferences'}>
                          <User className="w-4 h-4 mr-2" />
                          Preferences
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Desktop User Menu */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">
                            {user.displayName || user.email?.split('@')[0] || 'User'}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-foreground">
                            {user.displayName || 'Welcome back!'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDashboard}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleMealPlanner}>
                          <ChefHat className="w-4 h-4 mr-2" />
                          Meal Planner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = '/preferences'}>
                          <User className="w-4 h-4 mr-2" />
                          Preferences
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                // Not logged in - show sign in button
                <Link href="/login">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>



      {/* Main Content with Sidebar Layout */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Filters Always Visible */}
        <div className={`${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:relative inset-y-0 left-0 z-40 
          w-72 sm:w-64 md:w-72 lg:w-64 xl:w-72
          bg-background/95 backdrop-blur-sm border-r border-border/40 
          flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none 
          shadow-lg lg:shadow-sm flex flex-col overflow-hidden`}>

          {/* Mobile/Tablet Header */}
          <div className="lg:hidden flex justify-between items-center p-3 border-b border-border/30 flex-shrink-0 bg-background/90">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/20 text-primary">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="hover:bg-accent/50 rounded-lg h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content Area */}
          <div className="relative flex-1 overflow-hidden">
            <ScrollArea
              className="h-full w-full"
              type="always"
              scrollHideDelay={600}
            >
              <div className="p-4 space-y-5">
                {/* Search Bar */}
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search recipes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 text-sm border border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 rounded-lg bg-background/50 backdrop-blur-sm transition-all duration-200 w-full"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2">
                    {quickPresets.map((p) => (
                      <Button key={p.label} size="sm" variant="secondary" className="h-7 rounded-full text-xs" onClick={p.apply}>
                        {p.label}
                      </Button>
                    ))}
                  </div>

                  {/* Clear All Filters Button */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      size="sm"
                      className="w-full text-xs py-2 border-border/40 hover:border-border/60 hover:bg-accent/30 transition-all duration-200"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>

                {/* Filter Groups */}
                <div className="space-y-5">
                  {/* Difficulty Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</h3>
                          <span className="text-sm font-medium text-foreground">Level</span>
                        </div>
                        {filters.difficulty.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('difficulty')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="space-y-1.5 mt-3">
                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                          <label key={difficulty} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                            <input
                              type="checkbox"
                              checked={filters.difficulty.includes(difficulty)}
                              onChange={() => handleFilterToggle('difficulty', difficulty)}
                              className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                            />
                            <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{difficulty}</span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Cooking Time Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cooking Time</h3>
                          <span className="text-sm font-medium text-foreground">Duration</span>
                        </div>
                        {filters.cookingTime.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('cookingTime')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="space-y-1.5 mt-3">
                        {COOKING_TIME_OPTIONS.map((time) => (
                          <label key={time} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                            <input
                              type="checkbox"
                              checked={filters.cookingTime.includes(time)}
                              onChange={() => handleFilterToggle('cookingTime', time)}
                              className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                            />
                            <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{time}</span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Cuisine Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuisine</h3>
                          <span className="text-sm font-medium text-foreground">Style</span>
                        </div>
                        {filters.cuisine.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('cuisine')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search cuisines..."
                            value={cuisineSearch}
                            onChange={(e) => setCuisineSearch(e.target.value)}
                            className="pl-3 pr-3 py-2 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          {CUISINE_OPTIONS.filter(c => c.toLowerCase().includes(cuisineSearch.toLowerCase())).map((cuisine) => (
                            <label key={cuisine} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={filters.cuisine.includes(cuisine)}
                                onChange={() => handleFilterToggle('cuisine', cuisine)}
                                className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                              />
                              <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{cuisine}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Dietary Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dietary</h3>
                          <span className="text-sm font-medium text-foreground">Restrictions</span>
                        </div>
                        {filters.dietary.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('dietary')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="text"
                          placeholder="Search dietary..."
                          value={dietarySearch}
                          onChange={(e) => setDietarySearch(e.target.value)}
                          className="pl-3 pr-3 py-2 text-xs"
                        />
                        <div className="space-y-1.5">
                          {DIETARY_OPTIONS.filter(d => d.toLowerCase().includes(dietarySearch.toLowerCase())).map((dietary) => (
                            <label key={dietary} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={filters.dietary.includes(dietary)}
                                onChange={() => handleFilterToggle('dietary', dietary)}
                                className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                              />
                              <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{dietary}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Meal Type Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meal Type</h3>
                          <span className="text-sm font-medium text-foreground">Category</span>
                        </div>
                        {filters.mealType.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('mealType')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="text"
                          placeholder="Search meal types..."
                          value={mealTypeSearch}
                          onChange={(e) => setMealTypeSearch(e.target.value)}
                          className="pl-3 pr-3 py-2 text-xs"
                        />
                        <div className="space-y-1.5">
                          {MEAL_TYPE_OPTIONS.filter(m => m.toLowerCase().includes(mealTypeSearch.toLowerCase())).map((mealType) => (
                            <label key={mealType} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={filters.mealType.includes(mealType)}
                                onChange={() => handleFilterToggle('mealType', mealType)}
                                className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                              />
                              <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{mealType}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Goals Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goals</h3>
                          <span className="text-sm font-medium text-foreground">Objective</span>
                        </div>
                        {filters.goals.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('goals')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="text"
                          placeholder="Search goals..."
                          value={goalsSearch}
                          onChange={(e) => setGoalsSearch(e.target.value)}
                          className="pl-3 pr-3 py-2 text-xs"
                        />
                        <div className="space-y-1.5">
                          {GOAL_OPTIONS.filter(g => g.toLowerCase().includes(goalsSearch.toLowerCase())).map((goal) => (
                            <label key={goal} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={filters.goals.includes(goal)}
                                onChange={() => handleFilterToggle('goals', goal)}
                                className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                              />
                              <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{goal}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Calories Filter */}
                  <Collapsible defaultOpen className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calories</h3>
                          <span className="text-sm font-medium text-foreground">Range</span>
                        </div>
                        {filters.calories.length > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-accent/40" onClick={() => clearFilterGroup('calories')}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <CollapsibleTrigger className="ml-2 rounded-md p-1 hover:bg-accent/40">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="space-y-1.5 mt-3">
                        {CALORIES_OPTIONS.map((calorieRange) => (
                          <label key={calorieRange} className="flex items-center gap-2 cursor-pointer group hover:bg-accent/20 rounded-md p-1.5 transition-all duration-200">
                            <input
                              type="checkbox"
                              checked={filters.calories.includes(calorieRange)}
                              onChange={() => handleFilterToggle('calories', calorieRange)}
                              className="w-3.5 h-3.5 rounded border-border/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 transition-all duration-200"
                            />
                            <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">{calorieRange}</span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>


                </div>

                {/* Active Filters Summary */}
                {activeFiltersCount > 0 && (
                  <div className="p-3 bg-accent/20 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-xs text-foreground flex items-center gap-2">
                        <Filter className="w-3 h-3 text-primary" />
                        Active Filters
                      </h4>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/20 text-primary border-primary/30">
                        {activeFiltersCount}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(filters).map(([key, values]) =>
                        values.map((value: string) => (
                          <Badge
                            key={`${key}-${value}`}
                            variant="outline"
                            className="text-xs border-border/40 text-muted-foreground bg-background/50"
                          >
                            {value}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom padding */}
                <div className="h-16 lg:h-4"></div>
              </div>
            </ScrollArea>
            {/* Mobile Sticky Footer Actions */}
            <div className="lg:hidden p-3 border-t border-border/30 bg-background/90 backdrop-blur-sm flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearAllFilters}>Clear</Button>
              <Button className="flex-1" onClick={() => setShowFilters(false)}>Close</Button>
            </div>
          </div>

        </div>

        {/* Right Content Area */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${!isMobile && isRecipePanelOpen ? 'mr-[480px] xl:mr-[520px] 2xl:mr-[580px]' : ''
          }`}>
          {/* Mobile/Tablet Filter Toggle */}
          <div className="lg:hidden p-3 sm:p-4 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="w-full flex items-center justify-center gap-2 h-11 sm:h-10 touch-manipulation font-medium border-border/60 hover:border-primary/40 hover:bg-accent/30 transition-all duration-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm sm:text-base">Show Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Recipes Section */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Results Header */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore Recipes'}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                {displayedRecipes.length < filteredRecipes.length && (
                  <span className="text-primary"> • Showing {displayedRecipes.length} of {filteredRecipes.length}</span>
                )}
              </p>

            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"
                />
                <span className="ml-3 text-muted-foreground">Loading recipes...</span>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredRecipes.length === 0 && (
              <div className="text-center py-16">
                <Utensils className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `No recipes match "${searchQuery}". Try adjusting your search or filters.`
                    : 'No recipes available at the moment.'
                  }
                </p>
                {searchQuery && (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear Search & Filters
                  </Button>
                )}
              </div>
            )}

            {/* Recipes Grid */}
            {!loading && displayedRecipes.length > 0 && (
              <div className={`grid gap-4 sm:gap-6 ${!isMobile && isRecipePanelOpen
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                <AnimatePresence>
                  {displayedRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <RecipeCard
                        recipe={recipe}
                        onViewDetails={handleViewRecipe}
                        index={index}
                        className="h-full"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More Indicator */}
            {!loading && hasMore && (
              <div className="flex justify-center py-8">
                <Button
                  onClick={loadMoreRecipes}
                  variant="outline"
                  disabled={loadingMore}
                  className="flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full"
                      />
                      Loading more recipes...
                    </>
                  ) : (
                    <>
                      Load More Recipes
                      <span className="text-xs text-muted-foreground">
                        ({displayedRecipes.length} of {filteredRecipes.length})
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* End of Results */}
            {!loading && !hasMore && displayedRecipes.length > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-px bg-border mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  You've reached the end of all {filteredRecipes.length} recipes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal - Mobile/Tablet only */}
      {(isMobile || typeof isMobile === 'undefined') && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={closeRecipeModal}
          user={user}
        />
      )}



      {/* Recipe Detail Panel - Desktop only */}
      {!isMobile && typeof isMobile !== 'undefined' && (
        <RecipePanel
          recipe={selectedRecipe}
          isOpen={isRecipePanelOpen}
          onClose={handleCloseRecipePanel}
          onSave={() => {
            if (user) {
              // TODO: Implement save recipe functionality for logged-in users
              console.log('Saving recipe:', selectedRecipe?.title);
            } else {
              // Redirect to login for non-logged-in users
              window.location.href = '/login';
            }
          }}
          onShare={(recipe) => {
            if (navigator.share) {
              navigator.share({
                title: recipe.title,
                text: recipe.description,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(`Check out this recipe: ${recipe.title}`);
            }
          }}
        />
      )}
    </div>
  );
}
