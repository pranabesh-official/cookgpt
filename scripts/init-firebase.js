#!/usr/bin/env node

/**
 * Firebase Initialization Script for CookItNext
 * This script helps set up Firebase and test the connection
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CookItNext Firebase Initialization Script\n');

// Check if Firebase config exists
const firebaseConfigPath = path.join(__dirname, '../src/lib/firebase.ts');
const firebaseConfigExists = fs.existsSync(firebaseConfigPath);

if (!firebaseConfigExists) {
  console.error('❌ Firebase config file not found at:', firebaseConfigPath);
  process.exit(1);
}

console.log('✅ Firebase config file found');

// Check if rules files exist
const firestoreRulesPath = path.join(__dirname, '../firestore.rules');
const storageRulesPath = path.join(__dirname, '../storage.rules');

const firestoreRulesExist = fs.existsSync(firestoreRulesPath);
const storageRulesExist = fs.existsSync(storageRulesPath);

console.log(`✅ Firestore rules: ${firestoreRulesExist ? 'Found' : 'Missing'}`);
console.log(`✅ Storage rules: ${storageRulesExist ? 'Found' : 'Missing'}`);

// Display setup instructions
console.log('\n📋 Setup Instructions:\n');

console.log('1. 🔥 Create Firebase Project:');
console.log('   - Go to https://console.firebase.google.com/');
console.log('   - Click "Create a project"');
console.log('   - Name: cookitnext');
console.log('   - Enable Google Analytics (optional)');

console.log('\n2. 🌐 Add Web App:');
console.log('   - Click web icon (</>)');
console.log('   - App nickname: cookitnext-web');
console.log('   - Copy Firebase config');

console.log('\n3. ⚙️ Update Firebase Config:');
console.log('   - Edit src/lib/firebase.ts');
console.log('   - Replace with your Firebase config');

console.log('\n4. 🔐 Enable Services:');
console.log('   - Authentication: Email/Password + Google');
console.log('   - Firestore Database: Start in test mode');
console.log('   - Storage: Start in test mode');

console.log('\n5. 📋 Apply Security Rules:');
console.log('   - Firestore: Copy rules from firestore.rules');
console.log('   - Storage: Copy rules from storage.rules');

console.log('\n6. 🧪 Test Connection:');
console.log('   - Run: npm run dev');
console.log('   - Navigate to /explore-recipes');
console.log('   - Check browser console for errors');

// Check package.json for Firebase dependencies
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasFirebase = packageJson.dependencies && packageJson.dependencies.firebase;
  
  console.log('\n📦 Dependencies:');
  console.log(`   Firebase: ${hasFirebase ? '✅ Installed' : '❌ Missing'}`);
  
  if (!hasFirebase) {
    console.log('\n   Install Firebase: npm install firebase');
  }
}

console.log('\n📚 Documentation:');
console.log('   - Firebase Setup: FIREBASE_SETUP.md');
console.log('   - Explore Recipes: EXPLORE_RECIPES_README.md');
console.log('   - Landing Page: LANDING_PAGE_README.md');

console.log('\n🎯 Next Steps:');
console.log('   1. Follow setup instructions above');
console.log('   2. Test the explore-recipes page');
console.log('   3. Verify recipes load without login');
console.log('   4. Test filtering and search functionality');

console.log('\n✨ Happy coding with CookItNext!');
