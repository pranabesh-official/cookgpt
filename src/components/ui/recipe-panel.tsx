"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  Flame,
  BookOpen,
  Heart,
  Share2,
  X,
  Utensils,
  Loader2
} from "lucide-react";
import { Recipe } from "@/lib/gemini-service";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RecipePanelProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
  className?: string;
}

export default function RecipePanel({ 
  recipe, 
  isOpen, 
  onClose, 
  onSave, 
  onShare, 
  className 
}: RecipePanelProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!recipe) return null;

  const handleSave = async (recipe: Recipe) => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(recipe);
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 200,
            duration: 0.3
          }}
          className={cn(
            "fixed right-0 top-0 h-full w-[480px] xl:w-[520px] 2xl:w-[580px] bg-background border-l border-border/50 shadow-2xl z-50 overflow-hidden hidden lg:block",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Recipe Details</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 pb-20">
            <div className="p-6 space-y-6">
              {/* Recipe Image */}
              {recipe.imageUrl && (
                <div className="relative h-48 lg:h-56 xl:h-64 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              )}

              {/* Recipe Title and Description */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {recipe.title}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Recipe Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{recipe.cookingTime}</p>
                    <p className="text-xs text-muted-foreground">Cooking Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{recipe.servings} servings</p>
                    <p className="text-xs text-muted-foreground">Serves</p>
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
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Ingredients
                </h3>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm leading-relaxed">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Cooking Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors">
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

              {/* Bottom padding to prevent content from being cut off */}
              <div className="h-24"></div>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border/50">
            <div className="flex gap-3">
              {onSave && (
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  onClick={() => handleSave(recipe)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Recipe"}
                </Button>
              )}
              {onShare && (
                <Button 
                  variant="outline" 
                  className="flex-1 hover:bg-accent/50"
                  onClick={() => onShare(recipe)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { type RecipePanelProps };