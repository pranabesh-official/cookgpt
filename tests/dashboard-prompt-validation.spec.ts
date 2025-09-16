import { test, expect } from '@playwright/test';

test.describe('Dashboard Prompt Layer Validation - Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Recipe Assistant")');
    
    // Wait for authentication to complete
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]', { timeout: 30000 });
  });

  test('should reject chicken recipe request for vegan user in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request for chicken recipe
    const chickenRequest = 'I want a recipe for grilled chicken breast';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', chickenRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the system detects the dietary conflict
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=chicken').first()).toBeVisible();
    
    // Verify the system acts as a professional chef
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=tofu').first()).toBeVisible();
    await expect(page.locator('text=tempeh').first()).toBeVisible();
    await expect(page.locator('text=chickpeas').first()).toBeVisible();
  });

  test('should reject meal plan with conflicting ingredients in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a meal plan request with conflicting ingredients
    const mealPlanRequest = 'Create a meal plan for the week that includes grilled chicken, fish tacos, and beef stir fry';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', mealPlanRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the system detects multiple conflicts
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=chicken').first()).toBeVisible();
    await expect(page.locator('text=fish').first()).toBeVisible();
    await expect(page.locator('text=beef').first()).toBeVisible();
    
    // Verify the system provides helpful alternatives
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should accept valid vegan recipe request in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a valid vegan recipe request
    const validRequest = 'I want a recipe for tofu stir fry with vegetables';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', validRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response indicating recipe generation
    await page.waitForSelector('text=I\'m analyzing your preferences and generating', { timeout: 15000 });
    
    // Verify the system proceeds with recipe generation
    await expect(page.locator('text=personalized recipes with AI-generated images').first()).toBeVisible();
    
    // Wait for recipes to be generated
    await page.waitForSelector('text=Perfect! I\'ve generated', { timeout: 30000 });
    
    // Verify recipes are displayed
    await expect(page.locator('text=personalized recipes with custom AI-generated images').first()).toBeVisible();
  });

  test('should provide educational content for dietary conflicts in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request that conflicts with dietary preferences
    const conflictingRequest = 'I want to make a delicious salmon sushi roll';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', conflictingRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the system provides educational content
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=salmon').first()).toBeVisible();
    
    // Verify the system explains the conflict
    await expect(page.locator('text=You\'ve selected vegan as a dietary restriction, but you\'re asking for salmon').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should handle meal planning requests in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a meal planning request
    const mealPlanRequest = 'Help me plan meals for this week';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', mealPlanRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I\'m analyzing your preferences and generating', { timeout: 15000 });
    
    // Verify the system proceeds with meal planning
    await expect(page.locator('text=personalized recipes with AI-generated images').first()).toBeVisible();
    
    // Wait for the meal plan to be generated
    await page.waitForSelector('text=Perfect! I\'ve generated', { timeout: 30000 });
    
    // Verify meal plan is displayed
    await expect(page.locator('text=personalized recipes with custom AI-generated images').first()).toBeVisible();
  });

  test('should reject complex cooking techniques for beginner users', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request for complex cooking techniques
    const complexRequest = 'I want to make sous vide duck breast with truffle sauce';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', complexRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'re asking for a recipe with', { timeout: 15000 });
    
    // Verify the system detects skill level conflict
    await expect(page.locator('text=sous vide').first()).toBeVisible();
    await expect(page.locator('text=beginner').first()).toBeVisible();
    
    // Verify the system provides helpful suggestions
    await expect(page.locator('text=Would you like me to suggest a beginner-friendly version').first()).toBeVisible();
  });

  test('should provide helpful suggestions for dietary alternatives', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request for dairy-based recipe
    const dairyRequest = 'I want to make a creamy mac and cheese';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', dairyRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the system detects the conflict
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=cheese').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=nutritional yeast').first()).toBeVisible();
    await expect(page.locator('text=cashew cheese').first()).toBeVisible();
    
    // Verify the system offers to create an alternative recipe
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should handle multiple dietary restrictions in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request that conflicts with multiple restrictions
    const multiConflictRequest = 'I want a meal plan that includes fish, dairy, and gluten';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', multiConflictRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify multiple conflicts are detected
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=fish').first()).toBeVisible();
    await expect(page.locator('text=dairy').first()).toBeVisible();
    await expect(page.locator('text=gluten').first()).toBeVisible();
    
    // Verify the system provides comprehensive alternatives
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });

  test('should generate recipes for valid requests in chat', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a valid recipe request
    const validRequest = 'I want a quick vegan pasta recipe';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', validRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response indicating recipe generation
    await page.waitForSelector('text=I\'m analyzing your preferences and generating', { timeout: 15000 });
    
    // Verify the system proceeds with recipe generation
    await expect(page.locator('text=personalized recipes with AI-generated images').first()).toBeVisible();
    
    // Wait for recipes to be generated
    await page.waitForSelector('text=Perfect! I\'ve generated', { timeout: 30000 });
    
    // Verify recipes are displayed with proper formatting
    await expect(page.locator('text=personalized recipes with custom AI-generated images').first()).toBeVisible();
    
    // Verify recipe cards are displayed
    await expect(page.locator('.recipe-card').first()).toBeVisible();
  });

  test('should provide professional chef guidance for all conflicts', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type a request that has multiple conflicts
    const complexRequest = 'I want to make a beef wellington with puff pastry and red wine sauce';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', complexRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the system acts as a professional chef
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=beef').first()).toBeVisible();
    
    // Verify the chef provides helpful alternatives
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
    
    // Verify alternatives are suggested
    await expect(page.locator('text=portobello mushrooms').first()).toBeVisible();
    await expect(page.locator('text=jackfruit').first()).toBeVisible();
    await expect(page.locator('text=lentils').first()).toBeVisible();
  });

  test('should handle follow-up questions after dietary conflicts', async ({ page }) => {
    // Wait for the chat interface to load
    await page.waitForSelector('textarea[placeholder*="Ask me about recipes"]');
    
    // Type initial conflicting request
    const initialRequest = 'I want a chicken curry recipe';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', initialRequest);
    
    // Send the message
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot response
    await page.waitForSelector('text=I notice you\'ve selected', { timeout: 15000 });
    
    // Verify the conflict is detected
    await expect(page.locator('text=vegan').first()).toBeVisible();
    await expect(page.locator('text=chicken').first()).toBeVisible();
    
    // Now ask a follow-up question
    const followUp = 'Yes, please suggest a vegan alternative';
    await page.fill('textarea[placeholder*="Ask me about recipes"]', followUp);
    
    // Send the follow-up
    await page.click('button[aria-label="Send message"]');
    
    // Wait for the bot to generate the alternative recipe
    await page.waitForSelector('text=I\'m analyzing your preferences and generating', { timeout: 15000 });
    
    // Verify the system proceeds with recipe generation
    await expect(page.locator('text=personalized recipes with AI-generated images').first()).toBeVisible();
  });
});
