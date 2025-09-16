import { test, expect } from '@playwright/test';

test.describe('Prompt Layer Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test-prompt');
  });

  test('should validate vegan user requesting chicken recipe', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test the vegan chicken scenario
    await page.click('button:has-text("Test")');
    
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

  test('should validate vegetarian user requesting beef recipe', async ({ page }) => {
    // Set test user to vegetarian
    await page.click('button:has-text("Set Test User (Vegan)")');
    await page.click('button:has-text("Set Vegetarian")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegetarian');
    
    // Test the vegetarian beef scenario
    const beefScenario = page.locator('div:has-text("Vegetarian requesting beef")');
    await beefScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=beef')).toBeVisible();
  });

  test('should validate gluten-free user requesting pasta recipe', async ({ page }) => {
    // Set test user to gluten-free
    await page.click('button:has-text("Set Test User (Vegan)")');
    await page.click('button:has-text("Set Gluten-Free")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=gluten-free');
    
    // Test the gluten-free pasta scenario
    const pastaScenario = page.locator('div:has-text("Gluten-free requesting pasta")');
    await pastaScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=pasta')).toBeVisible();
  });

  test('should validate valid vegan recipe request', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test the valid vegan scenario
    const validScenario = page.locator('div:has-text("Valid vegan request")');
    await validScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows valid request
    await expect(page.locator('text=Valid')).toBeVisible();
    
    // Verify the conversation response allows recipe generation
    await expect(page.locator('text=Conversation Response')).toBeVisible();
    await expect(page.locator('text=Should Generate Recipe: Yes')).toBeVisible();
  });

  test('should validate skill level conflict for beginner user', async ({ page }) => {
    // Set test user to vegan (beginner skill level)
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=beginner');
    
    // Test the skill level conflict scenario
    const skillScenario = page.locator('div:has-text("Skill level conflict")');
    await skillScenario.locator('button:has-text("Test")').click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows ingredient conflict
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=ingredient')).toBeVisible();
    
    // Verify the conversation response
    await expect(page.locator('text=Conversation Response')).toBeVisible();
    await expect(page.locator('text=Is Educational: Yes')).toBeVisible();
  });

  test('should handle custom prompt validation', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Enter custom prompt
    await page.fill('input[placeholder*="chicken curry"]', 'I want a recipe for salmon sushi');
    
    // Click test button
    await page.click('button:has-text("Test Prompt")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify the validation shows dietary conflict for fish
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    await expect(page.locator('text=salmon')).toBeVisible();
  });

  test('should provide alternative ingredients for dietary conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show alternatives
    await page.click('button:has-text("Test")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify alternatives are provided
    await expect(page.locator('text=Alternative Ingredients')).toBeVisible();
    
    // Check that some alternative ingredients are shown
    const alternatives = page.locator('text=Alternative Ingredients').locator('..').locator('.badge');
    await expect(alternatives).toHaveCount.greaterThan(0);
  });

  test('should show educational content for dietary conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show educational content
    await page.click('button:has-text("Test")');
    
    // Wait for conversation results
    await page.waitForSelector('text=Conversation Response');
    
    // Verify educational content is provided
    await expect(page.locator('text=Is Educational: Yes')).toBeVisible();
    
    // Verify the message contains helpful information
    const message = page.locator('text=Conversation Response').locator('..').locator('p');
    await expect(message).toContainText('vegan');
    await expect(message).toContainText('chicken');
  });

  test('should handle multiple dietary restrictions', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a complex scenario
    await page.fill('input[placeholder*="chicken curry"]', 'I want a recipe with chicken, eggs, and cheese');
    
    // Click test button
    await page.click('button:has-text("Test Prompt")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results');
    
    // Verify multiple conflicts are detected
    await expect(page.locator('text=Invalid')).toBeVisible();
    await expect(page.locator('text=dietary')).toBeVisible();
    
    // Check that multiple conflicting items are shown
    const conflictingItems = page.locator('text=Conflicting Items').locator('..').locator('.badge');
    await expect(conflictingItems).toHaveCount.greaterThan(1);
  });

  test('should provide helpful suggestions for dietary conflicts', async ({ page }) => {
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to load
    await page.waitForSelector('text=vegan');
    
    // Test a scenario that should show suggestions
    await page.click('button:has-text("Test")');
    
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
});
