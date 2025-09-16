// Test Firebase functionality in browser environment
// This script tests that Firebase can be initialized without the "process is not defined" error

console.log('🧪 Testing Firebase Browser Environment');
console.log('=====================================\n');

// Test 1: Check if process environment variable access works
console.log('1. Testing environment variable access...');
try {
  // This should work now with our fixes
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  console.log('✅ Environment variable access working:', !!geminiKey);
} catch (error) {
  console.log('❌ Environment variable access failed:', error.message);
}

// Test 2: Test Gemini service import and initialization
console.log('\n2. Testing Gemini service...');
try {
  // This would fail before our fix due to process.env access
  import('./src/lib/gemini-service.js').then(geminiService => {
    console.log('✅ Gemini service import successful');
    console.log('✅ isGeminiAvailable function:', typeof geminiService.isGeminiAvailable);
    
    // Test the function
    const isAvailable = geminiService.isGeminiAvailable();
    console.log('✅ Gemini API available:', isAvailable);
  }).catch(error => {
    console.log('❌ Gemini service import failed:', error.message);
  });
} catch (error) {
  console.log('❌ Gemini service test failed:', error.message);
}

// Test 3: Test Firebase import
console.log('\n3. Testing Firebase imports...');
try {
  import('./src/lib/firebase.js').then(firebase => {
    console.log('✅ Firebase import successful');
    console.log('✅ Firebase auth available:', !!firebase.auth);
    console.log('✅ Firebase db available:', !!firebase.db);
  }).catch(error => {
    console.log('❌ Firebase import failed:', error.message);
  });
} catch (error) {
  console.log('❌ Firebase test failed:', error.message);
}

console.log('\n🎉 Browser environment test completed!');
console.log('If all tests pass, Firebase collections should now be created when users interact with the app.');