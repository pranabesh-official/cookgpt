#!/usr/bin/env node

/**
 * Add Test Recipes to Firestore
 * Simple script to add a few test recipes for the explore page
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbcGqVSJSQwwNhXPrnrSsLYYg7mPn8HhY",
  authDomain: "mixit-mixology-guide.firebaseapp.com",
  projectId: "mixit-mixology-guide",
  storageBucket: "mixit-mixology-guide.firebasestorage.app",
  messagingSenderId: "166936536444",
  appId: "1:166936536444:web:370abe6eda796c299cf0f9",
  measurementId: "G-D4PPGRYZWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple test recipes
const testRecipes = [
  {
    title: "Simple Pasta",
    description: "A quick and easy pasta dish perfect for busy weeknights.",
    cookingTime: "20 minutes",
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      "200g spaghetti",
      "2 tbsp olive oil",
      "2 cloves garlic, minced",
      "1/4 cup parmesan cheese",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Boil pasta according to package instructions",
      "Heat olive oil in a pan and sauté garlic",
      "Drain pasta and toss with garlic oil",
      "Top with parmesan cheese and serve"
    ],
    tags: ["italian", "pasta", "quick", "easy", "dinner"],
    calories: 400,
    userId: "test-user",
    createdAt: serverTimestamp()
  },
  {
    title: "Quick Salad",
    description: "Fresh and healthy salad with mixed greens and vegetables.",
    cookingTime: "10 minutes",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "2 cups mixed greens",
      "1/2 cucumber, sliced",
      "1/4 cup cherry tomatoes",
      "2 tbsp olive oil",
      "1 tbsp balsamic vinegar"
    ],
    instructions: [
      "Wash and prepare all vegetables",
      "Combine in a bowl",
      "Drizzle with olive oil and balsamic",
      "Toss gently and serve immediately"
    ],
    tags: ["healthy", "vegetarian", "salad", "quick", "lunch"],
    calories: 150,
    userId: "test-user",
    createdAt: serverTimestamp()
  }
];

async function addTestRecipes() {
  try {
    console.log('🚀 Adding test recipes to Firestore...');
    
    const recipesCollection = collection(db, 'recipes');
    
    for (const recipe of testRecipes) {
      const docRef = await addDoc(recipesCollection, recipe);
      console.log(`✅ Added recipe: ${recipe.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully added test recipes!');
    console.log('🌐 You can now view these recipes in your explore-recipes page!');
    
  } catch (error) {
    console.error('❌ Error adding test recipes:', error);
    console.error('Error details:', error.message);
  }
}

// Run the script
addTestRecipes();
