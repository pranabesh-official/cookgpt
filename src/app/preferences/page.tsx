"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { ChefHat, Utensils, Clock, Target, Save, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PreferencesData {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  mealTypeFocus: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  cookingTime: '15min' | '30min' | '1hr+';
  goals: string[];
}

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

export default function PreferencesPage() {
  const router = useRouter();
  const { user, userPreferences, updateUserPreferences, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PreferencesData>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    mealTypeFocus: [],
    skillLevel: 'beginner',
    cookingTime: '30min',
    goals: [],
  });

  // Redirect if user is not authenticated
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (hasRedirected.current) return;
    if (!authLoading && !user) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Load current preferences
  useEffect(() => {
    if (userPreferences) {
      setData({
        dietaryRestrictions: userPreferences.dietaryRestrictions || [],
        cuisinePreferences: userPreferences.cuisinePreferences || [],
        mealTypeFocus: userPreferences.mealTypeFocus || [],
        skillLevel: userPreferences.skillLevel || 'beginner',
        cookingTime: userPreferences.cookingTime || '30min',
        goals: userPreferences.goals || [],
      });
    }
  }, [userPreferences]);

  const handleArrayToggle = (field: keyof Pick<PreferencesData, 'dietaryRestrictions' | 'cuisinePreferences' | 'mealTypeFocus' | 'goals'>, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserPreferences({
        ...data,
        onboardingCompleted: true, // Ensure this remains true
      });
      
      toast.success("Preferences Updated!", {
        description: "Your cooking preferences have been saved successfully.",
      });
      
      // Optionally redirect back to dashboard
      // router.push("/dashboard");
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("Failed to save preferences", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cooking Preferences</h1>
                <p className="text-sm text-muted-foreground">
                  Customize your culinary experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Dietary Restrictions */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Dietary Preferences</CardTitle>
                  <CardDescription>Select any dietary restrictions or preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DIETARY_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.dietaryRestrictions.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => handleArrayToggle('dietaryRestrictions', option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.dietaryRestrictions.includes(option.id) && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cuisine Preferences */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cuisine Preferences</CardTitle>
                  <CardDescription>Choose your favorite cuisines</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CUISINE_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.cuisinePreferences.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => handleArrayToggle('cuisinePreferences', option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.cuisinePreferences.includes(option.id) && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meal Focus */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Meal Focus</CardTitle>
                  <CardDescription>Which meals are you most interested in?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MEAL_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.mealTypeFocus.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => handleArrayToggle('mealTypeFocus', option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.mealTypeFocus.includes(option.id) && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Level & Cooking Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill Level */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Skill Level</CardTitle>
                    <CardDescription>What's your cooking experience?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {SKILL_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.skillLevel === option.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => setData(prev => ({ ...prev, skillLevel: option.id as any }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.skillLevel === option.id && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cooking Time */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Cooking Time</CardTitle>
                    <CardDescription>How much time do you usually have?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {TIME_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.cookingTime === option.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => setData(prev => ({ ...prev, cookingTime: option.id as any }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.cookingTime === option.id && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Goals */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cooking Goals</CardTitle>
                  <CardDescription>What are you hoping to achieve? (Optional)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      data.goals.includes(option.id)
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                        : "border-border hover:border-primary/50 bg-background/50"
                    )}
                    onClick={() => handleArrayToggle('goals', option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.goals.includes(option.id) && (
                        <Badge variant="default" className="bg-primary">✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pb-8">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}