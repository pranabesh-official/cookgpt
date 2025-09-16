#!/usr/bin/env node

/**
 * Add Sample Recipes to Firestore
 * This script adds sample recipes to the Firestore database for testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - update with your actual config
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

// Sample recipes data
const sampleRecipes = [
  {
    title: "Spaghetti Carbonara",
    description: "Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper. A creamy, rich sauce coats perfectly cooked spaghetti.",
    cookingTime: "30min",
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale",
      "4 large eggs",
      "100g Pecorino Romano cheese",
      "100g Parmigiano Reggiano",
      "Black pepper",
      "Salt"
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions",
      "While pasta cooks, cut pancetta into small cubes and cook in a large skillet until crispy",
      "In a bowl, whisk together eggs, grated cheeses, and black pepper",
      "Drain pasta, reserving 1 cup of pasta water",
      "Add hot pasta to the skillet with pancetta, remove from heat",
      "Quickly stir in egg mixture, adding pasta water as needed for creaminess",
      "Serve immediately with extra cheese and black pepper"
    ],
    tags: ["italian", "pasta", "dinner", "quick", "creamy", "traditional"],
    calories: 650,
    cuisine: "italian",
    mealType: "dinner",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Chicken Tikka Masala",
    description: "Tender chicken pieces in a rich, creamy tomato-based curry sauce. A British-Indian classic that's both comforting and flavorful.",
    cookingTime: "1hr+",
    servings: 6,
    difficulty: "Medium",
    ingredients: [
      "1kg chicken breast, cubed",
      "2 cups yogurt",
      "2 tbsp tikka masala paste",
      "2 onions, finely chopped",
      "4 cloves garlic, minced",
      "2 inch ginger, grated",
      "400ml coconut milk",
      "400g canned tomatoes",
      "Fresh cilantro",
      "Basmati rice"
    ],
    instructions: [
      "Marinate chicken in yogurt and tikka masala paste for at least 2 hours",
      "Heat oil in a large pan and cook marinated chicken until browned",
      "Remove chicken and set aside",
      "In the same pan, sauté onions until golden, add garlic and ginger",
      "Add tomatoes and cook until thickened",
      "Return chicken to pan, add coconut milk and simmer for 20 minutes",
      "Garnish with cilantro and serve with basmati rice"
    ],
    tags: ["indian", "curry", "chicken", "dinner", "spicy", "creamy"],
    calories: 450,
    cuisine: "indian",
    mealType: "dinner",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Avocado Toast with Poached Eggs",
    description: "A healthy and delicious breakfast featuring creamy avocado, perfectly poached eggs, and crusty sourdough bread.",
    cookingTime: "15min",
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      "4 slices sourdough bread",
      "2 ripe avocados",
      "4 large eggs",
      "1 lemon",
      "Red pepper flakes",
      "Sea salt",
      "Black pepper",
      "Fresh herbs (optional)"
    ],
    instructions: [
      "Toast the sourdough bread until golden and crispy",
      "Mash avocados in a bowl, add lemon juice, salt, and pepper",
      "Bring a pot of water to simmer, add vinegar",
      "Crack eggs into small cups and gently slide into simmering water",
      "Poach eggs for 3-4 minutes until whites are set",
      "Spread mashed avocado on toast",
      "Top with poached eggs, season with salt, pepper, and red pepper flakes"
    ],
    tags: ["breakfast", "healthy", "vegetarian", "quick", "avocado", "eggs"],
    calories: 320,
    cuisine: "american",
    mealType: "breakfast",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Thai Green Curry",
    description: "A fragrant and spicy Thai curry with vegetables and your choice of protein. The perfect balance of heat, sweetness, and umami flavors.",
    cookingTime: "30min",
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      "400ml coconut milk",
      "2 tbsp green curry paste",
      "500g mixed vegetables",
      "400g tofu or chicken",
      "2 tbsp fish sauce",
      "1 tbsp palm sugar",
      "Thai basil leaves",
      "Jasmine rice"
    ],
    instructions: [
      "Heat coconut milk in a large wok until it starts to separate",
      "Add green curry paste and fry for 2-3 minutes until fragrant",
      "Add protein and cook until nearly done",
      "Add vegetables and cook for 5-7 minutes",
      "Season with fish sauce and palm sugar",
      "Garnish with Thai basil and serve with jasmine rice"
    ],
    tags: ["thai", "curry", "spicy", "vegetarian", "dinner", "coconut"],
    calories: 380,
    cuisine: "thai",
    mealType: "dinner",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Chocolate Chip Cookies",
    description: "Classic homemade chocolate chip cookies with crispy edges and chewy centers. Perfect for dessert or a sweet snack.",
    cookingTime: "30min",
    servings: 24,
    difficulty: "Easy",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C) and line baking sheets with parchment",
      "Whisk together flour, baking soda, and salt in a bowl",
      "Cream butter and sugars until light and fluffy",
      "Beat in eggs and vanilla extract",
      "Gradually mix in dry ingredients",
      "Stir in chocolate chips",
      "Drop rounded tablespoons onto baking sheets",
      "Bake for 9-11 minutes until golden brown"
    ],
    tags: ["dessert", "baking", "chocolate", "cookies", "sweet", "snack"],
    calories: 150,
    cuisine: "american",
    mealType: "desserts",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Mediterranean Quinoa Bowl",
    description: "A healthy and colorful bowl featuring quinoa, fresh vegetables, olives, and feta cheese. Perfect for lunch or a light dinner.",
    cookingTime: "30min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      "1 cup quinoa",
      "2 cups vegetable broth",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/2 cup kalamata olives, pitted",
      "1/2 cup feta cheese, crumbled",
      "1/4 cup red onion, finely chopped",
      "2 tbsp olive oil",
      "1 lemon, juiced",
      "Fresh herbs (oregano, parsley)"
    ],
    instructions: [
      "Rinse quinoa thoroughly and cook in vegetable broth according to package directions",
      "Let quinoa cool to room temperature",
      "In a large bowl, combine cooked quinoa with all vegetables",
      "Add olives, feta cheese, and red onion",
      "Whisk together olive oil, lemon juice, and herbs",
      "Pour dressing over salad and toss gently",
      "Season with salt and pepper to taste"
    ],
    tags: ["mediterranean", "healthy", "vegetarian", "quinoa", "lunch", "salad"],
    calories: 280,
    cuisine: "mediterranean",
    mealType: "lunch",
    userId: "sample-user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function addSampleRecipes() {
  try {
    console.log('🚀 Adding sample recipes to Firestore...');
    
    const recipesCollection = collection(db, 'recipes');
    
    for (const recipe of sampleRecipes) {
      const docRef = await addDoc(recipesCollection, recipe);
      console.log(`✅ Added recipe: ${recipe.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully added all sample recipes!');
    console.log(`📊 Total recipes added: ${sampleRecipes.length}`);
    console.log('\n🌐 You can now view these recipes in your explore-recipes page!');
    
  } catch (error) {
    console.error('❌ Error adding sample recipes:', error);
  }
}

// Run the script
addSampleRecipes();
