"use client";

import { motion } from "framer-motion";
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
  Timer,
  Utensils
} from "lucide-react";
import { Recipe } from "@/lib/gemini-service";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
  onViewDetails?: (recipe: Recipe) => void;
  className?: string;
  index?: number;
}

const difficultyConfig = {
  Easy: { 
    color: 'text-emerald-700 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800', 
    icon: '',
    gradient: 'from-emerald-500/10 to-emerald-600/10'
  },
  Medium: { 
    color: 'text-amber-700 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800', 
    icon: '',
    gradient: 'from-amber-500/10 to-orange-600/10'
  },
  Hard: { 
    color: 'text-red-700 dark:text-red-400', 
    bg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800', 
    icon: '',
    gradient: 'from-red-500/10 to-rose-600/10'
  }
};

export default function RecipeCard({ 
  recipe, 
  onSave, 
  onShare, 
  onViewDetails, 
  className,
  index = 0 
}: RecipeCardProps) {
  const difficulty = difficultyConfig[recipe.difficulty] || difficultyConfig.Easy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.2, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      className={cn("h-full", className)}
    >
      <Card className="group relative h-full bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden rounded-xl">
        {/* Responsive Image Section */}
        <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 overflow-hidden">
          {recipe.imageUrl ? (
            <>
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
                style={{ objectPosition: 'center' }}
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              
              {/* Floating action buttons with tooltips */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {onSave && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 shadow-sm backdrop-blur-sm transition-colors rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSave(recipe);
                        }}
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Save</TooltipContent>
                  </Tooltip>
                )}
                {onShare && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-500 shadow-sm backdrop-blur-sm transition-colors rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(recipe);
                        }}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Share</TooltipContent>
                  </Tooltip>
                )}
              </div>
              {/* Hover quick stats overlay */}
              <div className="pointer-events-none absolute bottom-0 inset-x-0 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                <div className="mx-2 mb-2 rounded-lg bg-black/45 text-white backdrop-blur-sm px-2 py-1.5 flex items-center justify-between gap-2 text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1"><Timer className="w-3 h-3" /><span>{recipe.cookingTime}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{recipe.servings}</span></div>
                  <div className="flex items-center gap-1"><ChefHat className="w-3 h-3" /><span>{Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0}</span></div>
                  {recipe.calories && (
                    <div className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /><span>{recipe.calories}</span></div>
                  )}
                </div>
              </div>

              {/* Compact difficulty badge */}
              <div className="absolute top-2 left-2">
                <Badge className={cn("text-xs font-medium px-1.5 py-0.5 shadow-sm backdrop-blur-sm", difficulty.bg, difficulty.color)}>
                  <span className="mr-1">{difficulty.icon}</span>
                  {recipe.difficulty}
                </Badge>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
              <Utensils className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Compact Content Section */}
        <CardContent className="p-3 sm:p-3.5 space-y-2 relative">
          {/* Title and Description - more compact */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {recipe.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {recipe.description}
            </p>
          </div>

          {/* Compact Stats - Single Row */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground py-1">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-primary" />
              <span className="font-medium">{recipe.cookingTime}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" />
              <span className="font-medium">{recipe.servings}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <ChefHat className="w-3 h-3 text-primary" />
              <span className="font-medium">{Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0}</span>
            </div>

            {recipe.calories && (
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="font-medium">{recipe.calories}</span>
              </div>
            )}
          </div>

          {/* Compact Tags */}
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs h-5 px-1.5 bg-muted/20 border-border/50 text-foreground/70 rounded-md"
              >
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 2 && (
              <Badge variant="outline" className="text-xs h-5 px-1.5 bg-muted/30 border-border/50 text-muted-foreground rounded-md">
                +{recipe.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Compact Action Button */}
          <Button
            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all duration-200 h-8 text-xs mt-2 rounded-lg"
            onClick={() => onViewDetails?.(recipe)}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            View Recipe
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { type RecipeCardProps };