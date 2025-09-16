import { test, expect } from '@playwright/test';

test.describe('Simple Prompt Layer Validation', () => {
  test('should validate dietary restrictions in test page', async ({ page }) => {
    // Navigate to the test meal planning page
    await page.goto('/test-meal-planning');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Meal Planning Prompt Validation Test")');
    
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test requesting a chicken recipe
    const chickenRequest = 'I want a recipe for grilled chicken breast';
    await page.fill('#meal-plan-request', chickenRequest);
    
    // Test validation
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
  });

  test('should accept valid vegan recipe request', async ({ page }) => {
    // Navigate to the test meal planning page
    await page.goto('/test-meal-planning');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Meal Planning Prompt Validation Test")');
    
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test valid vegan recipe request
    const validRequest = 'I want a recipe for tofu stir fry with vegetables';
    await page.fill('#meal-plan-request', validRequest);
    
    // Test validation
    await page.click('button[data-slot="button"]:has-text("Test Validation")');
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify that the request was accepted
    await expect(page.locator('text=Valid').first()).toBeVisible();
  });

  test('should provide alternatives for dietary conflicts', async ({ page }) => {
    // Navigate to the test meal planning page
    await page.goto('/test-meal-planning');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Meal Planning Prompt Validation Test")');
    
    // Set test user to vegan
    await page.click('button:has-text("Set Test User (Vegan)")');
    
    // Wait for preferences to be set
    await page.waitForSelector('text=Vegan', { timeout: 10000 });
    
    // Test the vegan chicken meal plan scenario
    const chickenScenario = page.locator('div:has-text("Vegan meal plan with chicken request")');
    await chickenScenario.locator('button[data-slot="button"]:has-text("Test")').first().click();
    
    // Wait for validation results
    await page.waitForSelector('text=Validation Results', { timeout: 10000 });
    
    // Verify alternatives are suggested
    await expect(page.locator('text=tofu').first()).toBeVisible();
    await expect(page.locator('text=tempeh').first()).toBeVisible();
    await expect(page.locator('text=chickpeas').first()).toBeVisible();
    
    // Verify the professional chef response
    await expect(page.locator('text=Would you like me to suggest a delicious vegan alternative').first()).toBeVisible();
  });
});
