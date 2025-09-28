"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChefHat,
  Calendar,
  Clock,
  Loader2,
  Sparkles,
  Send,
  MessageSquare,
  Plus,
  BookOpen,
  Utensils,
  PenTool,
  Users,
  Flame,
  X,
  Heart,
  Share2,
  Timer,
  Star,
  Trash2,
  Eye,
  FolderOpen,
  Filter,
  SlidersHorizontal,
  Brain,
  Settings,
  LogOut,
  User
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function StaticDashboardFallback() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("chat");

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      text: "Welcome to CookGPT! 🍳 I'm your AI cooking assistant. I can help you create personalized recipes, plan meals, and answer cooking questions. What would you like to cook today?",
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responses = [
        "That sounds delicious! I'd love to help you with that recipe. Let me suggest some ingredients and techniques that would work well.",
        "Great choice! I can help you create a personalized version of that dish. What dietary preferences do you have?",
        "I'm excited to help you cook that! Let me break down the steps and suggest some variations you might enjoy.",
        "Perfect! That's one of my favorite dishes to help with. I can provide detailed instructions and cooking tips.",
        "Excellent choice! I can help you make that dish even better with some professional techniques and ingredient suggestions."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error("Sorry, I'm having trouble right now. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = [
    "Show me a quick dinner recipe",
    "Help me plan meals for the week",
    "What can I cook with chicken?",
    "Teach me knife skills",
    "Suggest healthy breakfast ideas"
  ];

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
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CookGPT
                </h1>
                <p className="text-xs text-gray-500">AI Cooking Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Demo Mode
              </Badge>
              
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                
                <Link href="/smart-dashboard">
                  <Button variant="default" size="sm">
                    <Brain className="w-4 h-4 mr-2" />
                    Smart Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Quick Suggestions</h3>
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => setInputMessage(suggestion)}
                    >
                      <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Features</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ChefHat className="w-4 h-4" />
                      AI Recipe Generation
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Meal Planning
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      Cooking Tips
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      Community Recipes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat with CookGPT
                  <Badge variant="outline" className="ml-auto">Demo Mode</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          {message.isBot && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="/cookitnext_logo.png" />
                              <AvatarFallback>
                                <ChefHat className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[80%] ${message.isBot ? '' : 'order-first'}`}>
                            <Card className={`${message.isBot ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                              <CardContent className="p-4">
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                              </CardContent>
                            </Card>
                          </div>

                          {!message.isBot && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}

                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3 justify-start"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/cookitnext_logo.png" />
                            <AvatarFallback>
                              <ChefHat className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-sm text-gray-600">CookGPT is thinking...</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about cooking... I'm here to help! 🍳"
                        className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Recipe Generation</h3>
              <p className="text-sm text-gray-600">Create personalized recipes from your available ingredients</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Meal Planning</h3>
              <p className="text-sm text-gray-600">Plan your weekly meals with intelligent suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Cooking Education</h3>
              <p className="text-sm text-gray-600">Learn new techniques and improve your cooking skills</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
