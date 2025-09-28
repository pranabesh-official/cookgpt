// Business logic constants for subscription-based features
// Easy to update from this central const file

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // in INR
  features: {
    aiRecipesPerDay: number;
    maxRecipes: number; // for free trial
    imagesPerDay: number;
    mealPlans: number;
    calorieTracker: boolean;
    groceryListExport: boolean;
    prioritySupport: boolean;
    saveFavorites: boolean;
  };
  limits: {
    recipeGenerations: number;
    imageGenerations: number;
    mealPlanDays: number;
  };
}

// Define subscription plans based on business requirements
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free Trial (7 Days)',
    price: 0,
    features: {
      aiRecipesPerDay: 3,
      maxRecipes: 21,
      imagesPerDay: 2,
      mealPlans: 1,
      calorieTracker: false,
      groceryListExport: false,
      prioritySupport: false,
      saveFavorites: false,
    },
    limits: {
      recipeGenerations: 3,
      imageGenerations: 2,
      mealPlanDays: 7,
    },
  },
  basic: {
    tier: 'basic',
    name: 'Basic Plan',
    price: 499, // ₹499/month - can be updated here
    features: {
      aiRecipesPerDay: 20,
      maxRecipes: -1, // unlimited
      imagesPerDay: -1, // unlimited
      mealPlans: -1, // unlimited
      calorieTracker: false,
      groceryListExport: false,
      prioritySupport: false,
      saveFavorites: true,
    },
    limits: {
      recipeGenerations: 20,
      imageGenerations: -1, // unlimited
      mealPlanDays: -1, // unlimited
    },
  },
  pro: {
    tier: 'pro',
    name: 'Pro Plan',
    price: 799, // ₹799/month - can be updated here
    features: {
      aiRecipesPerDay: -1, // unlimited
      maxRecipes: -1, // unlimited
      imagesPerDay: -1, // unlimited
      mealPlans: -1, // unlimited
      calorieTracker: true,
      groceryListExport: true,
      prioritySupport: true,
      saveFavorites: true,
    },
    limits: {
      recipeGenerations: -1, // unlimited
      imageGenerations: -1, // unlimited
      mealPlanDays: 30, // 30-day planner
    },
  },
};

// Helper function to get user's subscription tier (placeholder - integrate with your auth/user system)
export const getUserSubscriptionTier = (user: any): SubscriptionTier => {
  // TODO: Replace with actual subscription check from user data/Firestore
  // For now, default to 'free' for demo purposes
  return user?.subscriptionTier || 'free';
};

// Check if user can generate recipes
export const canGenerateRecipes = (user: any, currentCount: number = 0): boolean => {
  const tier = getUserSubscriptionTier(user);
  const plan = SUBSCRIPTION_PLANS[tier];

  if (plan.limits.recipeGenerations === -1) return true; // unlimited
  return currentCount < plan.limits.recipeGenerations;
};

// Check if user can generate images
export const canGenerateImages = (user: any, currentCount: number = 0): boolean => {
  const tier = getUserSubscriptionTier(user);
  const plan = SUBSCRIPTION_PLANS[tier];

  if (plan.limits.imageGenerations === -1) return true; // unlimited
  return currentCount < plan.limits.imageGenerations;
};

// Check if user can save favorites
export const canSaveFavorites = (user: any): boolean => {
  const tier = getUserSubscriptionTier(user);
  return SUBSCRIPTION_PLANS[tier].features.saveFavorites;
};

// Check if user can access meal planning
export const canAccessMealPlanning = (user: any): boolean => {
  const tier = getUserSubscriptionTier(user);
  return SUBSCRIPTION_PLANS[tier].features.mealPlans !== 0;
};

// Check if user can export grocery list
export const canExportGroceryList = (user: any): boolean => {
  const tier = getUserSubscriptionTier(user);
  return SUBSCRIPTION_PLANS[tier].features.groceryListExport;
};

// Get upgrade message based on current tier
export const getUpgradeMessage = (user: any): string => {
  const tier = getUserSubscriptionTier(user);
  const plan = SUBSCRIPTION_PLANS[tier];

  if (tier === 'free') {
    return `You've reached your ${plan.limits.recipeGenerations} recipe limit for today. Upgrade to Basic for ₹${SUBSCRIPTION_PLANS.basic.price}/month to get 20 recipes/day!`;
  } else if (tier === 'basic') {
    return `Unlock unlimited recipes, 30-day meal planning, and more with Pro for ₹${SUBSCRIPTION_PLANS.pro.price}/month!`;
  }
  return 'Enjoy all features with your current plan!';
};

// Payment integration notes (Cashfree)
// - Use eNACH for high-value subscriptions (up to ₹1,00,00,000)
// - UPI Autopay for lower amounts (₹15,000 without AFA, ₹1,00,000 with AFA)
// - Debit/Credit cards with OTP for standard payments
// - Physical NACH for corporate/large mandates
// Supported frequencies: daily, weekly, monthly, yearly, ad-hoc
// Customer authorization: e-mandate via NB/DC/Aadhaar, UPI PIN, OTP for cards
