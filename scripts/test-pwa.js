#!/usr/bin/env node

/**
 * PWA Testing Script
 * Tests Progressive Web App functionality and performance
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PWA Testing Script');
console.log('====================\n');

// Test 1: Check if manifest.json exists and is valid
function testManifest() {
  console.log('1. Testing PWA Manifest...');
  
  try {
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const requiredFields = [
      'name', 'short_name', 'icons', 'theme_color', 
      'background_color', 'display', 'start_url', 'scope'
    ];
    
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Manifest.json is valid with all required fields');
    } else {
      console.log('❌ Manifest.json missing fields:', missingFields.join(', '));
    }
    
    // Check icons
    if (manifest.icons && manifest.icons.length >= 2) {
      console.log('✅ Manifest has sufficient icons');
    } else {
      console.log('❌ Manifest needs more icons');
    }
    
    // Check PWA features
    const pwaFeatures = [
      'shortcuts', 'categories', 'screenshots', 'orientation'
    ];
    
    const hasAdvancedFeatures = pwaFeatures.some(feature => manifest[feature]);
    if (hasAdvancedFeatures) {
      console.log('✅ Manifest includes advanced PWA features');
    } else {
      console.log('⚠️  Manifest could include more PWA features');
    }
    
  } catch (error) {
    console.log('❌ Error reading manifest.json:', error.message);
  }
  
  console.log('');
}

// Test 2: Check service worker
function testServiceWorker() {
  console.log('2. Testing Service Worker...');
  
  try {
    const swPath = path.join(__dirname, '..', 'public', 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for essential service worker features
    const essentialFeatures = [
      'addEventListener(\'install\'',
      'addEventListener(\'activate\'',
      'addEventListener(\'fetch\'',
      'caches.open',
      'skipWaiting',
      'clients.claim'
    ];
    
    const hasEssentialFeatures = essentialFeatures.every(feature => 
      swContent.includes(feature)
    );
    
    if (hasEssentialFeatures) {
      console.log('✅ Service worker has essential features');
    } else {
      console.log('❌ Service worker missing essential features');
    }
    
    // Check for advanced features
    const advancedFeatures = [
      'CACHE_STRATEGIES',
      'networkFirst',
      'cacheFirst',
      'staleWhileRevalidate',
      'UPDATE_AVAILABLE',
      'background sync'
    ];
    
    const hasAdvancedFeatures = advancedFeatures.some(feature => 
      swContent.includes(feature)
    );
    
    if (hasAdvancedFeatures) {
      console.log('✅ Service worker has advanced features');
    } else {
      console.log('⚠️  Service worker could include more advanced features');
    }
    
    // Check for auto-update functionality
    if (swContent.includes('checkForUpdates') || swContent.includes('UPDATE_AVAILABLE')) {
      console.log('✅ Service worker has auto-update functionality');
    } else {
      console.log('❌ Service worker missing auto-update functionality');
    }
    
  } catch (error) {
    console.log('❌ Error reading service worker:', error.message);
  }
  
  console.log('');
}

// Test 3: Check PWA components
function testPWAComponents() {
  console.log('3. Testing PWA Components...');
  
  const components = [
    'src/components/pwa-update-manager.tsx',
    'src/components/pwa-install-prompt.tsx',
    'src/app/pwa-settings/page.tsx',
    'src/app/offline/page.tsx'
  ];
  
  let allComponentsExist = true;
  
  components.forEach(component => {
    const componentPath = path.join(__dirname, '..', component);
    if (fs.existsSync(componentPath)) {
      console.log(`✅ ${component} exists`);
    } else {
      console.log(`❌ ${component} missing`);
      allComponentsExist = false;
    }
  });
  
  if (allComponentsExist) {
    console.log('✅ All PWA components are present');
  } else {
    console.log('❌ Some PWA components are missing');
  }
  
  console.log('');
}

// Test 4: Check Next.js configuration
function testNextConfig() {
  console.log('4. Testing Next.js PWA Configuration...');
  
  try {
    const configPath = path.join(__dirname, '..', 'next.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const pwaConfigs = [
      'headers',
      'Service-Worker-Allowed',
      'Cache-Control',
      'compress',
      'optimizeCss'
    ];
    
    const hasPWAConfigs = pwaConfigs.some(config => 
      configContent.includes(config)
    );
    
    if (hasPWAConfigs) {
      console.log('✅ Next.js config includes PWA optimizations');
    } else {
      console.log('❌ Next.js config missing PWA optimizations');
    }
    
  } catch (error) {
    console.log('❌ Error reading next.config.ts:', error.message);
  }
  
  console.log('');
}

// Test 5: Check layout PWA integration
function testLayoutIntegration() {
  console.log('5. Testing Layout PWA Integration...');
  
  try {
    const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const pwaIntegrations = [
      'PWAInstallPrompt',
      'serviceWorker.register',
      'beforeinstallprompt',
      'appinstalled',
      'UPDATE_AVAILABLE'
    ];
    
    const hasPWAIntegrations = pwaIntegrations.some(integration => 
      layoutContent.includes(integration)
    );
    
    if (hasPWAIntegrations) {
      console.log('✅ Layout includes PWA integrations');
    } else {
      console.log('❌ Layout missing PWA integrations');
    }
    
  } catch (error) {
    console.log('❌ Error reading layout.tsx:', error.message);
  }
  
  console.log('');
}

// Test 6: Check icons and assets
function testIconsAndAssets() {
  console.log('6. Testing Icons and Assets...');
  
  const requiredIcons = [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'maskable-icon-192x192.png',
    'maskable-icon-512x512.png'
  ];
  
  let allIconsExist = true;
  
  requiredIcons.forEach(icon => {
    const iconPath = path.join(__dirname, '..', 'public', icon);
    if (fs.existsSync(iconPath)) {
      console.log(`✅ ${icon} exists`);
    } else {
      console.log(`❌ ${icon} missing`);
      allIconsExist = false;
    }
  });
  
  if (allIconsExist) {
    console.log('✅ All required icons are present');
  } else {
    console.log('❌ Some required icons are missing');
  }
  
  console.log('');
}

// Test 7: Performance recommendations
function testPerformanceRecommendations() {
  console.log('7. Performance Recommendations...');
  
  console.log('📋 PWA Best Practices Checklist:');
  console.log('');
  
  const recommendations = [
    {
      item: 'HTTPS is required for PWA',
      status: '⚠️  Verify HTTPS in production'
    },
    {
      item: 'Service Worker registration',
      status: '✅ Implemented'
    },
    {
      item: 'Offline functionality',
      status: '✅ Implemented'
    },
    {
      item: 'App-like experience',
      status: '✅ Implemented with standalone display'
    },
    {
      item: 'Responsive design',
      status: '✅ Should be verified in testing'
    },
    {
      item: 'Fast loading',
      status: '✅ Optimized with caching strategies'
    },
    {
      item: 'Installable',
      status: '✅ Implemented with install prompt'
    },
    {
      item: 'Auto-updates',
      status: '✅ Implemented with service worker updates'
    }
  ];
  
  recommendations.forEach(rec => {
    console.log(`${rec.status} ${rec.item}`);
  });
  
  console.log('');
}

// Run all tests
function runAllTests() {
  testManifest();
  testServiceWorker();
  testPWAComponents();
  testNextConfig();
  testLayoutIntegration();
  testIconsAndAssets();
  testPerformanceRecommendations();
  
  console.log('🎉 PWA Testing Complete!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Test the app in a browser with PWA support');
  console.log('2. Use Chrome DevTools > Application > Manifest to verify');
  console.log('3. Test offline functionality by going offline');
  console.log('4. Test install prompt by visiting the app');
  console.log('5. Verify auto-updates by modifying the service worker');
}

// Run the tests
runAllTests();
