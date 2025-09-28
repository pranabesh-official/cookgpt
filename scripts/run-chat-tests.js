#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Starting Enhanced Chat E2E Tests with Playwright...\n');

// Test configuration
const testConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  workers: 1, // Run tests sequentially for better debugging
  reporter: [
    ['html', { outputFolder: 'test-results/chat-tests' }],
    ['json', { outputFile: 'test-results/chat-tests/results.json' }],
    ['list']
  ]
};

// Test files to run
const testFiles = [
  'tests/langchain-chat-e2e.spec.ts',
  'tests/chat-personality-test.spec.ts'
];

async function runTests() {
  try {
    console.log('📋 Test Configuration:');
    console.log(`   Base URL: ${testConfig.baseURL}`);
    console.log(`   Timeout: ${testConfig.timeout}ms`);
    console.log(`   Retries: ${testConfig.retries}`);
    console.log(`   Workers: ${testConfig.workers}\n`);

    // Check if the development server is running
    console.log('🔍 Checking if development server is running...');
    try {
      const response = await fetch(testConfig.baseURL);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      console.log('✅ Development server is running\n');
    } catch (error) {
      console.error('❌ Development server is not running!');
      console.error('   Please start the development server with: npm run dev');
      console.error('   Then run this test script again.\n');
      process.exit(1);
    }

    // Run the tests
    console.log('🚀 Running Enhanced Chat Tests...\n');
    
    const testCommand = [
      'npx playwright test',
      ...testFiles,
      `--config=${path.join(__dirname, '../playwright.config.ts')}`,
      `--timeout=${testConfig.timeout}`,
      `--retries=${testConfig.retries}`,
      `--workers=${testConfig.workers}`,
      '--reporter=html,json,list'
    ].join(' ');

    console.log(`📝 Command: ${testCommand}\n`);
    
    execSync(testCommand, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('📊 Check the test results in: test-results/chat-tests/');

  } catch (error) {
    console.error('\n❌ Tests failed!');
    console.error('Error:', error.message);
    
    if (error.status) {
      console.error(`Exit code: ${error.status}`);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure the development server is running (npm run dev)');
    console.log('   2. Check that all dependencies are installed (npm install)');
    console.log('   3. Verify that the LangChain integration is working');
    console.log('   4. Check the browser console for any JavaScript errors');
    console.log('   5. Review the test results in test-results/chat-tests/');
    
    process.exit(1);
  }
}

// Helper function to check if server is running
async function fetch(url) {
  const https = require('https');
  const http = require('http');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve(res);
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run the tests
runTests();
