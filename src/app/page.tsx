"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChefHat, 
  Brain, 
  Calendar, 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Clock,
  Zap,
  Shield,
  Star,
  User,
  LogOut,
  Menu
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StructuredData } from "@/components/ui/structured-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recipe Creation",
    description: "Transform your available ingredients into delicious, personalized recipes using advanced AI technology."
  },
  {
    icon: Calendar,
    title: "Smart Meal Planning",
    description: "Plan your weekly meals with intelligent suggestions based on your preferences and dietary needs."
  },
  {
    icon: Calculator,
    title: "Calorie Estimation",
    description: "Get accurate nutritional information and calorie counts for every recipe and meal plan."
  },
  {
    icon: ChefHat,
    title: "Pantry to Plate",
    description: "Reduce food waste by creating meals from ingredients you already have in your kitchen."
  }
];

const benefits = [
  "Save time with intelligent meal suggestions",
  "Reduce food waste and grocery costs",
  "Maintain healthy eating habits",
  "Discover new recipes and cooking techniques",
  "Personalized nutrition guidance",
  "Easy-to-follow cooking instructions"
];

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { user, userPreferences, signOut } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  const handleMealPlanner = () => {
    router.push("/meal-planning");
  };

  return (
    <>
      {/* Structured Data for SEO and AI Search */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="cooking-app" />
      
      <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/cookitnext_logo.png"
                alt="CookGPT Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-foreground">CookGPT</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
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
                        <DropdownMenuItem onClick={() => router.push("/preferences")}>
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
                        <DropdownMenuItem onClick={() => router.push("/preferences")}>
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
                <Button
                  onClick={handleGetStarted}
                  variant="outline"
                  className="hidden md:inline-flex"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Cooking Assistant
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              {user ? (
                <>
                  Welcome back, <span className="text-primary">{user.displayName || 'Chef'}!</span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl text-muted-foreground mt-4">
                    Ready to cook something amazing today?
                  </span>
                </>
              ) : (
                <>
                  Transform Your Pantry Into
                  <span className="text-primary block">Delicious Meals</span>
                </>
              )}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              {user 
                ? "Jump back into your cooking journey with personalized recipes, meal planning, and AI assistance."
                : "CookGPT uses advanced AI to create personalized recipes, plan your meals, and help you cook smarter while reducing food waste."
              }
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {user ? (
                <>
                  <Button
                    onClick={handleDashboard}
                    size="lg"
                    className="text-lg px-8 py-6 h-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Go to Dashboard
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 h-auto"
                    onClick={handleMealPlanner}
                  >
                    Plan Meals
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="text-lg px-8 py-6 h-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Get Started
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 h-auto"
                    onClick={() => router.push("/explore-recipes")}
                  >
                    Explore Recipes
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Cooking
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to plan, create, and enjoy delicious meals with AI assistance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose CookGPT?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join thousands of users who have transformed their cooking experience with our AI-powered platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Smart & Fast</h3>
                      <p className="text-sm text-muted-foreground">AI-powered suggestions in seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Secure & Private</h3>
                      <p className="text-sm text-muted-foreground">Your data is always protected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Community Driven</h3>
                      <p className="text-sm text-muted-foreground">Share and discover recipes</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              {user ? "Ready to Continue Your Cooking Journey?" : "Ready to Transform Your Cooking?"}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {user 
                ? "Keep exploring new recipes and planning your meals with CookGPT"
                : "Join thousands of users who are already cooking smarter with CookGPT"
              }
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image
                src="/cookitnext_logo.png"
                alt="CookGPT Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold text-foreground">CookGPT</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a 
                href="/terms" 
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Terms & Conditions
              </a>
              <a 
                href="/cancellation" 
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Cancellation & Refund
              </a>
              <span>© 2024 CookGPT. All rights reserved. | Maintained by <a href="https://quantumbitlabs.in/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">QuantumBit Labs</a></span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Structured Data for SEO and AI Search */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="cooking-app" />
    </div>
    </>
  );
}
