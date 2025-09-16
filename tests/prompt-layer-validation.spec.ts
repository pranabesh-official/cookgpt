import { test, expect } from '@playwright/test';

test.describe('Prompt Layer Validation - Dietary Restrictions & Meal Planning', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test meal planning page
    await page.goto('/test-meal-planning');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Meal Planning Prompt Validation Test")');
  });

  test('should reject chicken recipe request for vegan user', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test requesting a chicken recipe
    const chickenRequest = 'I want a recipe for grilled chicken breast';
    await page.fill('#meal-plan-request', chickenRequest);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify that the request was rejected
    await expect(page.locator('text=Invalid').first()).toBeVisible();
    await expect(page.locator('text=dietary').first()).toBeVisible();
    await expect(page.locator('text=chicken').first()).toBeVisible();
    
    // Verify the suggestion message
    await expect(page.locator('text=I notice you\'ve selected vegan as a dietary preference, but you\'re asking for chicken').first()).toBeVisible();
    
    // Verify alternative ingredients are suggested
    await expect(page.locator('text=tofu').first()).toBeVisible();
    await expect(page.locator('text=tempeh').first()).toBeVisible();
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative using tofu, tempeh, chickpeas instead?').first()).toBeVisible();
  });

  test('should reject meal plan with conflicting ingredients for vegan user', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test meal planning with conflicting ingredients
    const conflictingMealPlan = 'Create a meal plan for the week that includes grilled chicken, fish tacos, and beef stir fry';
    await page.fill('#meal-plan-request', conflictingMealPlan);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify that the request was rejected
    await expect(page.locator('text=Invalid').first()).toBeVisible();
    await expect(page.locator('text=dietary').first()).toBeVisible();
    
    // Verify conflicting items are detected
    await expect(page.locator('text=chicken').first()).toBeVisible();
    await expect(page.locator('text=fish').first()).toBeVisible();
    await expect(page.locator('text=beef').first()).toBeVisible();
    
    // Verify the system acts as a professional chef
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should accept valid vegan meal plan request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test valid vegan meal plan request
    const validRequest = 'Create a vegan meal plan for the week with tofu, lentils, chickpeas, and vegetables';
    await page.fill('#meal-plan-request', validRequest);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify that the request was accepted
    await expect(page.locator('text=Valid').first()).toBeVisible();
    await expect(page.locator('text=Valid Request').first()).toBeVisible();
  });

  test('should generate compliant meal plan for valid request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test valid vegan meal plan request
    const validRequest = 'Create a vegan meal plan for the week with tofu, lentils, and vegetables';
    await page.fill('#meal-plan-request', validRequest);
    
    // Generate meal plan - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Generate Meal Plan")');
    
    // Wait for meal plan to be generated
    await page.waitForSelector('text=Generated Meal Plan', { timeout: 15000 });
    
    // Verify meal plan was generated successfully
    await expect(page.locator('text=Successfully generated meal plan')).toBeVisible();
    await expect(page.locator('text=Recipes Generated')).toBeVisible();
    
    // Verify recipes are displayed
    await expect(page.locator('text=Validation Status')).toBeVisible();
    await expect(page.locator('text=Valid Request')).toBeVisible();
  });

  test('should reject meal plan generation for conflicting request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test conflicting meal plan request
    const conflictingRequest = 'I need a meal plan for the week, but I want to include grilled chicken for protein';
    await page.fill('#meal-plan-request', conflictingRequest);
    
    // Try to generate meal plan - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Generate Meal Plan")');
    
    // Wait for error message
    await page.waitForSelector('text=Meal plan request conflicts with your dietary preferences', { timeout: 10000 });
    
    // Verify error message is displayed
    await expect(page.locator('text=Meal plan request conflicts with your dietary preferences')).toBeVisible();
  });

  test('should provide alternative ingredients for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test the vegan chicken meal plan scenario - use more specific selector
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button[data-slot="button"]:has-text("Test")').first().click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify alternatives are suggested
    await expect(page.locator('text=tofu').first()).toBeVisible();
    await expect(page.locator('text=tempeh').first()).toBeVisible();
    await expect(page.locator('text=chickpeas').first()).toBeVisible();
    await expect(page.locator('text=lentils').first()).toBeVisible();
    await expect(page.locator('text=mushrooms').first()).toBeVisible();
    
    // Verify the professional chef response
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative using tofu, tempeh, chickpeas instead?').first()).toBeVisible();
  });

  test('should show educational content for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test the vegan chicken meal plan scenario - use more specific selector
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button[data-slot="button"]:has-text("Test")').first().click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify educational content is provided
    await expect(page.locator('text=I notice you\'ve selected vegan as a dietary preference, but you\'re asking for chicken').first()).toBeVisible();
    
    // Verify the system explains the conflict
    await expect(page.locator('text=You\'ve selected vegan as a dietary restriction, but you\'re asking for chicken').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should handle custom meal planning requests with conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Enter custom meal plan request with conflicts
    const customRequest = 'I want a meal plan that includes salmon sushi and dairy products';
    await page.fill('#meal-plan-request', customRequest);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify conflicts are detected
    await expect(page.locator('text=Invalid').first()).toBeVisible();
    await expect(page.locator('text=dietary').first()).toBeVisible();
    
    // Verify specific conflicts are identified
    await expect(page.locator('text=salmon').first()).toBeVisible();
    await expect(page.locator('text=dairy').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should validate meal planning with skill level considerations', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Enter a meal plan request with complex ingredients
    const complexRequest = 'I need a meal plan that includes sous vide cooking and complex French techniques';
    await page.fill('#meal-plan-request', complexRequest);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify skill level conflict is detected
    await expect(page.locator('text=Invalid').first()).toBeVisible();
    await expect(page.locator('text=ingredient').first()).toBeVisible();
    
    // Verify the system provides helpful suggestions
    await expect(page.locator('text=Would you like me to suggest a beginner-friendly version').first()).toBeVisible();
  });

  test('should provide helpful suggestions for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test the vegan chicken meal plan scenario - use more specific selector
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button[data-slot="button"]:has-text("Test")').first().click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify helpful suggestions are provided
    await expect(page.locator('text=suggestion').first()).toBeVisible();
    await expect(page.locator('text=alternativePrompt').first()).toBeVisible();
    
    // Verify the system acts as a professional chef
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
    
    // Verify alternatives are provided
    await expect(page.locator('text=tofu, tempeh, chickpeas').first()).toBeVisible();
  });

  test('should display meal plan recipes with proper formatting', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test valid vegan meal plan request
    const validRequest = 'Create a vegan meal plan for the week with tofu, lentils, and vegetables';
    await page.fill('#meal-plan-request', validRequest);
    
    // Generate meal plan - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Generate Meal Plan")');
    
    // Wait for meal plan to be generated
    await page.waitForSelector('text=Generated Meal Plan', { timeout: 15000 });
    
    // Verify meal plan structure
    await expect(page.locator('text=Original Request')).toBeVisible();
    await expect(page.locator('text=Recipes Generated')).toBeVisible();
    await expect(page.locator('text=Validation Status')).toBeVisible();
    
    // Verify recipe cards are displayed with proper information
    await expect(page.locator('text=cookingTime').first()).toBeVisible();
    await expect(page.locator('text=difficulty').first()).toBeVisible();
    await expect(page.locator('text=servings').first()).toBeVisible();
    await expect(page.locator('text=tags').first()).toBeVisible();
  });

  test('should handle multiple dietary restrictions in meal planning', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test complex meal plan with multiple restrictions - use more specific selector
    const complexScenario = page.locator('div:has-text("Complex meal plan with multiple restrictions")');
    await complexScenario.locator('button[data-slot="button"]:has-text("Test")').first().click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify multiple conflicts are detected
    await expect(page.locator('text=Invalid').first()).toBeVisible();
    await expect(page.locator('text=dietary').first()).toBeVisible();
    
    // Verify the system provides comprehensive alternatives
    await expect(page.locator('text=Would you like me to suggest a delicious').first()).toBeVisible();
  });

  test('should provide professional chef guidance for dietary conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test requesting a chicken recipe
    const chickenRequest = 'I want to make a delicious chicken curry for dinner tonight';
    await page.fill('#meal-plan-request', chickenRequest);
    
    // Test validation - use more specific selector
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify the system acts as a professional chef
    await expect(page.locator('text=I notice you\'ve selected vegan as a dietary preference, but you\'re asking for chicken').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=tofu').first()).toBeVisible();
    await expect(page.locator('text=tempeh').first()).toBeVisible();
    
    // Verify the chef provides a helpful alternative
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative using tofu, tempeh, chickpeas instead?').first()).toBeVisible();
    
    // Verify the response is educational and helpful
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });
});
