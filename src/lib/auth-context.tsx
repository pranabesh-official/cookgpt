"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { toast } from 'sonner';

interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  mealTypeFocus: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  cookingTime: '15min' | '30min' | '1hr+';
  goals: string[];
  onboardingCompleted: boolean;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  userPreferences: UserPreferences | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<any>;
  refreshUserPreferences: () => Promise<void>;
  testAuthenticate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(typeof window === 'undefined' ? false : true);
  const [hasMounted, setHasMounted] = useState(false);

  // Fetch user preferences from Firestore
  const fetchUserPreferences = async (userId: string) => {
    if (!db) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  };

  // Create default user preferences
  const createDefaultPreferences = async (userId: string, userData: Partial<UserPreferences>) => {
    if (!db) return;

    const defaultPreferences: UserPreferences = {
      dietaryRestrictions: [],
      cuisinePreferences: [],
      mealTypeFocus: [],
      skillLevel: 'beginner',
      cookingTime: '30min',
      goals: [],
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...userData
    };

    try {
      await setDoc(doc(db, 'users', userId), defaultPreferences);
      setUserPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error creating user preferences:', error);
    }
  };

  // Handle client-side mounting
  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      setLoading(true);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!hasMounted || !auth) {
      // Wait until mounted and auth is available; keep loading true
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        if (user) {
          // Fetch or create user preferences
          const preferences = await fetchUserPreferences(user.uid);
          if (preferences) {
            setUserPreferences(preferences);
          } else {
            // Create default preferences for new user - this also sets userPreferences
            await createDefaultPreferences(user.uid, {});
          }
        } else {
          setUserPreferences(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        // Only set loading to false after both user and preferences are fully processed
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hasMounted]);

  // Email sign in
  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not initialized');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!', {
        description: 'You have successfully signed in.',
      });
      return result;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : 'Failed to sign in';
      toast.error('Sign In Failed', {
        description: errorMessage,
      });
      throw error;
    }
  };

  // Email sign up
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Auth not initialized');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        
        // Create user preferences with name
        await createDefaultPreferences(result.user.uid, {
          onboardingCompleted: false
        });
      }
      
      toast.success('Account Created!', {
        description: 'Welcome to CookGPT! Let\'s personalize your experience.',
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? 'An account with this email already exists' 
        : 'Failed to create account';
      toast.error('Sign Up Failed', {
        description: errorMessage,
      });
      throw error;
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Auth not initialized');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // The onAuthStateChanged listener will handle user preferences automatically
      toast.success('Welcome!', {
        description: 'You have successfully signed in with Google.',
      });
      
      return result;
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        toast.error('Google Sign In Failed', {
          description: 'Please try again.',
        });
      }
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) throw new Error('Auth not initialized');
    
    try {
      await firebaseSignOut(auth);
      setUserPreferences(null);
      toast.success('Signed Out', {
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast.error('Sign Out Failed', {
        description: 'Please try again.',
      });
      throw error;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!auth?.currentUser || !db) throw new Error('User not authenticated');
    
    try {
      const updatedPreferences = {
        ...preferences,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedPreferences, { merge: true });
      
      // Update local state
      setUserPreferences(prev => prev ? { ...prev, ...updatedPreferences } : null);
      
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      toast.error('Failed to save preferences', {
        description: 'Please try again.',
      });
      throw error;
    }
  };

  // Refresh user preferences
  const refreshUserPreferences = async () => {
    if (!auth?.currentUser) return;
    
    const preferences = await fetchUserPreferences(auth.currentUser.uid);
    setUserPreferences(preferences);
  };

  const testAuthenticate = () => {
    console.log('testAuthenticate called');
    setUser({ uid: 'test-uid' } as User);
    setUserPreferences({
      dietaryRestrictions: ['vegan'],
      cuisinePreferences: ['italian', 'asian'],
      mealTypeFocus: ['dinner', 'lunch'],
      skillLevel: 'beginner',
      cookingTime: '30min',
      goals: ['healthy-eating'],
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    userPreferences,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateUserPreferences,
    refreshUserPreferences,
    testAuthenticate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}