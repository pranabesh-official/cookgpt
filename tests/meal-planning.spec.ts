import { test, expect } from '@playwright/test';

test.describe('Meal Planning Prompt Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the meal planning test page
    await page.goto('/test-meal-planning');
  });

  test('should validate vegan meal plan with chicken request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test the vegan chicken meal plan scenario
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=chicken')).toBeVisible();
    
    // Verify the conversation response
    await expect(page.locator('text=Conversation Response')).toBeVisible();
    await expect(page.locator('text=Should Generate Recipe: No')).toBeVisible();
    
    // Verify educational content is provided
    await expect(page.locator('text=Is Educational: Yes')).toBeVisible();
  });

  test('should validate vegetarian meal plan with beef request', async ({ page }) => {
    // Set test user to vegetarian
    await page.click('button:has-text("Set Test User (Vegan)")');
    await page.click('button:has-text("Set Vegetarian")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegetarian');
    
    // Test the vegetarian beef meal plan scenario
    const beefScenario = page.locator('div:has-text("Vegetarian meal plan with beef")');
    await beefScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=beef')).toBeVisible();
  });

  test('should validate gluten-free meal plan with pasta request', async ({ page }) => {
    // Set test user to gluten-free
    await page.click('button:has-text("Set Test User (Vegan)")');
    await page.click('button:has-text("Set Gluten-Free")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=gluten-free');
    
    // Test the gluten-free pasta meal plan scenario
    const pastaScenario = page.locator('div:has-text("Gluten-free meal plan with pasta")');
    await pastaScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=pasta')).toBeVisible();
  });

  test('should validate valid vegan meal plan request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test the valid vegan meal plan scenario
    const validScenario = page.locator('div:has-text("Valid vegan meal plan")');
    await validScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows valid request
    await expect(page.locator('text=Valid')).toBeVisible();
    
    // Verify the conversation response allows recipe generation
    await expect(page.locator('text=Conversation Response')).toBeVisible();
    await expect(page.locator('text=Should Generate Recipe: Yes')).toBeVisible();
  });

  test('should handle complex meal plan with multiple restrictions', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test the complex meal plan scenario
    const complexScenario = page.locator('div:has-text("Complex meal plan with multiple restrictions")');
    await complexScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    
    // Check that multiple conflicting items are detected
    await expect(page.locator('text=fish')).toBeVisible();
    await expect(page.locator('text=dairy')).toBeVisible();
  });

  test('should generate compliant meal plan for valid request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Enter a valid meal plan request
    await page.fill('textarea[placeholder*="chicken, pasta, and vegetarian options"]', 
      'Create a vegan meal plan for the week with tofu, lentils, and vegetables');
    
    // Click generate meal plan button
    await page.click('button:has-text("Generate Meal Plan")');
    
    // Wait for meal plan to be generated
    await page.waitForSelector('text=Generated Meal Plan');
    
    // Verify meal plan was generated successfully
    await expect(page.locator('text=Generated Meal Plan')).toBeVisible();
    await expect(page.locator('text=Successfully generated meal plan')).toBeVisible();
    
    // Verify recipes were generated
    await expect(page.locator('text=Recipes Generated')).toBeVisible();
    
    // Check that some recipes are displayed
    const recipeCards = page.locator('.border.rounded-lg.p-3.bg-gray-50');
    await expect(recipeCards).toHaveCount.greaterThan(0);
  });

  test('should reject meal plan generation for conflicting request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Enter a conflicting meal plan request
    await page.fill('textarea[placeholder*="chicken, pasta, and vegetarian options"]', 
      'I need a meal plan for the week, but I want to include grilled chicken for protein');
    
    // Click generate meal plan button
    await page.click('button:has-text("Generate Meal Plan")');
    
    // Wait for error message
    await page.waitForSelector('text=Meal plan request conflicts with your dietary preferences');
    
    // Verify validation results are shown
    await expect(page.locator('text=Validation Results')).toBeVisible();
    await expect(page.locator('text=Invalid')).toBeVisible();
  });

  test('should provide alternative ingredients for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show alternatives
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify alternatives are provided
    await expect(page.locator('text=Alternative Ingredients')).toBeVisible();
    
    // Check that some alternative ingredients are shown
    const alternatives = page.locator('text=Alternative Ingredients').locator('..').locator('.badge');
    await expect(alternatives).toHaveCount.greaterThan(0);
  });

  test('should show educational content for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show educational content
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button:has-text("Test")').click();
    
    // Wait for conversation results
    await page.waitForSelector('text=Conversation Response');
    
    // Verify educational content is provided
    await expect(page.locator('text=Is Educational: Yes')).toBeVisible();
    
    // Verify the message contains helpful information
    const message = page.locator('text=Conversation Response').locator('..').locator('p');
    await expect(message).toContainText('vegan');
    await expect(message).toContainText('chicken');
  });

  test('should handle custom meal planning requests', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Enter custom meal plan request
    await page.fill('textarea[placeholder*="chicken, pasta, and vegetarian options"]', 
      'I want a meal plan that includes salmon sushi and dairy products');
    
    // Click test validation button
    await page.click('button:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    
    // Check that multiple conflicting items are detected
    await expect(page.locator('text=salmon')).toBeVisible();
    await expect(page.locator('text=dairy')).toBeVisible();
  });

  test('should validate meal planning with skill level considerations', async ({ page }) => {
    // Set test user to vegan (beginner skill level)
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=beginner');
    
    // Enter a meal plan request with complex ingredients
    await page.fill('textarea[placeholder*="chicken, pasta, and vegetarian options"]', 
      'I need a meal plan that includes sous vide cooking and complex French techniques');
    
    // Click test validation button
    await page.click('button:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows ingredient conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=ingredient')).toBeVisible();
  });

  test('should provide helpful suggestions for meal planning conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show suggestions
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify suggestions are provided
    await expect(page.locator('text=Suggestion')).toBeVisible();
    
    // Verify alternative prompts are provided
    await expect(page.locator('text=Alternative Prompt')).toBeVisible();
    
    // Check that the suggestion is helpful
    const suggestion = page.locator('text=Suggestion').locator('..').locator('p');
    await expect(suggestion).toContainText('vegan');
    await expect(suggestion).toContainText('alternative');
  });

  test('should display meal plan recipes with proper formatting', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Enter a valid meal plan request
    await page.fill('textarea[placeholder*="chicken, pasta, and vegetarian options"]', 
      'Create a vegan meal plan for the week with tofu, lentils, and vegetables');
    
    // Click generate meal plan button
    await page.click('button:has-text("Generate Meal Plan")');
    
    // Wait for meal plan to be generated
    await page.waitForSelector('text=Generated Meal Plan');
    
    // Verify recipe cards are properly formatted
    const recipeCards = page.locator('.border.rounded-lg.p-3.bg-gray-50');
    await expect(recipeCards).toHaveCount.greaterThan(0);
    
    // Check that recipe information is displayed
    for (let i = 0; i < Math.min(3, await recipeCards.count()); i++) {
      const card = recipeCards.nth(i);
      await expect(card.locator('h4')).toBeVisible(); // Recipe title
      await expect(card.locator('p')).toBeVisible(); // Recipe details
      await expect(card.locator('.badge')).toBeVisible(); // Recipe tags
    }
  });
});
