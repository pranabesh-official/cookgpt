# Firebase Setup for CookItNext

## 🚀 **Project Initialization**

### **1. Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `cookitnext`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **2. Add Web App**
1. In your Firebase project, click the web icon (</>)
2. Enter app nickname: `cookitnext-web`
3. Click "Register app"
4. Copy the Firebase config object

### **3. Update Firebase Configuration**
Replace the config in `src/lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "cookitnext.firebaseapp.com",
  projectId: "cookitnext",
  storageBucket: "cookitnext.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 🔥 **Enable Firebase Services**

### **1. Authentication**
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google Sign-in
4. Add your domain to authorized domains

### **2. Firestore Database**
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules)
4. Select a location (choose closest to your users)
5. Click "Done"

### **3. Storage**
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" (we'll update rules)
4. Select a location (same as Firestore)
5. Click "Done"

## 📋 **Apply Security Rules**

### **1. Firestore Rules**
1. Go to Firestore Database → Rules
2. Replace all rules with content from `firestore.rules`
3. Click "Publish"

### **2. Storage Rules**
1. Go to Storage → Rules
2. Replace all rules with content from `storage.rules`
3. Click "Publish"

## 🗄️ **Database Structure**

### **Collections to Create**

#### **Recipes Collection**
```
recipes/
  {recipeId}/
    title: string
    description: string
    ingredients: string[]
    instructions: string[]
    cookingTime: string
    servings: number
    difficulty: string
    tags: string[]
    calories?: number
    imageUrl?: string
    cuisine?: string
    mealType?: string
    userId: string
    createdAt: Timestamp
    updatedAt: Timestamp
```

#### **Users Collection**
```
users/
  {userId}/
    email: string
    displayName?: string
    dietaryRestrictions: string[]
    cuisinePreferences: string[]
    mealTypeFocus: string[]
    skillLevel: string
    cookingTime: string
    goals: string[]
    onboardingCompleted: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
```

#### **Categories Collection**
```
categories/
  {categoryId}/
    name: string
    description: string
    imageUrl?: string
    recipeCount: number
    createdAt: Timestamp
```

#### **Tags Collection**
```
tags/
  {tagId}/
    name: string
    type: string (cuisine, mealType, difficulty, etc.)
    recipeCount: number
    createdAt: Timestamp
```

## 🧪 **Test Firebase Connection**

### **1. Test Authentication**
1. Go to your app
2. Try to sign in with email/password
3. Check Firebase Console → Authentication → Users

### **2. Test Firestore**
1. Create a test recipe
2. Check Firebase Console → Firestore Database
3. Verify data is being saved

### **3. Test Storage**
1. Upload a recipe image
2. Check Firebase Console → Storage
3. Verify image is accessible

## 🔒 **Security Features**

### **Public Access (No Login Required)**
- ✅ Read access to all recipes
- ✅ Read access to recipe images
- ✅ Read access to categories and tags
- ✅ Browse recipes without authentication

### **Protected Access (Login Required)**
- 🔒 User preferences and profile data
- 🔒 Chat conversations
- 🔒 Saved recipes
- 🔒 Recipe creation and updates

### **Admin Access**
- 👑 Category and tag management
- 👑 System-wide settings

## 🚨 **Important Notes**

### **1. Environment Variables**
- Never commit Firebase config with real API keys to public repos
- Use environment variables for production
- Add `.env.local` to `.gitignore`

### **2. Rules Testing**
- Test rules thoroughly before going live
- Use Firebase Emulator for local testing
- Monitor Firebase Console for rule violations

### **3. Data Migration**
- If you have existing data, ensure it matches the new structure
- Update any hardcoded references to old collection names
- Test all functionality after migration

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Rules Denied**
- Check if rules are published
- Verify collection names match rules
- Check authentication state

#### **2. Images Not Loading**
- Verify Storage rules allow public read
- Check image URLs in Firestore
- Ensure images are uploaded to correct path

#### **3. Authentication Errors**
- Check authorized domains
- Verify Google OAuth configuration
- Check Firebase project settings

## 📱 **Mobile Configuration**

### **iOS (if needed)**
1. Download `GoogleService-Info.plist`
2. Add to iOS project
3. Update iOS configuration

### **Android (if needed)**
1. Download `google-services.json`
2. Add to Android project
3. Update Android configuration

## 🌐 **Deployment**

### **1. Production Rules**
- Update rules for production environment
- Remove test mode settings
- Enable proper authentication

### **2. Domain Configuration**
- Add production domain to authorized domains
- Configure custom domains if needed
- Set up SSL certificates

### **3. Monitoring**
- Enable Firebase Analytics
- Set up error reporting
- Monitor usage and performance

## 📚 **Additional Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Authentication Setup](https://firebase.google.com/docs/auth)
