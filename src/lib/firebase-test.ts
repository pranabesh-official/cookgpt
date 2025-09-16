// Firebase Connection Test Utility
// This file helps diagnose Firebase connection and permission issues

import { db, auth } from './firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  console.log('🔍 Testing Firebase Connection...')
  
  try {
    // Test 1: Check if Firebase is initialized
    if (!db) {
      console.error('❌ Firebase Firestore is not initialized')
      return false
    }
    
    if (!auth) {
      console.error('❌ Firebase Auth is not initialized')
      return false
    }
    
    console.log('✅ Firebase services initialized')
    
    // Test 2: Check if user is authenticated
    const user = auth.currentUser
    if (!user) {
      console.error('❌ No authenticated user found')
      return false
    }
    
    console.log('✅ User authenticated:', user.uid)
    
    // Test 3: Try to write a simple document
    try {
      const testDoc = await addDoc(collection(db, 'test'), {
        userId: user.uid,
        timestamp: new Date(),
        test: 'connection-test'
      })
      console.log('✅ Write test successful:', testDoc.id)
      
      // Test 4: Try to read back the document
      const testQuery = query(
        collection(db, 'test'),
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(testQuery)
      console.log('✅ Read test successful, documents found:', querySnapshot.size)
      
      return true
    } catch (writeError) {
      console.error('❌ Firebase write/read test failed:', writeError)
      
      if (writeError instanceof Error) {
        if (writeError.message.includes('permission-denied')) {
          console.error('🔒 Permission denied - check Firebase security rules')
        } else if (writeError.message.includes('index')) {
          console.error('📇 Missing index - check Firebase console for index creation')
        }
      }
      
      return false
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    return false
  }
}

// Test specific collections that are having issues
export const testSpecificCollections = async () => {
  console.log('🔍 Testing specific collections...')
  
  if (!db || !auth?.currentUser) {
    console.error('❌ Firebase not ready for collection tests')
    return
  }
  
  const user = auth.currentUser
  
  // Test chats collection
  try {
    console.log('Testing chats collection...')
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid)
    )
    const chatsSnapshot = await getDocs(chatsQuery)
    console.log('✅ Chats collection accessible, documents found:', chatsSnapshot.size)
  } catch (error) {
    console.error('❌ Chats collection error:', error)
  }
  
  // Test savedRecipes collection
  try {
    console.log('Testing savedRecipes collection...')
    const recipesQuery = query(
      collection(db, 'savedRecipes'),
      where('userId', '==', user.uid)
    )
    const recipesSnapshot = await getDocs(recipesQuery)
    console.log('✅ SavedRecipes collection accessible, documents found:', recipesSnapshot.size)
  } catch (error) {
    console.error('❌ SavedRecipes collection error:', error)
  }
  
  // Test users collection
  try {
    console.log('Testing users collection...')
    const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)))
    console.log('✅ Users collection accessible')
  } catch (error) {
    console.error('❌ Users collection error:', error)
  }
}