"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Brain,
  Heart,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Users,
  BookOpen,
  Zap,
  Star,
  MessageSquare,
  ChefHat,
  Timer,
  Award,
  Activity
} from "lucide-react";
import { smartConversationService } from "@/lib/smart-conversation-service";

interface ConversationInsights {
  totalConversations: number;
  averageEngagementTime: number;
  mostCommonEmotionalState: string;
  mostCommonMood: string;
  userSkillProgression: string;
  favoriteTopics: string[];
}

interface SmartAnalyticsData {
  conversationInsights: ConversationInsights;
  emotionalTrends: Array<{
    date: string;
    emotionalState: string;
    count: number;
  }>;
  skillProgression: Array<{
    date: string;
    level: string;
    confidence: number;
  }>;
  engagementMetrics: {
    averageResponseTime: number;
    conversationDepth: number;
    learningRetention: number;
    userSatisfaction: number;
  };
  cookingGoals: Array<{
    goal: string;
    progress: number;
    confidence: number;
  }>;
  personalityInsights: {
    communicationStyle: string;
    learningPreference: string;
    motivationLevel: string;
    challengeTolerance: string;
  };
}

export default function SmartAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<SmartAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Get basic conversation insights
      const conversationInsights = smartConversationService.getConversationInsights();
      
      // Generate mock data for demonstration (in real app, this would come from analytics service)
      const mockData: SmartAnalyticsData = {
        conversationInsights,
        emotionalTrends: [
          { date: '2024-01-01', emotionalState: 'excited', count: 5 },
          { date: '2024-01-02', emotionalState: 'curious', count: 8 },
          { date: '2024-01-03', emotionalState: 'frustrated', count: 3 },
          { date: '2024-01-04', emotionalState: 'confident', count: 12 },
          { date: '2024-01-05', emotionalState: 'excited', count: 7 },
        ],
        skillProgression: [
          { date: '2024-01-01', level: 'beginner', confidence: 3 },
          { date: '2024-01-02', level: 'beginner', confidence: 4 },
          { date: '2024-01-03', level: 'intermediate', confidence: 5 },
          { date: '2024-01-04', level: 'intermediate', confidence: 6 },
          { date: '2024-01-05', level: 'intermediate', confidence: 7 },
        ],
        engagementMetrics: {
          averageResponseTime: 2.3,
          conversationDepth: 8.5,
          learningRetention: 85,
          userSatisfaction: 92,
        },
        cookingGoals: [
          { goal: 'Master knife skills', progress: 60, confidence: 7 },
          { goal: 'Learn Italian cuisine', progress: 40, confidence: 6 },
          { goal: 'Bake perfect bread', progress: 25, confidence: 4 },
          { goal: 'Cook healthy meals', progress: 80, confidence: 8 },
        ],
        personalityInsights: {
          communicationStyle: 'Enthusiastic & Supportive',
          learningPreference: 'Visual & Hands-on',
          motivationLevel: 'High',
          challengeTolerance: 'Medium',
        },
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'excited': return 'text-yellow-500';
      case 'frustrated': return 'text-red-500';
      case 'curious': return 'text-blue-500';
      case 'confident': return 'text-green-500';
      case 'overwhelmed': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getEmotionalStateIcon = (state: string) => {
    switch (state) {
      case 'excited': return <Zap className="w-4 h-4" />;
      case 'frustrated': return <Heart className="w-4 h-4" />;
      case 'curious': return <Lightbulb className="w-4 h-4" />;
      case 'confident': return <Star className="w-4 h-4" />;
      case 'overwhelmed': return <Users className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-blue-500';
      case 'advanced': return 'text-purple-500';
      case 'expert': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No analytics data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2">Smart Conversation Analytics</h2>
        <p className="text-gray-600">
          AI-powered insights into your cooking journey and conversation patterns
        </p>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold">{analyticsData.conversationInsights.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold">{analyticsData.conversationInsights.averageEngagementTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Mood</p>
                <p className="text-lg font-bold capitalize">{analyticsData.conversationInsights.mostCommonEmotionalState}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Skill Level</p>
                <p className="text-lg font-bold capitalize">{analyticsData.conversationInsights.userSkillProgression}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Time</span>
                  <span className="font-semibold">{analyticsData.engagementMetrics.averageResponseTime}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversation Depth</span>
                  <span className="font-semibold">{analyticsData.engagementMetrics.conversationDepth}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Learning Retention</span>
                  <span className="font-semibold">{analyticsData.engagementMetrics.learningRetention}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfaction</span>
                  <span className="font-semibold">{analyticsData.engagementMetrics.userSatisfaction}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Personality Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Personality Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Communication Style</p>
                  <Badge variant="outline">{analyticsData.personalityInsights.communicationStyle}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Learning Preference</p>
                  <Badge variant="outline">{analyticsData.personalityInsights.learningPreference}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Motivation Level</p>
                  <Badge variant="outline">{analyticsData.personalityInsights.motivationLevel}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Challenge Tolerance</p>
                  <Badge variant="outline">{analyticsData.personalityInsights.challengeTolerance}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Emotional Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.emotionalTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={getEmotionalStateColor(trend.emotionalState)}>
                          {getEmotionalStateIcon(trend.emotionalState)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{trend.emotionalState}</p>
                          <p className="text-sm text-gray-600">{trend.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{trend.count} times</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Skill Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Skill Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.skillProgression.map((progression, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={getSkillLevelColor(progression.level)}>
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{progression.level}</p>
                          <p className="text-sm text-gray-600">{progression.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{progression.confidence}/10</p>
                        <Progress value={progression.confidence * 10} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cooking Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Cooking Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.cookingGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.goal}</span>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="w-full" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Confidence: {goal.confidence}/10</span>
                        <span>Progress: {goal.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Learning Focus</p>
                  <p className="text-xs text-blue-600">Focus on intermediate techniques to build confidence</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Motivation Boost</p>
                  <p className="text-xs text-green-600">You're most engaged with Italian cuisine - explore more!</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Challenge Level</p>
                  <p className="text-xs text-yellow-600">Try slightly more complex recipes to grow your skills</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Conversation Master</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Learning Enthusiast</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Heart className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Emotional Intelligence</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Quick Learner</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
