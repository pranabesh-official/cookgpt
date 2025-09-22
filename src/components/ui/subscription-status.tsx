"use client";

import { useAuth } from "@/lib/auth-context";
import {
  getUserSubscriptionTier,
  SUBSCRIPTION_PLANS,
  getUpgradeMessage
} from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const tier = getUserSubscriptionTier(user);
  const plan = SUBSCRIPTION_PLANS[tier];

  const getTierIcon = () => {
    switch (tier) {
      case 'free': return <Zap className="w-4 h-4" />;
      case 'basic': return <Star className="w-4 h-4" />;
      case 'pro': return <Crown className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'free': return 'bg-gray-500';
      case 'basic': return 'bg-blue-500';
      case 'pro': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-full ${getTierColor()}`}>
              {getTierIcon()}
            </div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
          </div>
          <Badge variant={tier === 'free' ? 'secondary' : 'default'}>
            {tier.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Recipes per day:</span>
            <span>{plan.features.aiRecipesPerDay === -1 ? 'Unlimited' : plan.features.aiRecipesPerDay}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Images per day:</span>
            <span>{plan.features.imagesPerDay === -1 ? 'Unlimited' : plan.features.imagesPerDay}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Meal Planning:</span>
            <span>{plan.features.mealPlans === -1 ? 'Unlimited' : plan.features.mealPlans === 0 ? 'Not available' : `${plan.features.mealPlans} plan${plan.features.mealPlans > 1 ? 's' : ''}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Save Favorites:</span>
            <span>{plan.features.saveFavorites ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Calorie Tracker:</span>
            <span>{plan.features.calorieTracker ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Grocery Export:</span>
            <span>{plan.features.groceryListExport ? '✓' : '✗'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Priority Support:</span>
            <span>{plan.features.prioritySupport ? '✓' : '✗'}</span>
          </div>
        </div>

        {tier !== 'pro' && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              {getUpgradeMessage(user)}
            </p>
            <Button className="w-full" size="sm">
              Upgrade to {tier === 'free' ? 'Basic' : 'Pro'}
            </Button>
          </div>
        )}

        {tier === 'pro' && (
          <div className="border-t pt-4">
            <p className="text-sm text-green-600 font-medium">
              🎉 You're on the best plan! Enjoy all features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
