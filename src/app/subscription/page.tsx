"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { SUBSCRIPTION_PLANS, getUserSubscriptionTier } from "@/lib/subscription";
import {
  Check,
  Crown,
  Star,
  Zap,
  ArrowLeft,
  CreditCard,
  Loader2
} from "lucide-react";
import Link from "next/link";

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const currentTier = getUserSubscriptionTier(user);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle return from Cashfree payment
  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const subscriptionId = searchParams.get('subscriptionId');

    if (status === 'success' && plan) {
      setShowSuccessMessage(true);
      
      // Clear pending subscription from session storage
      sessionStorage.removeItem('pendingSubscription');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clean up URL parameters
        router.replace('/subscription');
      }, 5000);
    }
  }, [searchParams, router]);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      alert('Please sign in to upgrade');
      return;
    }

    setIsUpgrading(planId);

    try {
      const endpoint = process.env.NEXT_PUBLIC_SUBS_ENDPOINT || 'https://us-central1-cookgpt-a865a.cloudfunctions.net/createSubscription';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            userId: user.uid,
            planId: planId,
            email: (user as any)?.email ?? null,
            phone: (user as any)?.phoneNumber ?? null
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Handle Cashfree API response structure
        if (result.success || result.status === 'SUCCESS') {
          // Cashfree uses 'authLink' for payment redirect
          const redirectUrl = result.authLink || result.redirectUrl;
          
          if (redirectUrl) {
            // Store subscription details for success handling
            sessionStorage.setItem('pendingSubscription', JSON.stringify({
              subscriptionId: result.subscriptionId,
              planId: planId,
              userId: user.uid
            }));
            
            window.location.href = redirectUrl;
          } else {
            alert('Upgrade initiated successfully! You will be redirected to complete the payment.');
            // In production, this would redirect to Cashfree's payment page
            // For now, simulate the success flow locally
            setTimeout(() => {
              window.location.href = `/subscription?status=success&plan=${planId}&subscriptionId=${result.subscriptionId}`;
            }, 2000);
          }
        } else {
          alert(`Failed to initiate upgrade: ${result.message || result.error?.message || 'Please try again.'}`);
        }
      } else {
        const errorMessage = result.error?.message || result.message || 'Please try again.';
        alert(`Failed to initiate upgrade: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpgrading(null);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'basic': return <Star className="w-6 h-6" />;
      case 'pro': return <Crown className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500';
      case 'basic': return 'bg-blue-500';
      case 'pro': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/explore-recipes" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
              <Link href="/preferences" className="text-muted-foreground hover:text-foreground transition-colors">Preferences</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Subscription Successful!
                    </h3>
                    <p className="text-green-700">
                      Your subscription has been activated. You now have access to all {searchParams.get('plan')} plan features.
                      This message will auto-hide in a few seconds.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of CookGPT with our subscription plans.
            All payments are processed securely through Cashfree.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([tier, plan]) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: parseInt(tier) * 0.1 }}
            >
              <Card
                className={`relative h-full transition-all duration-200 ${
                  tier === currentTier
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                {tier === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-yellow-50 px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${getPlanColor(tier)}`}>
                      {getPlanIcon(tier)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    ₹{plan.price}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>AI Recipes per day</span>
                      <span className="font-medium">
                        {plan.features.aiRecipesPerDay === -1 ? 'Unlimited' : plan.features.aiRecipesPerDay}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Recipe Images</span>
                      <span className="font-medium">
                        {plan.features.imagesPerDay === -1 ? 'Unlimited' : plan.features.imagesPerDay}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Meal Planning</span>
                      <span className="font-medium">
                        {plan.features.mealPlans === -1 ? 'Unlimited' :
                         plan.features.mealPlans === 0 ? 'Not available' :
                         `${plan.features.mealPlans} plan${plan.features.mealPlans > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Save Favorites</span>
                      <span className="font-medium">{plan.features.saveFavorites ? '✓' : '✗'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Calorie Tracker</span>
                      <span className="font-medium">{plan.features.calorieTracker ? '✓' : '✗'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Grocery Export</span>
                      <span className="font-medium">{plan.features.groceryListExport ? '✓' : '✗'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Priority Support</span>
                      <span className="font-medium">{plan.features.prioritySupport ? '✓' : '✗'}</span>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    className="w-full"
                    variant={tier === currentTier ? "secondary" : "default"}
                    disabled={tier === currentTier || isUpgrading === tier}
                    onClick={() => handleUpgrade(tier)}
                  >
                    {isUpgrading === tier ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : tier === currentTier ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Secure Payment Options</h2>
          <p className="text-muted-foreground mb-8">
            We support multiple payment methods through Cashfree for your convenience:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <h3 className="font-medium mb-2">UPI Autopay</h3>
                <p className="text-sm text-muted-foreground">Up to ₹1,00,000/month</p>
              </CardContent>
            </Card>

            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <h3 className="font-medium mb-2">Debit/Credit Cards</h3>
                <p className="text-sm text-muted-foreground">Up to ₹1,00,00,000</p>
              </CardContent>
            </Card>

            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <h3 className="font-medium mb-2">eNACH</h3>
                <p className="text-sm text-muted-foreground">Bank mandate</p>
              </CardContent>
            </Card>

            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <h3 className="font-medium mb-2">Physical NACH</h3>
                <p className="text-sm text-muted-foreground">Paper-based</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime. Questions?
            <Link href="/support" className="text-primary hover:underline ml-1">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
