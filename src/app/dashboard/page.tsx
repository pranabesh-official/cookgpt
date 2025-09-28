"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { generatePersonalizedRecipes, generatePersonalizedRecipesProgressive, Recipe, isGeminiAvailable } from "@/lib/gemini-service";
import { handleRecipeRequest, generateCompliantRecipe, createDietaryConflictFlow, clearConversationMemory } from "@/lib/conversation-service";
import { testFirebaseConnection, testSpecificCollections } from "@/lib/firebase-test";
import { processRecipeImageUrl } from "@/lib/storage-service";
import RecipeCard from "@/components/ui/recipe-card";
import RecipePanel from "@/components/ui/recipe-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  User,
  Settings,
  LogOut,
  ChefHat,
  Calendar,
  Clock,
  ChevronDown,
  Loader2,
  Shield,
  Sparkles,
  Send,
  MessageSquare,
  Plus,
  Menu,
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
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  recipes?: Recipe[];
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface SavedRecipe extends Recipe {
  savedAt: Date;
  chatId?: string;
  userId: string;
}

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => Promise<void>;
}

// Recipe Detail Modal Component
function RecipeModal({ recipe, isOpen, onClose, onSave }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] w-[95vw] overflow-hidden p-0 flex flex-col" showCloseButton={false}>
        <DialogTitle className="sr-only">{recipe.title}</DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header with Image */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-accent/20 via-accent/10 to-accent/20 flex-shrink-0">
            {recipe.imageUrl ? (
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Utensils className="w-16 h-16 text-accent/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-base sm:text-lg opacity-90 line-clamp-2">{recipe.description}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <div className="p-4 sm:p-6 space-y-6 pb-8">
              {/* Recipe Stats */}
              <div className="flex flex-wrap items-center gap-6 p-4 bg-accent/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.cookingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
                {recipe.calories && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-destructive" />
                    <span className="font-medium">{recipe.calories} calories</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Ingredients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Cooking Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 pb-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                  onClick={() => onSave(recipe)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Recipe
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Add share functionality here if needed
                    if (navigator.share) {
                      navigator.share({
                        title: recipe.title,
                        text: recipe.description,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(`Check out this recipe: ${recipe.title}`);
                      toast.success('Recipe link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Recipe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userPreferences, signOut, loading } = useAuth();
  const isMobile = useIsMobile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isRecipePanelOpen, setIsRecipePanelOpen] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'recipes'>('chats');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Redirect if not authenticated
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mounting
    if (hasRedirected.current) return;
    if (!loading && !user) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [user, loading, router, hasMounted]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mounting
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, hasMounted]);

  // Load specific chat conversation
  const loadChatConversation = async (chatId: string) => {
    if (!user || !db) return;
    
    try {
      const chatDoc = await getDoc(doc(db!, 'chats', chatId));
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const messages = chatData.messages.map((msg: {
          id: string;
          text: string;
          isBot: boolean;
          timestamp: any;
          recipes?: Recipe[];
        }) => ({
          id: msg.id,
          text: msg.text,
          isBot: msg.isBot,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp),
          recipes: msg.recipes || []
        }));
        
        setChatMessages(messages);
        setCurrentChatId(chatId);
        setIsSidebarOpen(false); // Close sidebar on mobile after loading
        
        console.log(`📖 Loaded conversation: ${chatData.title}`);
      }
    } catch (error) {
      console.error('Error loading chat conversation:', error);
      toast.error('Failed to load conversation', {
        description: 'Please try again.'
      });
    }
  };

  // Auto-save chat session after each message exchange
  const autoSaveChatSession = async (messages: ChatMessage[]) => {
    if (!user || !db || messages.length < 2) {
      console.log('❌ Cannot auto-save chat: insufficient data');
      return;
    }
    
    try {
      console.log('🔄 Auto-saving chat session for user:', user.uid);
      
      // Generate title from first user message (excluding welcome message)
      const firstUserMessage = messages.find(msg => !msg.isBot && !msg.id.includes('welcome'));
      const chatTitle = firstUserMessage 
        ? firstUserMessage.text.slice(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '') 
        : 'New Chat';
      
      const now = new Date();
      
      // Create clean chat data following the preferences pattern
      // Remove ALL image data and undefined values to avoid Firestore issues
      const cleanMessages = messages.map(msg => {
        const cleanRecipes = (msg.recipes || []).map(recipe => {
          // Create a clean recipe object, preserving Firebase Storage URLs but removing base64 data
          const cleanRecipe = {
            title: recipe.title || '',
            description: recipe.description || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
            cookingTime: recipe.cookingTime || '',
            servings: recipe.servings || 1,
            difficulty: recipe.difficulty || 'Medium',
            tags: recipe.tags || [],
            calories: recipe.calories || null,
            // Preserve Firebase Storage URLs, but remove base64 data to avoid size issues
            imageUrl: recipe.imageUrl && !recipe.imageUrl.startsWith('data:') ? recipe.imageUrl : ''
          };
          
          // Remove any undefined properties
          Object.keys(cleanRecipe).forEach(key => {
            if (cleanRecipe[key as keyof typeof cleanRecipe] === undefined) {
              delete cleanRecipe[key as keyof typeof cleanRecipe];
            }
          });
          
          return cleanRecipe;
        });
        
        return {
          id: msg.id || '',
          text: msg.text || '',
          isBot: Boolean(msg.isBot),
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp || Date.now()),
          recipes: cleanRecipes
        };
      });
      
      const chatData = {
        userId: user.uid,
        title: chatTitle,
        messages: cleanMessages,
        messageCount: messages.length,
        createdAt: now,
        updatedAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        lastActivity: now,
        status: 'active'
      };
      
      let chatId: string;
      
      if (currentChatId && messages.length > 2) {
        // Update existing chat
        console.log('🔄 Updating existing chat:', currentChatId);
        const chatRef = doc(db!, 'chats', currentChatId);
        await updateDoc(chatRef, {
          ...chatData,
          updatedAt: serverTimestamp(),
          lastActivity: now
        });
        chatId = currentChatId;
        console.log('💾 Updated existing chat session:', currentChatId);
      } else {
        // Create new chat - this will create the collection if it doesn't exist
        console.log('🔄 Creating new chat session');
        const docRef = await addDoc(collection(db!, 'chats'), chatData);
        chatId = docRef.id;
        setCurrentChatId(chatId);
        console.log('💾 Created new chat session with ID:', chatId);
      }
      
      // Reload chat history to show updated list
      await loadChatHistory();
      return chatId;
    } catch (error) {
      console.error('Error auto-saving chat session:', error);
      
      toast.error('Failed to save conversation', {
        description: 'Your conversation may not be saved. Please try starting a new chat.'
      });
      return null;
    }
  };

  // Load saved recipes from Firestore
  const loadSavedRecipes = async () => {
    if (!user) {
      console.log('❌ Cannot load saved recipes: user not available');
      setSavedRecipes([]);
      return;
    }

    if (!db) {
      console.log('❌ Cannot load saved recipes: database not initialized');
      // Retry after a delay
      setTimeout(loadSavedRecipes, 1000);
      return;
    }
    
    try {
      console.log('🔄 Loading saved recipes for user:', user.uid);
      
      // Use a simple query without complex indexes - similar to preferences pattern
      const savedRecipesQuery = query(
        collection(db!, 'savedRecipes'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(savedRecipesQuery);
      const recipes: SavedRecipe[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔍 Loading saved recipe:', data.title, 'Image URL:', data.imageUrl);
        recipes.push({
          ...data,
          id: doc.id,
          savedAt: data.savedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(data.savedAt) || new Date(),
          userId: data.userId,
        } as SavedRecipe);
      });
      
      // Sort locally by savedAt (newest first)
      recipes.sort((a, b) => {
        const dateA = a.savedAt instanceof Date ? a.savedAt : new Date(a.savedAt);
        const dateB = b.savedAt instanceof Date ? b.savedAt : new Date(b.savedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setSavedRecipes(recipes);
      console.log(`📚 Loaded ${recipes.length} saved recipes`);
      
      if (recipes.length === 0) {
        console.log('ℹ️ No saved recipes found for user. This is normal for new users.');
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      
      // Set empty array to avoid undefined state
      setSavedRecipes([]);
      
      // Only show error toast if it's not a permission/initialization issue
      if (error instanceof Error && !error.message.includes('Missing or insufficient permissions')) {
        toast.error('Failed to load saved recipes', {
          description: 'Your recipes may not be visible. Please try saving a recipe first.'
        });
      }
    }
  };

  // Delete a saved recipe
  const deleteSavedRecipe = async (recipeDocId: string) => {
    if (!user || !db) {
      console.log('❌ Cannot delete recipe: user or db not available');
      return;
    }
    
    try {
      console.log('🔄 Deleting saved recipe with doc ID:', recipeDocId);
      
      // Delete the document directly using its Firestore document ID
      await deleteDoc(doc(db!, 'savedRecipes', recipeDocId));
      
      // Update local state
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeDocId));
      
      console.log('✅ Recipe deleted successfully');
      toast.success('Recipe removed from saved recipes');
    } catch (error) {
      console.error('Error deleting saved recipe:', error);
      toast.error('Failed to remove recipe', {
        description: 'Please try again.'
      });
    }
  };

  // Load chat history from Firestore
  const loadChatHistory = async () => {
    if (!user) {
      console.log('❌ Cannot load chat history: user not available');
      setChatHistory([]);
      return;
    }

    if (!db) {
      console.log('❌ Cannot load chat history: database not initialized');
      // Retry after a delay
      setTimeout(loadChatHistory, 1000);
      return;
    }
    
    try {
      console.log('🔄 Loading chat history for user:', user.uid);
      
      // Use simple query without complex indexes - similar to preferences pattern
      const chatsQuery = query(
        collection(db!, 'chats'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      const history: ChatSession[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          title: data.title || 'Untitled Chat',
          timestamp: data.timestamp?.toDate?.() || data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
          messageCount: data.messageCount || data.messages?.length || 0
        });
      });
      
      // Sort locally by timestamp (newest first)
      history.sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      
      setChatHistory(history);
      console.log(`💬 Loaded ${history.length} chat sessions`);
      
      if (history.length === 0) {
        console.log('ℹ️ No chat history found for user. This is normal for new users.');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      
      // Set empty array to avoid undefined state
      setChatHistory([]);
      
      // Only show error toast if it's not a permission/initialization issue
      if (error instanceof Error && !error.message.includes('Missing or insufficient permissions')) {
        toast.error('Failed to load chat history', {
          description: 'Your conversations may not be visible. Please start a new chat.'
        });
      }
    }
  };

  // Save chat session to Firestore (legacy function - keeping for compatibility)
  const saveChatSession = async (messages: ChatMessage[], title: string) => {
    if (!user || !db || messages.length === 0) return null;
    
    try {
      const chatData = {
        userId: user.uid,
        title,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isBot: msg.isBot,
          timestamp: msg.timestamp,
          recipes: msg.recipes || []
        })),
        messageCount: messages.length,
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db!, 'chats'), chatData);
      console.log('Chat session saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat session:', error);
      return null;
    }
  };

  // Save individual recipes to Firestore with proper data handling
  const saveRecipesToFirestore = async (recipes: Recipe[], chatId: string) => {
    if (!user || !db || recipes.length === 0) return;
    
    try {
      console.log(`📤 Processing ${recipes.length} recipes for batch save with image uploads...`);
      
      // Process each recipe with image upload
      const processedRecipes = await Promise.all(
        recipes.map(async (recipe, index) => {
          console.log(`🔄 Processing recipe ${index + 1}/${recipes.length}: ${recipe.title}`);
          
          // Skip image processing if URL is already a Firebase Storage URL or HTTP URL
          let processedImageUrl = recipe.imageUrl;
          if (recipe.imageUrl && recipe.imageUrl.startsWith('data:')) {
            // Only process base64 images
            processedImageUrl = await processRecipeImageUrl(
              recipe.imageUrl,
              user.uid,
              recipe.title
            );
            console.log(`✅ Image processed for ${recipe.title}:`, processedImageUrl ? 'URL available' : 'No image');
          } else if (recipe.imageUrl) {
            console.log(`🔗 Using existing URL for ${recipe.title}: Already Firebase Storage or HTTP URL`);
          } else {
            console.log(`🚫 No image for ${recipe.title}`);
          }
          
          // Create clean recipe data
          const cleanRecipe = {
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
            cookingTime: recipe.cookingTime || '',
            servings: recipe.servings || 1,
            difficulty: recipe.difficulty || 'Medium',
            tags: recipe.tags || [],
            calories: recipe.calories || null,
            // Store the processed image URL (Firebase Storage URL or HTTP URL)
            imageUrl: processedImageUrl,
            
            // Recipe metadata
            userId: user.uid,
            chatId,
            createdAt: serverTimestamp(),
            savedAt: serverTimestamp(),
            saved: false,
            source: 'ai_generated'
          };
          
          // Remove any undefined properties
          Object.keys(cleanRecipe).forEach(key => {
            if (cleanRecipe[key as keyof typeof cleanRecipe] === undefined) {
              delete cleanRecipe[key as keyof typeof cleanRecipe];
            }
          });
          
          return cleanRecipe;
        })
      );
      
      // Save all processed recipes to Firestore
      const promises = processedRecipes.map(recipeData => 
        addDoc(collection(db!, 'recipes'), recipeData)
      );
      
      await Promise.all(promises);
      console.log(`💾 Saved ${recipes.length} recipes to Firestore successfully with images`);
    } catch (error) {
      console.error('Error saving recipes to Firestore:', error);
      toast.error('Failed to save recipes', {
        description: 'Recipes will still be visible in this conversation.'
      });
    }
  };

  // Initialize with welcome message and load chat history
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mounting
    if (user && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        text: `Hello! I'm ChefGPT, your warm and enthusiastic AI cooking companion! 👨‍🍳 I'm here to help you discover amazing recipes, learn cooking techniques, and make your culinary journey delightful. What would you like to cook today? ✨`,
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
    
    // Load chat history and saved recipes when user is authenticated
    if (user) {
      console.log('ℹ️ Initializing sidebar data for authenticated user:', user.uid);
      // Add a small delay to ensure Firebase is fully initialized
      const initializeData = async () => {
        try {
          await Promise.all([
            loadChatHistory(),
            loadSavedRecipes()
          ]);
        } catch (error) {
          console.error('Error initializing sidebar data:', error);
        }
      };
      
      // If db is available, load immediately, otherwise wait a bit
      if (db) {
        initializeData();
      } else {
        setTimeout(initializeData, 500);
      }
    } else {
      // Clear data when user is not authenticated
      setChatHistory([]);
      setSavedRecipes([]);
      setChatMessages([]);
    }
  }, [user, hasMounted]);

  // Additional effect to retry loading when db becomes available
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mounting
    if (user && db && (chatHistory.length === 0 || savedRecipes.length === 0)) {
      console.log('🔄 Database now available, retrying data load...');
      const retryLoad = async () => {
        try {
          if (chatHistory.length === 0) {
            await loadChatHistory();
          }
          if (savedRecipes.length === 0) {
            await loadSavedRecipes();
          }
        } catch (error) {
          console.error('Error in retry load:', error);
        }
      };
      retryLoad();
    }
  }, [user, db, chatHistory.length, savedRecipes.length, hasMounted]);

  // Manual refresh function for sidebar data
  const refreshSidebarData = async () => {
    if (!user) {
      toast.error('Please sign in to refresh data');
      return;
    }

    setIsLoadingData(true);
    try {
      console.log('🔄 Manual refresh of sidebar data...');
      await Promise.all([
        loadChatHistory(),
        loadSavedRecipes()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing sidebar data:', error);
      toast.error('Failed to refresh data', {
        description: 'Please check your connection and try again.'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isGeneratingResponse) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage.trim(),
      isBot: false,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsGeneratingResponse(true);
    
    try {
      // Check if user is asking for recipes
      const isRecipeRequest = (
        chatMessage.toLowerCase().includes('recipe') || 
        chatMessage.toLowerCase().includes('cook') || 
        chatMessage.toLowerCase().includes('meal') ||
        chatMessage.toLowerCase().includes('dish') ||
        chatMessage.toLowerCase().includes('food') ||
        chatMessage.toLowerCase().includes('make') ||
        chatMessage.toLowerCase().includes('prepare')
      );
      
      let botResponse: ChatMessage;
      
      if (isRecipeRequest && userPreferences?.onboardingCompleted && isGeminiAvailable()) {
        try {
          // Validate the request against user preferences
          const conversationContext = {
            userPreferences,
            chatHistory: chatMessages.map(msg => msg.text),
            currentTopic: 'recipe_generation'
          };
          
          const validationResponse = await handleRecipeRequest(chatMessage, conversationContext);
          
          if (!validationResponse.shouldGenerateRecipe) {
            // Handle dietary conflicts or other validation issues
            botResponse = {
              id: (Date.now() + 1).toString(),
              text: validationResponse.message,
              isBot: true,
              timestamp: new Date(),
              recipes: []
            };
            
            setChatMessages(prev => [...prev, botResponse]);
            
            // Auto-save conversation
            const finalMessages = [...chatMessages, userMessage, botResponse];
            await autoSaveChatSession(finalMessages);
            return;
          }
          
          // Show thinking/processing message
          const thinkingResponse = {
            id: (Date.now() + 1).toString(),
            text: `I'm analyzing your preferences and generating 3 personalized recipes with AI-generated images. This might take a moment while I create the perfect recipes for you...`,
            isBot: true,
            timestamp: new Date(),
            recipes: []
          };
          
          setChatMessages(prev => [...prev, thinkingResponse]);
          
          console.log('🧠 Starting background recipe generation with all AI processing...');
          
          // Generate ALL recipes with images in the background
          const allRecipes: Recipe[] = [];
          
          // Collect all recipes first
          for await (const recipe of generatePersonalizedRecipesProgressive(userPreferences, 3)) {
            console.log(`🔄 [BACKGROUND] Processing recipe: ${recipe.title}`);
            allRecipes.push(recipe);
            
            // Update thinking message to show progress without revealing recipes
            setChatMessages(prev => prev.map(msg => 
              msg.id === thinkingResponse.id 
                ? {
                    ...msg,
                    text: `I'm creating amazing recipes for you... Generated ${allRecipes.length} of 3 recipes with custom AI images. Almost ready!`
                  }
                : msg
            ));
          }
          
          // After ALL recipes are generated with images, show them all at once
          if (allRecipes.length > 0) {
            console.log(`✨ [COMPLETE] All ${allRecipes.length} recipes ready! Displaying now...`);
            
            // Final reveal - show all recipes at once
            botResponse = {
              id: thinkingResponse.id,
              text: `Perfect! I've generated ${allRecipes.length} personalized recipes with custom AI-generated images based on your preferences. Here are your delicious options:`,
              isBot: true,
              timestamp: new Date(),
              recipes: allRecipes
            };
            
            setChatMessages(prev => prev.map(msg => 
              msg.id === thinkingResponse.id ? botResponse : msg
            ));
            
            // First, process and upload images to Firebase Storage
            if (allRecipes.length > 0) {
              console.log(`🔄 Processing ${allRecipes.length} recipe images before saving conversation...`);
              
              // Process all recipe images and replace base64 with Firebase Storage URLs
              const processedRecipes = await Promise.all(
                allRecipes.map(async (recipe) => {
                  if (recipe.imageUrl && recipe.imageUrl.startsWith('data:') && user) {
                    const firebaseUrl = await processRecipeImageUrl(
                      recipe.imageUrl,
                      user.uid,
                      recipe.title
                    );
                    return { ...recipe, imageUrl: firebaseUrl };
                  }
                  return recipe;
                })
              );
              
              // Update the bot response with processed images
              botResponse = {
                ...botResponse,
                recipes: processedRecipes
              };
              
              // Update the UI with Firebase Storage URLs
              setChatMessages(prev => prev.map(msg => 
                msg.id === thinkingResponse.id ? botResponse : msg
              ));
              
              console.log(`✅ Processed ${processedRecipes.length} recipe images with Firebase Storage URLs`);
            }
            
            // Now auto-save the conversation with Firebase Storage URLs
            const finalMessages = [...chatMessages, userMessage, botResponse];
            const chatId = await autoSaveChatSession(finalMessages);
            
            // Save all recipes to Firestore (now with Firebase Storage URLs)
            if (chatId && allRecipes.length > 0) {
              await saveRecipesToFirestore(botResponse.recipes || allRecipes, chatId);
              console.log(`💾 Saved ${allRecipes.length} recipes with Firebase Storage URLs to Firestore`);
            }
          } else {
            // Fallback if no recipes generated
            setChatMessages(prev => prev.map(msg => 
              msg.id === thinkingResponse.id 
                ? {
                    ...msg,
                    text: "I'd love to help you with recipes! Could you tell me more about what type of cuisine or specific dish you're interested in?",
                    recipes: []
                  }
                : msg
            ));
          }
          
        } catch (error) {
          console.error('Error generating background recipes:', error);
          const errorResponse = {
            id: (Date.now() + 1).toString(),
            text: "I'm having trouble generating recipes right now. Let me help you with cooking tips instead! What would you like to know?",
            isBot: true,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, errorResponse]);
        }
      } else if (isRecipeRequest && !userPreferences?.onboardingCompleted) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "I'd be happy to help you with personalized recipes! To give you the best recommendations, please complete your profile setup first by visiting your preferences.",
          isBot: true,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
      } else {
        // General cooking assistant response
        const responses = [
          "That's an interesting question! I'm here to help with all your cooking needs. Would you like me to suggest some recipes?",
          "I'd be happy to help! Could you be more specific about what cooking topic you'd like assistance with?",
          "Great question! I can help with recipes, cooking techniques, meal planning, and ingredient substitutions. What interests you most?",
          "I'm your cooking companion! Whether you need recipes, cooking tips, or meal ideas, I'm here to help. What would you like to explore?"
        ];
        
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          isBot: true,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, botResponse]);
        
        // Auto-save conversation for all message types
        const finalMessages = [...chatMessages, userMessage, botResponse];
        await autoSaveChatSession(finalMessages);
      }
      
    } catch (error) {
      console.error('Error handling message:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again in a moment!",
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleNewChat = async () => {
    // Auto-save current chat if it has messages (excluding welcome message)
    if (chatMessages.length > 1) {
      await autoSaveChatSession(chatMessages);
    }
    
    // Clear LangChain conversation memory for fresh start
    await clearConversationMemory();
    
    // Reset to new chat state
    setCurrentChatId(null);
    setChatMessages([]);
    setIsSidebarOpen(false);
    
    // Add welcome message for new chat
    const welcomeMessage: ChatMessage = {
      id: "welcome-" + Date.now(),
      text: `Hello! I'm ChefGPT, your warm and enthusiastic AI cooking companion! 👨‍🍳 I'm here to help you discover amazing recipes, learn cooking techniques, and make your culinary journey delightful. What would you like to cook today? ✨`,
      isBot: true,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Use modal for mobile/tablet (including undefined state), panel for desktop
    if (isMobile || typeof isMobile === 'undefined') {
      setIsRecipeModalOpen(true);
      setIsRecipePanelOpen(false);
    } else {
      setIsRecipePanelOpen(true);
      setIsRecipeModalOpen(false);
    }
  };

  // Handle view recipe from sidebar (follows same flow as recipe cards)
  const handleViewRecipeFromSidebar = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Use panel for desktop (large screens), modal for mobile/tablet (small screens)
    if (isMobile || typeof isMobile === 'undefined') {
      setIsRecipeModalOpen(true);
      setIsRecipePanelOpen(false);
    } else {
      setIsRecipePanelOpen(true);
      setIsRecipeModalOpen(false);
    }
  };

  const handleCloseRecipePanel = () => {
    setIsRecipePanelOpen(false);
    setSelectedRecipe(null);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user || !db) {
      console.log('❌ Cannot save recipe: user or db not available');
      toast.error('Please sign in to save recipes');
      return;
    }
    
    try {
      console.log('🔄 Saving recipe:', recipe.title, 'for user:', user.uid);
      
      // Check if recipe is already saved using title and userId
      const existingQuery = query(
        collection(db!, 'savedRecipes'),
        where('userId', '==', user.uid),
        where('title', '==', recipe.title)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        toast.info('Recipe already saved!', {
          description: 'This recipe is already in your saved collection.'
        });
        return;
      }
      
      const now = new Date();
      
      // Process image URL - upload to Firebase Storage if it's a base64 data URL
      console.log('🖼️ Processing recipe image...');
      const processedImageUrl = await processRecipeImageUrl(
        recipe.imageUrl,
        user.uid,
        recipe.title
      );
      
      console.log('✅ Image processed successfully:', processedImageUrl ? 'URL available' : 'No image');
      
      // Create a clean recipe object following the SavedRecipe interface
      const savedRecipeData = {
        // Core recipe data
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        cookingTime: recipe.cookingTime || '',
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty || 'Medium',
        tags: recipe.tags || [],
        calories: recipe.calories || null,
        // Store the processed image URL (Firebase Storage URL or HTTP URL)
        imageUrl: processedImageUrl,
        
        // Saved recipe specific data
        userId: user.uid,
        savedAt: serverTimestamp(),
        createdAt: now,
        updatedAt: serverTimestamp(),
        
        // Optional metadata
        chatId: currentChatId || null,
        source: 'ai_generated'
      };
      
      // Save recipe to Firestore - this will create the collection if it doesn't exist
      const docRef = await addDoc(collection(db!, 'savedRecipes'), savedRecipeData);
      
      console.log('✅ Recipe saved successfully with ID:', docRef.id, 'Title:', recipe.title);
      
      // Refresh saved recipes list to show the new recipe
      await loadSavedRecipes();
      
      toast.success('Recipe Saved!', {
        description: `${recipe.title} has been saved to your collection.`
      });
      
      // Close the modal or panel if open
      setIsRecipeModalOpen(false);
      setIsRecipePanelOpen(false);
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      
      toast.error('Failed to save recipe', {
        description: 'Please check your connection and try again.'
      });
    }
  };

  const handleShareRecipe = (recipe: Recipe) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Check out this recipe: ${recipe.title} - ${recipe.description}`);
      toast.success('Recipe link copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const runFirebaseTest = async () => {
    console.log('🧪 Running Firebase diagnostics...');
    toast.info('Running Firebase tests...', {
      description: 'Check the console for detailed results.'
    });
    
    const connectionTest = await testFirebaseConnection();
    if (connectionTest) {
      await testSpecificCollections();
      toast.success('Firebase tests completed', {
        description: 'Check console for detailed results.'
      });
    } else {
      toast.error('Firebase connection issues detected', {
        description: 'Check console for error details.'
      });
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Loading state - only show after client-side mounting to prevent hydration mismatch
  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"
          />
          <p className="text-muted-foreground font-medium">Loading your kitchen...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
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
              <Link href="/explore-recipes" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
              <Link href="/preferences" className="text-muted-foreground hover:text-foreground transition-colors">Preferences</Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent/50 rounded-lg p-2">
                  <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSidebarTab('recipes')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Saved Recipes
                </DropdownMenuItem>
                <Link href="/preferences">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>


      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Chat History & Saved Recipes */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:relative inset-y-0 left-0 z-40 
          w-80 sm:w-72 md:w-80 lg:w-72 xl:w-80 2xl:w-96
          bg-background/95 backdrop-blur-sm border-r border-border/50 
          flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none 
          shadow-lg lg:shadow-sm flex flex-col overflow-hidden`}>
          
          {/* Mobile/Tablet Header */}
          <div className="lg:hidden flex justify-between items-center p-3 sm:p-4 border-b border-border/30 flex-shrink-0 bg-background/90">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Recipe Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="hover:bg-accent/50 rounded-lg h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content Area */}
          <div className="relative flex-1 overflow-hidden">
            {/* Top gradient for visual depth */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background/95 to-transparent pointer-events-none z-20" />
            
            <ScrollArea 
              className="h-full w-full" 
              type="always"
              scrollHideDelay={600}
            >
              <div className="p-3 sm:p-4 lg:p-4 space-y-4">
                {/* New Chat Button */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleNewChat}
                    className="w-full justify-center bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 rounded-lg h-10 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Recipe Chat
                  </Button>
                  <Button 
                    onClick={refreshSidebarData}
                    disabled={isLoadingData}
                    variant="outline"
                    size="sm"
                    className="w-full text-sm h-8 border-border/50 hover:bg-accent/50 transition-all duration-200 rounded-lg"
                  >
                    {isLoadingData ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FolderOpen className="w-4 h-4 mr-2" />
                    )}
                    Refresh Data
                  </Button>
                </div>

                {/* Tab Navigation */}
                <div className="space-y-3">
                  <div className="flex bg-accent/30 rounded-lg p-1">
                    <Button
                      variant={sidebarTab === 'chats' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSidebarTab('chats')}
                      className={`flex-1 text-xs font-medium transition-all ${
                        sidebarTab === 'chats' 
                          ? 'bg-primary/15 text-primary shadow-sm border border-primary/30' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Chats {chatHistory.length > 0 && `(${chatHistory.length})`}
                    </Button>
                    <Button
                      variant={sidebarTab === 'recipes' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSidebarTab('recipes')}
                      className={`flex-1 text-xs font-medium transition-all ${
                        sidebarTab === 'recipes' 
                          ? 'bg-primary/15 text-primary shadow-sm border border-primary/30' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <BookOpen className="w-3 h-3 mr-1.5" />
                      Saved {savedRecipes.length > 0 && `(${savedRecipes.length})`}
                    </Button>
                  </div>
                </div>

                {/* Content Area */}
                {sidebarTab === 'chats' ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:mb-3">
                      Recent Conversations
                    </h3>
                    {chatHistory.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-6 lg:py-8 xl:py-12 space-y-2">
                        <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 xl:w-12 xl:h-12 mx-auto text-muted-foreground/50" />
                        <p className="font-medium text-xs lg:text-sm xl:text-base">No conversations yet</p>
                        <p className="text-xs">Start chatting to see your history</p>
                      </div>
                    ) : (
                      chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className="group relative p-2.5 lg:p-3 rounded-lg lg:rounded-xl bg-card hover:bg-accent/30 cursor-pointer border border-border/20 hover:border-primary/40 transition-all duration-200 hover:shadow-sm hover:scale-[1.01]"
                          onClick={() => loadChatConversation(chat.id)}
                        >
                          {/* Compact Layout */}
                          <div className="flex items-start gap-2.5 lg:gap-3">
                            {/* Small Chat Icon */}
                            <div className="flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 bg-primary/10 rounded-md lg:rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/30 group-hover:bg-primary/15 transition-all duration-200">
                              <MessageSquare className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-primary" />
                            </div>
                            
                            {/* Compact Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              {/* Title - Compact with better line clamping */}
                              <div className="relative">
                                <h4 className="text-xs lg:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {chat.title}
                                </h4>
                                {/* Compact hover tooltip for very long titles */}
                                {chat.title.length > 50 && (
                                  <div className="absolute top-full left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                                    <div className="text-xs text-muted-foreground bg-popover border border-border rounded-md px-2 py-1 shadow-md text-wrap break-words">
                                      {chat.title}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Compact Metadata Row */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {chat.timestamp.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric'
                                    })}
                                  </span>
                                  <span className="w-0.5 h-0.5 bg-muted-foreground/40 rounded-full"></span>
                                  <span>{chat.timestamp.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                                
                                {/* Compact Message Badge */}
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs h-4 px-1.5 bg-primary/10 text-primary border-0 font-medium"
                                >
                                  {chat.messageCount}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle hover indicator */}
                          <div className="absolute inset-0 rounded-lg lg:rounded-xl border border-transparent group-hover:border-primary/20 pointer-events-none transition-all duration-200"></div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 lg:space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:mb-3">
                      Saved Recipes ({savedRecipes.length})
                    </h3>
                    {savedRecipes.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-6 lg:py-8 xl:py-12 space-y-2">
                        <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 xl:w-12 xl:h-12 mx-auto text-muted-foreground/50" />
                        <p className="font-medium text-xs lg:text-sm xl:text-base">No saved recipes yet</p>
                        <p className="text-xs">Save recipes from chats to see them here</p>
                      </div>
                    ) : (
                      savedRecipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className="p-2 lg:p-3 xl:p-2.5 rounded-lg lg:rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200 group space-y-1.5 lg:space-y-2"
                        >
                          <div className="flex items-start gap-2 lg:gap-2.5 xl:gap-2">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-9 xl:h-9 bg-gradient-to-br from-accent to-accent/80 rounded-md lg:rounded-lg flex items-center justify-center flex-shrink-0">
                              {recipe.imageUrl && recipe.imageUrl.trim() !== '' ? (
                                <img 
                                  src={recipe.imageUrl} 
                                  alt={recipe.title}
                                  className="w-full h-full object-cover rounded-md lg:rounded-lg"
                                  onError={(e) => {
                                    console.log('Image failed to load:', recipe.imageUrl);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-3 h-3 lg:w-4 lg:h-4 xl:w-3.5 xl:h-3.5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17l-1.5-1.5M9 9l1.5 1.5M15 15l-1.5-1.5M4.5 4.5L7 7"></path></svg>';
                                  }}
                                />
                              ) : (
                                <Utensils className="w-3 h-3 lg:w-4 lg:h-4 xl:w-3.5 xl:h-3.5 text-accent-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs lg:text-sm xl:text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {recipe.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 lg:line-clamp-2 xl:line-clamp-1 mt-0.5">
                                {recipe.description}
                              </p>
                              <div className="flex items-center gap-1 lg:gap-1.5 mt-1">
                                <Clock className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{recipe.cookingTime}</span>
                                <Star className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-primary" />
                                <span className="text-xs text-muted-foreground">{recipe.difficulty}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-6 lg:h-7 xl:h-6"
                              onClick={() => handleViewRecipeFromSidebar(recipe)}
                            >
                              <Eye className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 lg:h-7 xl:h-6 px-1.5 lg:px-2 xl:px-1.5 text-destructive hover:text-destructive"
                              onClick={() => deleteSavedRecipe(recipe.id)}
                            >
                              <Trash2 className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Saved {recipe.savedAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Bottom padding for proper scroll */}
                <div className="h-6"></div>
              </div>
            </ScrollArea>
            
            {/* Scroll indicator at bottom for mobile */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none flex items-end justify-center pb-2">
              <motion.div 
                className="flex items-center gap-1 text-xs text-muted-foreground/70"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                <div className="w-1 h-1 rounded-full bg-primary/60"></div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${
          !isMobile && isRecipePanelOpen ? 'mr-[480px] xl:mr-[520px] 2xl:mr-[580px]' : ''
        }`}>
          {/* Mobile/Tablet Header */}
          <div className="lg:hidden p-3 sm:p-4 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
                  <ChefHat className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Recipe Assistant</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsSidebarOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Menu
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block p-4 lg:p-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Recipe Assistant
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    AI-powered cooking companion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleNewChat} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Link href="/explore-recipes">
                  <Button variant="ghost" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore
                  </Button>
                </Link>
                <Link href="/preferences">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Chat Messages Section */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" type="always">
              <div className="p-4 md:p-6 pb-6">
                <div className="max-w-4xl mx-auto space-y-4">
                <AnimatePresence>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        <Avatar className="w-6 h-6 flex-shrink-0 ring-1 ring-border/20">
                          {message.isBot ? (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground text-xs">
                              <ChefHat className="w-3 h-3" />
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={user?.photoURL || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-muted-foreground font-medium text-xs">
                                {getUserInitials()}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>

                        <div className={`flex flex-col ${message.isBot ? 'items-start' : 'items-end'} space-y-1`}>
                          <div className={`relative rounded-2xl px-3 py-2 max-w-full shadow-sm ${
                            message.isBot 
                              ? 'bg-muted/80 text-foreground border border-border/40' 
                              : 'bg-gradient-to-br from-primary to-primary/95 text-primary-foreground'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                          </div>

                          {/* Recipe Cards - Responsive Layout */}
                          {message.recipes && message.recipes.length > 0 && (
                            <div className="w-full mt-2">
                              <div className={`grid gap-2 lg:gap-3 ${
                                !isMobile && isRecipePanelOpen 
                                  ? 'grid-cols-1 sm:grid-cols-2' 
                                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                              }`}>
                                {message.recipes.map((recipe, index) => (
                                  <motion.div
                                    key={recipe.id || `${recipe.title || 'recipe'}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.2 }}
                                  >
                                    <RecipeCard
                                      recipe={recipe}
                                      onViewDetails={handleViewRecipe}
                                      onSave={handleSaveRecipe}
                                      onShare={handleShareRecipe}
                                      index={index}
                                      className="h-full"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground/60 px-1 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isGeneratingResponse && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <Avatar className="w-6 h-6 ring-1 ring-border/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground text-xs">
                          <ChefHat className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/80 text-foreground border border-border/40 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Message Input - Sticky Footer */}
          <div className="flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="p-3 sm:p-4">
              <div className="max-w-4xl mx-auto space-y-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-background/70 backdrop-blur-xl border-2 border-border/50 rounded-xl focus-within:border-primary/50 focus-within:bg-background transition-all duration-200 shadow-sm hover:shadow-md">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => {
                      setChatMessage(e.target.value);
                      // Auto-resize textarea
                      const textarea = e.target as HTMLTextAreaElement;
                      textarea.style.height = 'auto';
                      const newHeight = Math.min(textarea.scrollHeight, 80); // Max height of ~2-3 lines
                      textarea.style.height = `${newHeight}px`;
                    }}
                    placeholder="Ask me about recipes, cooking tips, meal planning, or anything culinary..."
                    className="w-full min-h-[40px] max-h-[80px] p-3 pr-10 bg-transparent border-0 rounded-xl resize-none focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground/60 leading-relaxed scrollbar-hide"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && chatMessage.trim() && !isGeneratingResponse) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isGeneratingResponse}
                    rows={1}
                    style={{ height: '40px' }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    {chatMessage.trim() && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-xs text-muted-foreground bg-accent/30 px-2 py-1 rounded-md hidden sm:block"
                      >
                        {chatMessage.length}/1000
                      </motion.div>
                    )}
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg disabled:cursor-not-allowed"
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isGeneratingResponse || chatMessage.length > 1000}
                    >
                      {isGeneratingResponse ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Floating helper text */}
                <div className="absolute -bottom-5 left-3 text-xs text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
              
              <div className="flex items-center justify-center flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-background/50 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 rounded-lg px-2 py-1 backdrop-blur-sm flex-shrink-0 h-6" 
                  onClick={() => setChatMessage('Show me a quick dinner recipe')}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Quick Dinner
                </Button>
                <Link href="/meal-planning">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-background/50 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 rounded-lg px-2 py-1 backdrop-blur-sm flex-shrink-0 h-6" 
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Meal Planning
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-background/50 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 rounded-lg px-2 py-1 backdrop-blur-sm flex-shrink-0 h-6" 
                  onClick={() => setChatMessage('What can I cook with chicken?')}
                >
                  <PenTool className="w-3 h-3 mr-1" />
                  Ingredients
                </Button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recipe Detail Modal - Mobile/Tablet only */}
      {(isMobile || typeof isMobile === 'undefined') && (
        <RecipeModal 
          recipe={selectedRecipe}
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          onSave={handleSaveRecipe}
        />
      )}
      
      {/* Recipe Detail Panel - Desktop only */}
      {!isMobile && typeof isMobile !== 'undefined' && (
        <RecipePanel 
          recipe={selectedRecipe}
          isOpen={isRecipePanelOpen}
          onClose={handleCloseRecipePanel}
          onSave={handleSaveRecipe}
          onShare={handleShareRecipe}
        />
      )}
      
    </div>
  );
}