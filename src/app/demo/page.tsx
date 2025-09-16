"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeCard from "@/components/ui/recipe-card";
import { toast } from "sonner";

export default function ComponentsDemo() {
  // Sample recipe data for demonstration
  const sampleRecipe = {
    id: "1",
    title: "AI-Generated Pasta Primavera",
    description: "A delicious and colorful pasta dish with fresh vegetables, created by CookItNext AI based on your available ingredients.",
    cookingTime: "25 minutes",
    servings: 4,
    difficulty: "Easy" as const,
    author: {
      name: "CookItNext",
      avatar: "/chef-avatar.jpg"
    },
    tags: ["Vegetarian", "Quick", "Italian", "Healthy"],
    ingredients: [
      "12 oz penne pasta",
      "2 tbsp olive oil",
      "1 bell pepper, sliced",
      "1 zucchini, diced",
      "1 cup cherry tomatoes, halved",
      "3 cloves garlic, minced",
      "1/4 cup fresh basil, chopped",
      "1/2 cup Parmesan cheese, grated",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Bring a large pot of salted water to boil. Cook pasta according to package directions until al dente.",
      "Heat olive oil in a large skillet over medium-high heat.",
      "Add bell pepper and zucchini. Cook for 5-7 minutes until tender-crisp.",
      "Add cherry tomatoes and garlic. Cook for 2-3 minutes more.",
      "Drain pasta and add to the skillet with vegetables.",
      "Toss everything together, add fresh basil and Parmesan cheese.",
      "Season with salt and pepper. Serve immediately."
    ],
    nutrition: {
      calories: 420,
      protein: 15,
      carbs: 68,
      fat: 12
    }
  };

  const handleToastDemo = () => {
    toast.success("Recipe saved to your favorites!", {
      description: "You can find it in your profile under 'Saved Recipes'.",
    });
  };

  const handleErrorToast = () => {
    toast.error("Failed to generate recipe", {
      description: "Please check your internet connection and try again.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CookIt UI Components Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Showcasing shadcn/ui components integrated into the CookIt cooking app
          </p>
        </div>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recipe Tags & Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>Vegetarian</Badge>
            <Badge variant="secondary">Gluten-Free</Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              Easy
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              Medium
            </Badge>
            <Badge className="bg-red-50 text-red-700 border-red-200">
              Hard
            </Badge>
          </div>
        </section>

        {/* Avatars Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Chef & User Avatars</h2>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/chef-avatar.jpg" alt="Chef Profile" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Avatar className="w-16 h-16">
              <AvatarFallback>👨‍🍳</AvatarFallback>
            </Avatar>
            <Avatar className="w-20 h-20">
              <AvatarFallback>🤖</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Progress Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cooking Progress</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Recipe Progress</span>
                <span>3/7 steps completed</span>
              </div>
              <Progress value={42} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cooking Timer</span>
                <span>15:30 remaining</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </div>
        </section>

        {/* Loading Skeletons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </section>

        {/* Ingredient Checklist */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ingredient Checklist</h2>
          <div className="space-y-3 bg-card p-6 rounded-lg border">
            {sampleRecipe.ingredients.slice(0, 5).map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox id={`demo-ingredient-${index}`} />
                <label
                  htmlFor={`demo-ingredient-${index}`}
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {ingredient}
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Toast Notifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Toast Notifications</h2>
          <div className="flex gap-4">
            <Button onClick={handleToastDemo}>
              Show Success Toast
            </Button>
            <Button variant="destructive" onClick={handleErrorToast}>
              Show Error Toast
            </Button>
          </div>
        </section>

        {/* Full Recipe Card Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Complete Recipe Card</h2>
          <div className="max-w-md mx-auto">
            <RecipeCard recipe={sampleRecipe} />
          </div>
        </section>
      </div>
    </div>
  );
}