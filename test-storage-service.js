/**
 * Test Firebase Storage integration for recipe image uploads
 * This script tests the complete workflow of uploading base64 images to Firebase Storage
 */

import { storage } from '../src/lib/firebase';
import { processRecipeImageUrl, uploadRecipeImage, isBase64DataUrl } from '../src/lib/storage-service';

// Mock recipe data for testing
const testRecipe = {
  id: 'test-recipe-1',
  title: 'Test Spaghetti Carbonara',
  description: 'A delicious test recipe',
  cookingTime: '20 minutes',
  servings: 4,
  difficulty: 'Medium',
  ingredients: ['pasta', 'eggs', 'cheese', 'bacon'],
  instructions: ['Boil pasta', 'Mix eggs', 'Combine all'],
  tags: ['italian', 'pasta'],
  calories: 550,
  // Sample base64 image data (1x1 pixel PNG)
  imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
};

const testUserId = 'test-user-123';

async function testStorageService() {
  console.log('🧪 Testing Firebase Storage Service');
  console.log('===================================');

  try {
    // Test 1: Check Firebase Storage initialization
    console.log('\n1. 📊 Checking Firebase Storage initialization...');
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    console.log('✅ Firebase Storage initialized successfully');

    // Test 2: Test base64 detection
    console.log('\n2. 🔍 Testing base64 URL detection...');
    const isBase64 = isBase64DataUrl(testRecipe.imageUrl);
    console.log('Base64 URL detected:', isBase64);
    if (!isBase64) {
      throw new Error('Base64 URL detection failed');
    }
    console.log('✅ Base64 URL detection working');

    // Test 3: Test image upload function
    console.log('\n3. 📤 Testing image upload...');
    console.log('Recipe title:', testRecipe.title);
    console.log('User ID:', testUserId);
    console.log('Image data length:', testRecipe.imageUrl.length);

    const uploadedUrl = await uploadRecipeImage(
      testRecipe.imageUrl,
      testUserId,
      testRecipe.title
    );

    console.log('✅ Image uploaded successfully!');
    console.log('Firebase Storage URL:', uploadedUrl);

    // Test 4: Test complete processing function
    console.log('\n4. 🔄 Testing complete image processing...');
    const processedUrl = await processRecipeImageUrl(
      testRecipe.imageUrl,
      testUserId,
      testRecipe.title + ' (processed)'
    );

    console.log('✅ Image processing completed!');
    console.log('Processed URL:', processedUrl);

    // Test 5: Test with HTTP URL (should pass through unchanged)
    console.log('\n5. 🌐 Testing HTTP URL passthrough...');
    const httpUrl = 'https://example.com/test-image.jpg';
    const passedThroughUrl = await processRecipeImageUrl(
      httpUrl,
      testUserId,
      'Test HTTP Recipe'
    );

    console.log('HTTP URL passed through:', passedThroughUrl === httpUrl);
    console.log('Original:', httpUrl);
    console.log('Processed:', passedThroughUrl);

    if (passedThroughUrl !== httpUrl) {
      throw new Error('HTTP URL passthrough failed');
    }
    console.log('✅ HTTP URL passthrough working');

    // Test 6: Test with empty/invalid URL
    console.log('\n6. ❌ Testing invalid URL handling...');
    const emptyResult = await processRecipeImageUrl('', testUserId, 'Empty Recipe');
    const invalidResult = await processRecipeImageUrl('invalid-url', testUserId, 'Invalid Recipe');

    console.log('Empty URL result:', emptyResult);
    console.log('Invalid URL result:', invalidResult);

    if (emptyResult !== '' || invalidResult !== '') {
      throw new Error('Invalid URL handling failed');
    }
    console.log('✅ Invalid URL handling working');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('=====================================');
    console.log('✅ Firebase Storage integration is working correctly');
    console.log('✅ Base64 images can be uploaded and stored');
    console.log('✅ HTTP URLs are passed through unchanged');
    console.log('✅ Invalid URLs are handled gracefully');
    console.log('');
    console.log('🚀 Ready for production use!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('================');
    console.error('Error:', error);
    console.error('');
    console.error('🔧 TROUBLESHOOTING STEPS:');
    console.error('1. Check Firebase configuration in .env.local');
    console.error('2. Verify Firebase Storage rules allow authenticated users');
    console.error('3. Ensure Firebase project has Storage enabled');
    console.error('4. Check console for detailed error messages');
  }
}

// Export for testing
if (typeof window !== 'undefined') {
  // Browser environment
  window.testStorageService = testStorageService;
  console.log('🧪 Storage service test available as window.testStorageService()');
} else {
  // Node environment
  testStorageService().catch(console.error);
}

export default testStorageService;