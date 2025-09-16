"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { ChefHat, Utensils, Clock, Target, ArrowRight, ArrowLeft, Sparkles, Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingData {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  mealTypeFocus: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  cookingTime: '15min' | '30min' | '1hr+';
  goals: string[];
}

const STEPS = [
  { id: 1, title: "Dietary Preferences", icon: Utensils },
  { id: 2, title: "Cuisine Preferences", icon: ChefHat },
  { id: 3, title: "Meal Focus", icon: Utensils },
  { id: 4, title: "Skill & Time", icon: Clock },
  { id: 5, title: "Goals", icon: Target },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'Plant-based diet excluding meat' },
  { id: 'vegan', label: 'Vegan', description: 'Completely plant-based diet' },
  { id: 'gluten-free', label: 'Gluten-Free', description: 'No wheat, barley, or rye' },
  { id: 'dairy-free', label: 'Dairy-Free', description: 'No milk or dairy products' },
  { id: 'keto', label: 'Keto', description: 'Low-carb, high-fat diet' },
  { id: 'low-carb', label: 'Low-Carb', description: 'Reduced carbohydrate intake' },
  { id: 'paleo', label: 'Paleo', description: 'Whole foods, no processed items' },
  { id: 'none', label: 'No Restrictions', description: 'All foods welcome' },
];

const CUISINE_OPTIONS = [
  { id: 'italian', label: 'Italian', description: 'Pasta, pizza, Mediterranean flavors' },
  { id: 'asian', label: 'Asian', description: 'Diverse Asian cooking styles' },
  { id: 'mexican', label: 'Mexican', description: 'Spicy, vibrant Latin flavors' },
  { id: 'indian', label: 'Indian', description: 'Rich spices and aromatic dishes' },
  { id: 'mediterranean', label: 'Mediterranean', description: 'Healthy, olive oil-based cuisine' },
  { id: 'american', label: 'American', description: 'Classic comfort food favorites' },
  { id: 'french', label: 'French', description: 'Sophisticated culinary techniques' },
  { id: 'chinese', label: 'Chinese', description: 'Traditional and modern Chinese dishes' },
];

const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast', description: 'Start your day right' },
  { id: 'lunch', label: 'Lunch', description: 'Midday fuel' },
  { id: 'dinner', label: 'Dinner', description: 'Evening satisfaction' },
  { id: 'snacks', label: 'Snacks', description: 'Quick bites' },
  { id: 'desserts', label: 'Desserts', description: 'Sweet treats' },
];

const SKILL_OPTIONS = [
  { id: 'beginner', label: 'Beginner', description: "I'm just starting out" },
  { id: 'intermediate', label: 'Intermediate', description: 'I know the basics' },
  { id: 'expert', label: 'Expert', description: "I'm a seasoned cook" },
];

const TIME_OPTIONS = [
  { id: '15min', label: '15 minutes or less', description: 'Quick and easy' },
  { id: '30min', label: '30 minutes or less', description: 'Moderate prep time' },
  { id: '1hr+', label: '1 hour or more', description: 'Detailed cooking' },
];

const GOAL_OPTIONS = [
  { id: 'weight-loss', label: 'Weight Loss', description: 'Healthy portion control' },
  { id: 'muscle-gain', label: 'Muscle Gain', description: 'Protein-rich meals' },
  { id: 'healthy-eating', label: 'Healthy Eating', description: 'Nutritious choices' },
  { id: 'quick-meals', label: 'Quick Meals', description: 'Fast preparation' },
  { id: 'family-cooking', label: 'Family Cooking', description: 'Meals for everyone' },
  { id: 'meal-prep', label: 'Meal Prep', description: 'Batch cooking' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userPreferences, updateUserPreferences, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    mealTypeFocus: [],
    skillLevel: 'beginner',
    cookingTime: '30min',
    goals: [],
  });

  // Redirect if user is not authenticated or already completed onboarding
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (hasRedirected.current) return;
    if (!authLoading) {
      if (!user) {
        hasRedirected.current = true;
        router.replace("/");
        return;
      }
      if (userPreferences?.onboardingCompleted) {
        hasRedirected.current = true;
        router.replace("/dashboard");
        return;
      }
    }
  }, [user, userPreferences, authLoading, router]);

  const handleArrayToggle = (field: keyof Pick<OnboardingData, 'dietaryRestrictions' | 'cuisinePreferences' | 'mealTypeFocus' | 'goals'>, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateUserPreferences({
        ...data,
        onboardingCompleted: true,
      });
      
      toast.success("Welcome to CookGPT!", {
        description: "Your preferences have been saved. Let's start cooking!",
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Failed to save preferences", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.dietaryRestrictions.length > 0;
      case 2:
        return data.cuisinePreferences.length > 0;
      case 3:
        return data.mealTypeFocus.length > 0;
      case 4:
        return true; // Skill level and time are required and have defaults
      case 5:
        return true; // Goals are optional
      default:
        return false;
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
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
            className="rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"
          />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const progress = (currentStep / STEPS.length) * 100;

  // Filter options based on search query
  const getFilteredOptions = (options: typeof DIETARY_OPTIONS | typeof CUISINE_OPTIONS | typeof MEAL_OPTIONS | typeof GOAL_OPTIONS) => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(query) ||
      option.description.toLowerCase().includes(query)
    );
  };

  const clearSearchAndFilters = () => {
    setSearchQuery('');
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 min-h-screen p-3 sm:p-4 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto pt-2 sm:pt-4 lg:pt-8"
        >
          {/* Professional Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-6 sm:mb-8 lg:mb-12"
          >
            
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 sm:space-y-3 lg:space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                Personalize Your Experience
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
                Let's customize your cooking journey with a few quick questions to provide you with the most relevant recipes and recommendations
              </p>
              
              {/* Search and Filter Bar */}
              <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search preferences..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border-2 border-border/50 focus:border-primary/50 rounded-lg bg-background/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Filter Toggle */}
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                  
                  {/* Clear Button */}
                  {(searchQuery || showFilters) && (
                    <Button
                      variant="ghost"
                      onClick={clearSearchAndFilters}
                      size="sm"
                      className="text-muted-foreground hover:text-foreground px-3 py-2"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 sm:mb-8 border border-border/50 rounded-xl bg-muted/30 p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Dietary Filter */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      Dietary
                    </h3>
                    <div className="space-y-2">
                      {DIETARY_OPTIONS.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.dietaryRestrictions.includes(option.id)}
                            onChange={() => handleArrayToggle('dietaryRestrictions', option.id)}
                            className="rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine Filter */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Cuisine
                    </h3>
                    <div className="space-y-2">
                      {CUISINE_OPTIONS.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.cuisinePreferences.includes(option.id)}
                            onChange={() => handleArrayToggle('cuisinePreferences', option.id)}
                            className="rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Meal Type Filter */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Meal Type
                    </h3>
                    <div className="space-y-2">
                      {MEAL_OPTIONS.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.mealTypeFocus.includes(option.id)}
                            onChange={() => handleArrayToggle('mealTypeFocus', option.id)}
                            className="rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Goals Filter */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goals
                    </h3>
                    <div className="space-y-2">
                      {GOAL_OPTIONS.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.goals.includes(option.id)}
                            onChange={() => handleArrayToggle('goals', option.id)}
                            className="rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Professional Progress Indicator */}
          <motion.div 
            className="mb-6 sm:mb-8 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 px-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    Step {currentStep} of {STEPS.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STEPS[currentStep - 1].title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-accent/20 rounded-full" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
            </div>
            <div className="relative bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden mx-1">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {/* Step indicators for larger screens */}
            <div className="hidden lg:flex justify-between mt-3 sm:mt-4 px-1">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    index + 1 <= currentStep 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1 <= currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-xs mt-1 sm:mt-2 text-center max-w-16 text-muted-foreground leading-tight">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="border-0 bg-card/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ring-1 ring-border/20 overflow-hidden mx-1 sm:mx-0">
              <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 sm:space-y-3"
                >
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-card-foreground leading-tight">
                    {STEPS[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed px-1 sm:px-2">
                    {currentStep === 1 && "What dietary restrictions or preferences do you have?"}
                    {currentStep === 2 && "Which cuisines do you enjoy most?"}
                    {currentStep === 3 && "What types of meals are you most interested in?"}
                    {currentStep === 4 && "What's your cooking skill level and preferred cooking time?"}
                    {currentStep === 5 && "What are your cooking goals? (Optional)"}
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 xl:px-12 pb-6 sm:pb-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Dietary Preferences */}
                  {currentStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {getFilteredOptions(DIETARY_OPTIONS).map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleArrayToggle('dietaryRestrictions', option.id)}
                          className={cn(
                            "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group min-h-[100px] flex flex-col justify-center",
                            "hover:shadow-lg active:shadow-md",
                            data.dietaryRestrictions.includes(option.id)
                              ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          )}
                        >
                          <div className="text-center space-y-2">
                            <div className="font-semibold text-sm sm:text-base text-card-foreground group-hover:text-primary transition-colors">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {option.description}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* No results message */}
                      {getFilteredOptions(DIETARY_OPTIONS).length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="col-span-full text-center py-8"
                        >
                          <Utensils className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground font-medium">No dietary preferences found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Cuisine Preferences */}
                  {currentStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {getFilteredOptions(CUISINE_OPTIONS).map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleArrayToggle('cuisinePreferences', option.id)}
                          className={cn(
                            "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group min-h-[100px] flex flex-col justify-center",
                            "hover:shadow-lg active:shadow-md",
                            data.cuisinePreferences.includes(option.id)
                              ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          )}
                        >
                          <div className="text-center space-y-2">
                            <div className="font-semibold text-sm sm:text-base text-card-foreground group-hover:text-primary transition-colors">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {option.description}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 3: Meal Focus */}
                  {currentStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                    >
                      {getFilteredOptions(MEAL_OPTIONS).map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleArrayToggle('mealTypeFocus', option.id)}
                          className={cn(
                            "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group min-h-[80px] sm:min-h-[90px] flex items-center justify-center",
                            "hover:shadow-lg active:shadow-md",
                            data.mealTypeFocus.includes(option.id)
                              ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          )}
                        >
                          <div className="text-center space-y-1">
                            <div className="font-semibold text-base sm:text-lg text-card-foreground group-hover:text-primary transition-colors">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 4: Skill & Time */}
                  {currentStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <div>
                        <motion.h3 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-bold text-lg sm:text-xl mb-4 text-card-foreground px-1"
                        >
                          Cooking Skill Level
                        </motion.h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {SKILL_OPTIONS.map((option, index) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setData(prev => ({ ...prev, skillLevel: option.id as any }))}
                              className={cn(
                                "p-4 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group",
                                "hover:shadow-lg active:shadow-md",
                                data.skillLevel === option.id
                                  ? 'border-primary bg-primary/10 shadow-lg ring-1 sm:ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
                              )}
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-base sm:text-lg text-card-foreground group-hover:text-primary transition-colors">
                                  {option.label}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{option.description}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <motion.h3 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="font-bold text-lg sm:text-xl mb-4 text-card-foreground px-1"
                        >
                          Preferred Cooking Time
                        </motion.h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {TIME_OPTIONS.map((option, index) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setData(prev => ({ ...prev, cookingTime: option.id as any }))}
                              className={cn(
                                "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group min-h-[70px] sm:min-h-[80px] flex items-center",
                                "hover:shadow-lg active:shadow-md",
                                data.cookingTime === option.id
                                  ? 'border-primary bg-primary/10 shadow-lg ring-1 sm:ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
                              )}
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-base sm:text-lg text-card-foreground group-hover:text-primary transition-colors">
                                  {option.label}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Goals */}
                  {currentStep === 5 && (
                    <motion.div 
                      key="step5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center mb-4 sm:mb-6"
                      >
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground mb-2 sm:mb-3 text-xs sm:text-sm px-3 py-1">
                          Optional Step
                        </Badge>
                        <p className="text-muted-foreground text-xs sm:text-sm px-2">
                          Select your cooking goals to get personalized recommendations (you can skip this step)
                        </p>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {getFilteredOptions(GOAL_OPTIONS).map((option, index) => (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleArrayToggle('goals', option.id)}
                            className={cn(
                              "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group min-h-[100px] flex flex-col justify-center",
                              "hover:shadow-lg active:shadow-md",
                              data.goals.includes(option.id)
                                ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            )}
                          >
                            <div className="text-center space-y-2">
                              <div className="font-semibold text-xs sm:text-sm text-card-foreground group-hover:text-primary transition-colors leading-tight">
                                {option.label}
                              </div>
                              <div className="text-xs text-muted-foreground leading-relaxed">
                                {option.description}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 font-semibold transition-all duration-200 w-full sm:w-auto",
                  currentStep === 1 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-accent hover:border-border hover:shadow-md"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </motion.div>

            {currentStep < STEPS.length ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(
                    "flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    !canProceed() && "opacity-50 cursor-not-allowed hover:scale-100"
                  )}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Continue</span>
                  <motion.div
                    animate={canProceed() ? { x: [0, 3, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-full sm:w-auto order-1 sm:order-2"
              >
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center gap-2 h-12 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden w-full sm:w-auto",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    isLoading && "cursor-not-allowed"
                  )}
                >
                  <motion.div
                    className="absolute inset-0 bg-primary-foreground/20"
                    initial={{ x: "-100%" }}
                    animate={!isLoading ? { x: "100%" } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-accent rounded-full" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoading ? "Setting up your experience..." : "Complete Setup"}
                  </span>
                  <span className="sm:hidden">
                    {isLoading ? "Setting up..." : "Finish"}
                  </span>
                  {!isLoading && (
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}