"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Sparkles, 
  Brain, 
  Heart, 
  Lightbulb, 
  TrendingUp,
  Clock,
  Target,
  Zap,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Users,
  Timer,
  BarChart3
} from "lucide-react";
import { smartConversationService, SmartConversationContext, SmartConversationResponse } from "@/lib/smart-conversation-service";
import { UserPreferences } from "@/lib/types";
import { Recipe } from "@/lib/gemini-service";

interface SmartChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  emotionalTone?: string;
  conversationStrategy?: string;
  suggestedFollowUps?: string[];
  proactiveSuggestions?: string[];
  confidenceBoosters?: string[];
  learningOpportunities?: string[];
  estimatedEngagementTime?: number;
  complexityLevel?: string;
  recipes?: Recipe[];
}

interface SmartChatInterfaceProps {
  userPreferences: UserPreferences;
  onRecipeGenerated?: (recipes: Recipe[]) => void;
  className?: string;
}

export default function SmartChatInterface({ 
  userPreferences, 
  onRecipeGenerated,
  className = "" 
}: SmartChatInterfaceProps) {
  const [messages, setMessages] = useState<SmartChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [conversationInsights, setConversationInsights] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation insights
  useEffect(() => {
    const insights = smartConversationService.getConversationInsights();
    setConversationInsights(insights);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    const newUserMessage: SmartChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Create smart conversation context
      const context: SmartConversationContext = {
        userPreferences,
        chatHistory: messages.map(m => ({
          role: m.isBot ? 'assistant' : 'user',
          content: m.text,
          timestamp: m.timestamp
        })),
        currentTopic: 'cooking',
        lastRecipeGenerated: messages.findLast(m => m.recipes && m.recipes.length > 0)?.recipes?.[0],
      };

      // Process with smart conversation service
      const response: SmartConversationResponse = await smartConversationService.processSmartMessage(
        userMessage,
        context
      );

      // Create bot response message
      const botMessage: SmartChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isBot: true,
        timestamp: new Date(),
        emotionalTone: response.emotionalTone,
        conversationStrategy: response.conversationStrategy,
        suggestedFollowUps: response.suggestedFollowUps,
        proactiveSuggestions: response.proactiveSuggestions,
        confidenceBoosters: response.confidenceBoosters,
        learningOpportunities: response.learningOpportunities,
        estimatedEngagementTime: response.estimatedEngagementTime,
        complexityLevel: response.complexityLevel,
        recipes: response.shouldGenerateRecipe ? [] : undefined, // Will be populated by recipe generation
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle recipe generation if needed
      if (response.shouldGenerateRecipe && onRecipeGenerated) {
        // This would trigger recipe generation in the parent component
        // For now, we'll just show a placeholder
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessage.id 
              ? { ...msg, text: msg.text + "\n\n🍳 I'm generating some amazing recipes for you right now!" }
              : msg
          ));
        }, 1000);
      }

    } catch (error) {
      console.error('Error processing smart message:', error);
      
      // Add error message
      const errorMessage: SmartChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having a little trouble right now, but I'm still here to help! Could you try asking me again? I'd love to assist you with your cooking needs! 👨‍🍳",
        isBot: true,
        timestamp: new Date(),
        emotionalTone: 'supportive',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = (followUp: string) => {
    setInputMessage(followUp);
    inputRef.current?.focus();
  };

  const handleSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const getEmotionalToneIcon = (tone?: string) => {
    switch (tone) {
      case 'encouraging': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'celebratory': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'supportive': return <Users className="w-4 h-4 text-blue-500" />;
      case 'educational': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'excited': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStrategyIcon = (strategy?: string) => {
    switch (strategy) {
      case 'teach': return <BookOpen className="w-4 h-4" />;
      case 'guide': return <Target className="w-4 h-4" />;
      case 'celebrate': return <Star className="w-4 h-4" />;
      case 'troubleshoot': return <Brain className="w-4 h-4" />;
      case 'inspire': return <Sparkles className="w-4 h-4" />;
      case 'simplify': return <Lightbulb className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Insights */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Smart ChefGPT
              <Badge variant="secondary" className="ml-2">
                AI Enhanced
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
              {showInsights ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardHeader>
        
        {showInsights && conversationInsights && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>{conversationInsights.totalConversations} chats</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-green-500" />
                <span>{conversationInsights.averageEngagementTime}min avg</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>{conversationInsights.mostCommonEmotionalState}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span>{conversationInsights.userSkillProgression}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Messages Area */}
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to Smart ChefGPT! 🧠</h3>
                  <p className="text-gray-600 mb-4">
                    I'm your AI cooking companion with enhanced intelligence. I can understand your emotions, 
                    adapt to your skill level, and provide personalized guidance!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline">Emotional Intelligence</Badge>
                    <Badge variant="outline">Adaptive Learning</Badge>
                    <Badge variant="outline">Smart Suggestions</Badge>
                    <Badge variant="outline">Context Awareness</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/cookitnext_logo.png" />
                    <AvatarFallback>
                      <Brain className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.isBot ? '' : 'order-first'}`}>
                  <Card className={`${message.isBot ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        {message.isBot && (
                          <div className="flex items-center gap-1 ml-2">
                            {getEmotionalToneIcon(message.emotionalTone)}
                            {getStrategyIcon(message.conversationStrategy)}
                          </div>
                        )}
                      </div>
                      
                      {message.isBot && message.complexityLevel && (
                        <Badge variant="outline" className="text-xs mb-2">
                          {message.complexityLevel} level
                        </Badge>
                      )}
                      
                      {message.isBot && message.estimatedEngagementTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>~{message.estimatedEngagementTime} min</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Follow-up suggestions */}
                  {message.isBot && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 mb-1">Quick follow-ups:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestedFollowUps.map((followUp, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleFollowUp(followUp)}
                          >
                            {followUp}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confidence boosters */}
                  {message.isBot && message.confidenceBoosters && message.confidenceBoosters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">Encouragement</span>
                      </div>
                      <p className="text-xs text-yellow-700">{message.confidenceBoosters[0]}</p>
                    </motion.div>
                  )}

                  {/* Learning opportunities */}
                  {message.isBot && message.learningOpportunities && message.learningOpportunities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-800">Learning</span>
                      </div>
                      <div className="space-y-1">
                        {message.learningOpportunities.map((opportunity, index) => (
                          <p key={index} className="text-xs text-green-700">• {opportunity}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
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
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="/cookitnext_logo.png" />
                <AvatarFallback>
                  <Brain className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">ChefGPT is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Proactive Suggestions */}
      {messages.length > 0 && conversationInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Smart Suggestions
            {showSuggestions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 space-y-2"
            >
              {[
                "What's for dinner tonight?",
                "Teach me a new cooking technique",
                "Help me plan a healthy meal",
                "What can I cook with these ingredients?",
                "Show me some beginner-friendly recipes"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => handleSuggestion(suggestion)}
                >
                  <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
                  {suggestion}
                </Button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
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
        </CardContent>
      </Card>
    </div>
  );
}
