"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { UserPreferences } from "@/lib/types";
import SmartChatInterface from "@/components/ui/smart-chat-interface";
import SmartAnalyticsDashboard from "@/components/ui/smart-analytics-dashboard";
import { 
  Brain, 
  BarChart3, 
  MessageSquare, 
  ChefHat, 
  Settings, 
  LogOut,
  Home,
  Sparkles,
  Zap,
  Heart,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SmartDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadUserPreferences();
  }, [user, router]);

  const loadUserPreferences = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would load from Firestore
      // For now, we'll use default preferences
      const defaultPreferences: UserPreferences = {
        dietaryRestrictions: [],
        cuisines: ['Italian', 'Asian', 'Mediterranean'],
        skillLevel: 'intermediate',
        cookingTime: 'moderate',
        spiceLevel: 'medium',
        healthGoals: ['balanced'],
        dislikedIngredients: [],
        allergies: [],
        equipment: ['basic'],
        budget: 'moderate'
      };
      setUserPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    }
  };

  const handleRecipeGenerated = (recipes: any[]) => {
    toast.success(`Generated ${recipes.length} smart recipes!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your smart cooking companion...</p>
        </div>
      </div>
    );
  }

  if (!user || !userPreferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart ChefGPT
                </h1>
                <p className="text-xs text-gray-500">AI-Enhanced Cooking Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Enhanced
              </Badge>
              
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Classic
                  </Button>
                </Link>
                
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              Welcome to Smart ChefGPT! 🧠✨
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your AI-powered cooking companion with advanced emotional intelligence, 
              adaptive learning, and smart conversation capabilities.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Emotional Intelligence</h3>
              <p className="text-sm text-gray-600">Understands your mood and adapts responses</p>
            </Card>

            <Card className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Smart Suggestions</h3>
              <p className="text-sm text-gray-600">Proactive recommendations based on context</p>
            </Card>

            <Card className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Adaptive Learning</h3>
              <p className="text-sm text-gray-600">Learns from your patterns and preferences</p>
            </Card>

            <Card className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">Smart Analytics</h3>
              <p className="text-sm text-gray-600">Insights into your cooking journey</p>
            </Card>
          </div>
        </motion.div>

        {/* Main Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Smart Chat
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  <SmartChatInterface
                    userPreferences={userPreferences}
                    onRecipeGenerated={handleRecipeGenerated}
                    className="h-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <SmartAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Smart Features Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Conversation Intelligence</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Emotional analysis and adaptation</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Proactive suggestions</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Learning pattern recognition</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Smart Recipe Generation</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Context-aware recipe suggestions</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Difficulty adaptation</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Mood-based recommendations</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Analytics & Insights</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Conversation analytics</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Progress tracking</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Personality insights</span>
                        </label>
                      </div>
                    </div>

                    <Button className="w-full">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
