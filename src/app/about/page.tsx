"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User,
  LogOut,
  Menu,
  Calendar,
  ChefHat,
  Award,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Target,
  CheckCircle,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AboutPage() {
  const { user, signOut } = useAuth();

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
              <Link href="/explore-recipes" className="text-muted-foreground hover:text-foreground transition-colors">Explore Recipes</Link>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Trusted by 50,000+ Home Cooks
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            About <span className="text-primary">CookGPT</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            The leading AI-powered culinary platform that transforms how families plan, prepare, and enjoy meals at home
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>50,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>1M+ Recipes Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>95% User Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base text-muted-foreground leading-relaxed">
                To democratize culinary creativity by making professional-quality meal planning accessible to every household. 
                We empower families to reduce food waste, save time, and discover new flavors through intelligent AI-driven recipe generation.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-base text-muted-foreground leading-relaxed">
                To become the world's most trusted culinary companion, where every meal is an opportunity for discovery, 
                every ingredient finds its purpose, and every family enjoys the benefits of intelligent meal planning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at CookGPT
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground">Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm text-muted-foreground">
                  Cutting-edge AI technology that continuously evolves to serve our users better
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground">Trust</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm text-muted-foreground">
                  Reliable, secure, and transparent service that families can depend on daily
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground">Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm text-muted-foreground">
                  Building connections between home cooks and fostering culinary creativity
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground">Excellence</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm text-muted-foreground">
                  Commitment to delivering exceptional user experiences and recipe quality
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-20">
          <Card className="border border-border/40 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">By the Numbers</h2>
                <p className="text-lg text-muted-foreground">Our impact in the culinary world</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-sm text-muted-foreground">Recipes Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">30%</div>
                  <div className="text-sm text-muted-foreground">Food Waste Reduction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Us Section */}
        <div className="mb-20">
          <Card className="border border-border/40 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Contact Us</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Last updated on 16-09-2025 21:15:21
                </p>
                <p className="text-lg text-muted-foreground">
                  You may contact us using the information below:
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Legal Entity</h3>
                      <p className="text-muted-foreground">PRANABESH SARKAR</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Registered Address</h3>
                      <p className="text-muted-foreground">
                        Rail Gate Bazar, Bangchatra Road, Guriyahati -2,<br />
                        Cooch Behar, West Bengal, PIN: 736170
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Operational Address</h3>
                      <p className="text-muted-foreground">
                        Rail Gate Bazar, Bangchatra Road, Guriyahati -2,<br />
                        Cooch Behar, West Bengal, PIN: 736170
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Telephone</h3>
                      <p className="text-muted-foreground">
                        <a 
                          href="tel:+919064898395" 
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          +91 9064898395
                        </a>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                      <p className="text-muted-foreground">
                        <a 
                          href="mailto:growpos.official@gmail.com" 
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          growpos.official@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-3xl p-8 sm:p-12 lg:p-16 text-primary-foreground shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
            <motion.div 
              className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="relative z-10">
              {/* Trust indicators */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-8"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  <span>50,000+ Happy Users</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Award className="w-4 h-4" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>100% Secure</span>
                </div>
              </motion.div>
              
              {/* Main headline */}
              <motion.h2 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Transform Your Kitchen Into a
                <span className="block text-white/90">Culinary Innovation Hub</span>
              </motion.h2>
              
              {/* Subheadline */}
              <motion.p 
                className="text-xl sm:text-2xl lg:text-3xl mb-4 opacity-95 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                Stop wasting time, money, and ingredients.
              </motion.p>
              <motion.p 
                className="text-lg sm:text-xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Join thousands of families who've discovered the secret to effortless meal planning, 
                reduced food waste, and restaurant-quality dishes at home.
              </motion.p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                {["Save 3+ hours weekly", "Reduce food waste by 30%", "Discover 1000+ new recipes"].map((point, i) => (
                  <motion.div
                    key={point}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.08 * i }}
                  >
                    <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
                    <span className="text-sm font-medium">{point}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* CTA buttons removed as requested */}
              
              {/* Trust signals */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 }}
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
                
                <p className="text-sm opacity-70 max-w-2xl mx-auto">
                  Join the culinary revolution. Start your free trial today and experience 
                  the future of intelligent meal planning.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
