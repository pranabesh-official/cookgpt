# CookIt Next.js Web Application - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Integrations](#integrations)
5. [Authentication System](#authentication-system)
6. [AI-Powered Features](#ai-powered-features)
7. [UI/UX Implementation](#uiux-implementation)
8. [Current Implementation Status](#current-implementation-status)
9. [Development Environment](#development-environment)
10. [Build & Deployment](#build--deployment)
11. [Known Issues & Solutions](#known-issues--solutions)
12. [Development Guidelines](#development-guidelines)
13. [API Reference](#api-reference)
14. [Performance Optimizations](#performance-optimizations)

---

## Project Overview

### Application Type
**Standalone AI-Powered Recipe Application** - A modern, responsive web application designed for cooking enthusiasts and home chefs.

### Core Features
- **Fast Authentication**: Optimized login/register flow with immediate dashboard access
- **AI Recipe Generation**: Powered by Google Gemini API for personalized recipe creation
- **Smart Onboarding**: 5-step guided setup for personalized cooking preferences
- **Interactive Dashboard**: Infinite scroll recipe browsing with AI-generated images
- **User Preferences**: Persistent storage of dietary restrictions and cooking preferences

### Target Users
- Home cooking enthusiasts
- Meal planning individuals
- Users seeking personalized recipe recommendations
- Cooking beginners to advanced chefs

---

## Technical Stack

### Core Framework
- **Next.js 15.4.6** - React-based framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.x** - Full type safety and enhanced developer experience

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Radix UI** - Accessible component primitives
- **Framer Motion 12.x** - Animation library for smooth interactions
- **Lucide React** - Icon library

### Backend Services
- **Firebase 12.1.0** - Backend-as-a-Service platform
  - Authentication (Email/Password + Google OAuth)
  - Firestore Database for user preferences
  - Real-time data synchronization

### AI Integration
- **Google Gemini API** - AI-powered recipe generation and image creation
- **@google/generative-ai 0.24.1** - Official Gemini SDK

### Development Tools
- **ESLint 9.x** - Code linting and style enforcement
- **Turbopack** - Fast bundler for development
- **React Hook Form 7.x** - Form state management
- **Zod 4.x** - Schema validation

---

## Architecture & Design Patterns

### Application Architecture
```
├── Server-Side Rendering (SSR) + Client-Side Rendering (CSR) Hybrid
├── Component-Based Architecture
├── Context-Based State Management
└── Service Layer for External APIs
```

### Design Patterns
- **Provider Pattern**: Authentication context across the application
- **Compound Components**: Reusable UI components with shadcn/ui
- **Custom Hooks**: Centralized logic for authentication and data fetching
- **Dynamic Imports**: SSR/CSR optimization for auth-dependent components

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── onboarding/        # 5-step onboarding flow
│   ├── login/             # Authentication page
│   ├── register/          # User registration
│   ├── about/             # Information page
│   └── layout.tsx         # Global layout with AuthProvider
├── components/
│   └── ui/                # Reusable shadcn/ui components
├── lib/
│   ├── auth-context.tsx   # Firebase authentication context
│   ├── firebase.ts        # Firebase configuration
│   ├── gemini-service.ts  # AI service integration
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

---

## Integrations

### 1. Firebase Integration
**Status**: ✅ **Fully Implemented**

#### Authentication
- **Email/Password**: Complete implementation with validation
- **Google OAuth**: One-click Google sign-in integration
- **State Management**: Persistent auth state across sessions

#### Firestore Database
- **User Preferences Storage**: Dietary restrictions, cooking preferences
- **Onboarding Data**: 5-step setup completion tracking
- **Real-time Updates**: Instant synchronization across devices

#### Configuration
```typescript
// Firebase Config (lib/firebase.ts)
- Project ID: mixit-mixology-guide
- Auth Domain: mixit-mixology-guide.firebaseapp.com
- Firestore: Real-time database for user data
- Storage: Firebase Storage for potential file uploads
```

### 2. Google Gemini AI Integration
**Status**: ✅ **Fully Implemented**

#### Capabilities
- **Recipe Generation**: AI-powered recipe creation based on user preferences
- **Image Generation**: Dynamic food imagery for recipes
- **Content Personalization**: Tailored recommendations

#### Models Used
- **gemini-2.0-flash**: Fast recipe text generation (v1beta-supported)
- **gemini-2.0-flash-preview-image-generation**: AI image creation

#### Implementation Features
```typescript
// Key Functions (lib/gemini-service.ts)
- generateAIRecipes(): Bulk recipe generation (10+ recipes)
- generateAIRecipeImage(): Dynamic image creation
- generateRecipeSpecificImage(): Fallback image handling
- Multi-tier fallback system for image reliability
```

### 3. shadcn/ui Integration
**Status**: ✅ **Fully Implemented**

#### Component Library
- **25+ Components**: Buttons, Cards, Forms, Dialogs, etc.
- **Accessibility**: WCAG compliant components
- **Theming**: CSS variables for consistent styling

#### Installed Components
```json
{
  "components": [
    "button", "card", "input", "label", "separator",
    "checkbox", "dialog", "dropdown-menu", "avatar",
    "progress", "switch", "tabs", "sheet", "badge"
  ]
}
```

---

## Authentication System

### Implementation Status: ✅ **Production Ready**

#### Features
- **Multi-Provider Auth**: Email/Password + Google OAuth
- **SSR Compatibility**: Proper hydration handling for Next.js
- **Automatic Redirects**: Smart routing based on auth state
- **Session Persistence**: Maintains auth state across browser sessions

#### Authentication Flow
```mermaid
graph TB
    A[User Visits App] --> B{Authenticated?}
    B -->|Yes| C{Onboarding Complete?}
    B -->|No| D[Login Page]
    C -->|Yes| E[Dashboard]
    C -->|No| F[Onboarding Flow]
    D --> G[Email/Password or Google]
    G --> H[Create Account or Sign In]
    H --> F
    F --> E
```

#### Recent Fixes
- **Hydration Issue Resolution**: Fixed SSR/CSR mismatch with dynamic imports
- **Blank Screen Fix**: Proper loading states for authenticated users
- **Redirect Logic**: Immediate dashboard access for returning users

### User Preferences Schema
```typescript
interface UserPreferences {
  dietaryRestrictions: string[];      // ["vegetarian", "gluten-free"]
  cuisinePreferences: string[];       // ["italian", "asian", "mexican"]
  mealTypeFocus: string[];           // ["breakfast", "lunch", "dinner"]
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  cookingTime: '15min' | '30min' | '1hr+';
  goals: string[];                   // ["healthy", "quick", "budget-friendly"]
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## AI-Powered Features

### Recipe Generation System
**Status**: ✅ **Production Ready**

#### Capabilities
- **Bulk Generation**: Minimum 10 recipes per request
- **Personalization**: Based on user onboarding preferences
- **Infinite Scroll**: Load 10 additional recipes on demand
- **Cultural Adaptation**: Cuisine-specific presentation styles

#### Image Generation Pipeline
```typescript
// Multi-tier Fallback System
1. Primary: AI-generated images via Gemini API
2. Secondary: Recipe-specific image searches
3. Tertiary: Curated Unsplash food images
4. Fallback: Emoji placeholders
```

#### Quality Standards
- **Professional Food Photography**: Restaurant-quality presentation
- **Cultural Authenticity**: Appropriate plating styles per cuisine
- **Difficulty Mapping**: Visual complexity matches recipe difficulty
- **Consistent Sizing**: 800x600 optimized images

### AI Service Configuration
```typescript
// Environment Variables Required
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

// Model Settings
{
  temperature: 0.7,          // Creative but consistent
  maxOutputTokens: 2048,     // Detailed recipe content
  topK: 40,                  // Vocabulary diversity
  topP: 0.95                 // Response creativity
}
```

---

## UI/UX Implementation

### Design System
**Status**: ✅ **Enterprise-Grade Implementation**

#### Design Principles
- **Clean & Focused**: Minimal introductory text, content-first approach
- **Responsive Design**: Mobile-first, scales to desktop (4-column grid on XL)
- **Accessibility**: WCAG compliant with proper keyboard navigation
- **Performance**: Optimized animations and loading states

#### Visual Design
- **Gradient Backgrounds**: Modern glassmorphism effects
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Loading States**: Skeleton animations for AI content generation
- **Enterprise Aesthetics**: Professional, modern interface design

#### Component Standards
```typescript
// Consistent Patterns
- Default imports for custom components (RecipeCard)
- TypeScript strict mode for all components
- Responsive grid layouts (xl:grid-cols-4)
- Toast notifications for user feedback
- Loading states with skeleton animations
```

### User Experience Flow
1. **Fast Login**: Optimized authentication for standalone app
2. **Guided Onboarding**: 5-step preference setup with progress tracking
3. **Personalized Dashboard**: AI-generated content based on preferences
4. **Infinite Discovery**: Continuous recipe loading with "Load More" functionality

---

## Current Implementation Status

### ✅ Completed Features

#### Authentication & User Management
- [x] Firebase Authentication (Email/Password + Google OAuth)
- [x] User registration with validation
- [x] Automatic login/logout flows
- [x] Session persistence across browser sessions
- [x] Protected route implementation
- [x] SSR hydration issue resolution

#### Onboarding System
- [x] 5-step guided onboarding flow
- [x] Progress tracking and navigation
- [x] User preference collection and storage
- [x] Firestore integration for preference persistence

#### AI-Powered Recipe System
- [x] Google Gemini API integration
- [x] Bulk recipe generation (10+ recipes minimum)
- [x] AI image generation with multi-tier fallbacks
- [x] Personalized content based on user preferences
- [x] Infinite scroll implementation

#### UI/UX Components
- [x] 25+ shadcn/ui components implemented
- [x] Responsive grid layouts
- [x] Loading states with skeleton animations
- [x] Toast notifications for user feedback
- [x] Framer Motion animations
- [x] Mobile-responsive design

### 🚧 In Progress
- [ ] Advanced recipe filtering and search
- [ ] User recipe saving/favorites functionality
- [ ] Recipe sharing capabilities
- [ ] Advanced meal planning features

### 📋 Planned Features
- [ ] Recipe rating and review system
- [ ] Shopping list generation
- [ ] Nutritional information display
- [ ] Recipe difficulty estimation
- [ ] Cooking timer integration

---

## Development Environment

### Prerequisites
- **Node.js**: v18.x or higher
- **npm/yarn/pnpm**: Package manager
- **Firebase Account**: For authentication and database
- **Google AI Studio**: For Gemini API access

### Environment Setup
```bash
# 1. Clone repository
git clone [repository-url]
cd cookitnextweb

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Add your API keys:
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# 4. Start development server
npm run dev
```

### Development Scripts
```json
{
  "dev": "next dev --turbopack",     // Development with Turbopack
  "build": "next build",             // Production build
  "start": "next start",             // Production server
  "lint": "next lint"                // Code linting
}
```

### Port Configuration
- **Primary**: `localhost:3000`
- **Fallback**: `localhost:3001` (if 3000 is in use)

---

## Build & Deployment

### Build Process
```bash
# Production build
npm run build

# Build optimization includes:
- Static generation for public pages
- Server-side rendering for dynamic content
- Image optimization
- Code splitting and tree shaking
- CSS optimization with Tailwind
```

### Deployment Configuration
- **Platform**: Optimized for Vercel deployment
- **SSR/SSG**: Hybrid rendering strategy
- **Environment Variables**: Secure API key management
- **Performance**: Optimized bundle sizes and loading

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: Optimized with code splitting

---

## Known Issues & Solutions

### 1. Hydration Mismatch (RESOLVED ✅)
**Issue**: Server/client rendering differences causing blank screens
**Solution**: Dynamic imports with SSR disabled for auth-dependent components

### 2. Authentication State Management (RESOLVED ✅)
**Issue**: Already logged-in users seeing login screen
**Solution**: Enhanced AuthProvider with proper SSR handling and mounting checks

### 3. Image Generation Reliability (RESOLVED ✅)
**Issue**: AI image generation failures
**Solution**: Multi-tier fallback system with reliable image sources

### 4. Development Server Performance
**Status**: Optimized with Turbopack for faster development builds

---

## Development Guidelines

### Code Standards
```typescript
// TypeScript strict mode enabled
// All components must have proper type definitions
// Use default imports for custom components
// Implement proper error handling for all API calls
```

### Component Development
```typescript
// Example component structure
export default function ComponentName() {
  // Hooks at the top
  // Event handlers
  // Render logic with proper TypeScript types
  return (
    // JSX with Tailwind classes
  );
}
```

### State Management
- **Authentication**: Context-based with Firebase
- **Form State**: React Hook Form with Zod validation
- **UI State**: Local component state with useState
- **Server State**: Direct API calls with error handling

### Testing Approach
- **Browser Testing**: Playwright MCP for authentication flows
- **Form Validation**: Manual testing with edge cases
- **Responsive Design**: Cross-device testing
- **Performance**: Lighthouse audits for optimization

---

## API Reference

### Authentication API
```typescript
// useAuth() hook methods
const {
  user,                    // Current user object
  userPreferences,         // User's cooking preferences
  loading,                 // Authentication loading state
  signInWithEmail,         // Email/password authentication
  signUpWithEmail,         // User registration
  signInWithGoogle,        // Google OAuth
  signOut,                 // Logout functionality
  updateUserPreferences,   // Update user preferences
  refreshUserPreferences   // Refresh user data
} = useAuth();
```

### Gemini AI Service
```typescript
// Recipe generation functions
generateAIRecipes(userPreferences, count): Promise<Recipe[]>
generateAIRecipeImage(recipe): Promise<string>
generateRecipeSpecificImage(recipe): Promise<string>
```

### Firestore Schema
```typescript
// Collections
users/                   // User documents
  {userId}/              // User-specific data
    preferences: UserPreferences
    createdAt: Timestamp
    updatedAt: Timestamp
```

---

## Performance Optimizations

### Current Optimizations
1. **Next.js App Router**: Optimized routing and rendering
2. **Dynamic Imports**: Reduced initial bundle size
3. **Image Optimization**: Next.js built-in image optimization
4. **Code Splitting**: Automatic route-based splitting
5. **CSS Optimization**: Tailwind CSS purging

### Loading Strategies
- **Skeleton Loading**: 10 cards initially, 4 for additional loads
- **Infinite Scroll**: Progressive content loading
- **Image Lazy Loading**: On-demand image loading
- **Component Lazy Loading**: Dynamic imports for heavy components

### Caching Strategy
- **Firebase Auth**: Persistent session caching
- **Static Assets**: CDN caching via Vercel
- **API Responses**: Client-side caching for recipes
- **Images**: Browser caching with proper headers

---

## Support & Maintenance

### Documentation Updates
- **Version**: Keep in sync with package.json
- **Features**: Update status as features are completed
- **Issues**: Document known issues and solutions

### Monitoring
- **Error Tracking**: Console error monitoring
- **Performance**: Regular Lighthouse audits
- **User Feedback**: Toast notifications and error handling

### Future Enhancements
- Advanced recipe filtering
- Social features (sharing, rating)
- Meal planning calendar
- Shopping list integration
- Offline functionality

---

**Last Updated**: January 2025  
**Version**: 0.1.0  
**Status**: Production Ready for Core Features  
**Next.js Version**: 15.4.6  
**React Version**: 19.1.0