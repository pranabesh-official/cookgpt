import { test, expect } from '@playwright/test';

test.describe('Enhanced Chat Conversation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page
    await page.goto('/dashboard');
    
    // Wait for the page to load and chat interface to be ready
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
  });

  test('should display professional welcome message', async ({ page }) => {
    // Check that the welcome message is professional and human-like
    const welcomeMessage = page.locator('[data-testid="chat-message"]').first();
    await expect(welcomeMessage).toBeVisible();
    
    const messageText = await welcomeMessage.textContent();
    expect(messageText).toContain('AI chef and dietitian assistant');
    expect(messageText).toContain('professional culinary guidance');
    expect(messageText).toContain('personalized recipe recommendations');
  });

  test('should handle recipe requests with enhanced conversation', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Send a recipe request
    await chatInput.fill('I need some healthy dinner recipes for tonight');
    await sendButton.click();
    
    // Wait for the AI response
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    // Check that the response is professional and conversational
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify enhanced language patterns
    expect(responseText).toMatch(/(As your AI chef|In my experience|Here's a chef's secret|Professional approach)/i);
    expect(responseText).toContain('personalized');
    expect(responseText).toMatch(/(recipes?|culinary|nutritional)/i);
    
    // Check for recipe cards
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount({ min: 1, max: 7 });
  });

  test('should provide contextual cooking advice', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Ask for cooking technique help
    await chatInput.fill('How do I properly sauté vegetables?');
    await sendButton.click();
    
    // Wait for response
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify professional chef language
    expect(responseText).toMatch(/(professional|technique|chef|culinary)/i);
    expect(responseText).toMatch(/(sauté|heat|pan|temperature)/i);
    
    // Check for cooking tips
    await expect(page.locator('[data-testid="cooking-tip"]')).toHaveCount({ min: 1 });
  });

  test('should show enhanced follow-up questions', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Send a general cooking question
    await chatInput.fill('I want to improve my cooking skills');
    await sendButton.click();
    
    // Wait for response with follow-up questions
    await page.waitForSelector('[data-testid="follow-up-questions"]', { timeout: 15000 });
    
    const followUpQuestions = page.locator('[data-testid="follow-up-question"]');
    await expect(followUpQuestions).toHaveCount({ min: 2, max: 4 });
    
    // Verify questions are contextual and professional
    const firstQuestion = await followUpQuestions.first().textContent();
    expect(firstQuestion).toMatch(/(technique|skill|recipe|cooking|culinary)/i);
  });

  test('should handle ingredient-based requests professionally', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Send ingredient-based request
    await chatInput.fill('I have chicken, broccoli, and rice. What can I make?');
    await sendButton.click();
    
    // Wait for response
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify ingredient recognition and professional response
    expect(responseText).toContain('chicken');
    expect(responseText).toContain('broccoli');
    expect(responseText).toContain('rice');
    expect(responseText).toMatch(/(delicious|recipes|ingredients|culinary)/i);
    
    // Check for generated recipes
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount({ min: 1 });
  });

  test('should provide nutritional advice with professional tone', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Ask for nutritional advice
    await chatInput.fill('What are some healthy meal options for weight loss?');
    await sendButton.click();
    
    // Wait for response
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify dietitian language and professional advice
    expect(responseText).toMatch(/(dietitian|nutritional|healthy|balanced)/i);
    expect(responseText).toMatch(/(weight loss|calories|nutrition)/i);
    
    // Check for nutritional advice section
    await expect(page.locator('[data-testid="nutritional-advice"]')).toBeVisible();
  });

  test('should maintain conversation context and memory', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // First message about dietary preferences
    await chatInput.fill('I follow a vegetarian diet');
    await sendButton.click();
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    // Second message asking for recipes
    await chatInput.fill('Can you suggest some dinner recipes?');
    await sendButton.click();
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(5)', { timeout: 15000 });
    
    const secondResponse = page.locator('[data-testid="chat-message"]').nth(4);
    const responseText = await secondResponse.textContent();
    
    // Verify context awareness - should remember vegetarian preference
    expect(responseText).toMatch(/(vegetarian|plant-based|dietary preferences)/i);
    
    // Check that generated recipes are vegetarian
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    const firstRecipeText = await recipeCards.first().textContent();
    expect(firstRecipeText).not.toMatch(/(chicken|beef|pork|fish|meat)/i);
  });

  test('should handle cooking troubleshooting with expert advice', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Ask for troubleshooting help
    await chatInput.fill('My pasta always turns out mushy. What am I doing wrong?');
    await sendButton.click();
    
    // Wait for response
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify troubleshooting language and professional advice
    expect(responseText).toMatch(/(professional|chef|technique|cooking)/i);
    expect(responseText).toMatch(/(pasta|al dente|water|timing)/i);
    
    // Check for cooking tips related to pasta
    const cookingTips = page.locator('[data-testid="cooking-tip"]');
    await expect(cookingTips).toHaveCount({ min: 1 });
    
    const tipText = await cookingTips.first().textContent();
    expect(tipText).toMatch(/(pasta|water|salt|timing|texture)/i);
  });

  test('should adapt language to user skill level', async ({ page }) => {
    // Test with beginner-level language
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await chatInput.fill('I\'m new to cooking and need help with basic techniques');
    await sendButton.click();
    
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    const aiResponse = page.locator('[data-testid="chat-message"]').nth(2);
    const responseText = await aiResponse.textContent();
    
    // Verify beginner-friendly language
    expect(responseText).toMatch(/(beginner|start|basic|foundation|learn)/i);
    expect(responseText).toMatch(/(welcome|journey|confidence|step)/i);
    
    // Check for beginner-appropriate follow-up questions
    const followUpQuestions = page.locator('[data-testid="follow-up-question"]');
    const questionText = await followUpQuestions.first().textContent();
    expect(questionText).toMatch(/(basic|fundamental|start|learn)/i);
  });

  test('should provide recipe count based on request specificity', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Specific request should return fewer recipes
    await chatInput.fill('I need one quick chicken breast recipe for dinner tonight');
    await sendButton.click();
    
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 15000 });
    
    // Should return 1-2 recipes for specific request
    const specificRecipeCount = await page.locator('[data-testid="recipe-card"]').count();
    expect(specificRecipeCount).toBeLessThanOrEqual(2);
    
    // Clear chat and try general request
    await page.reload();
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    await chatInput.fill('I want some dinner ideas');
    await sendButton.click();
    
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 15000 });
    
    // Should return more recipes for general request
    const generalRecipeCount = await page.locator('[data-testid="recipe-card"]').count();
    expect(generalRecipeCount).toBeGreaterThanOrEqual(3);
  });

  test('should save and load conversation history', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Send a message to create conversation history
    await chatInput.fill('I love Italian cuisine');
    await sendButton.click();
    
    await page.waitForSelector('[data-testid="chat-message"]:nth-child(3)', { timeout: 15000 });
    
    // Check that conversation is auto-saved
    await page.waitForTimeout(2000); // Allow time for auto-save
    
    // Open sidebar to check chat history
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    await sidebarToggle.click();
    
    // Check for saved conversation in history
    const chatHistoryItems = page.locator('[data-testid="chat-history-item"]');
    await expect(chatHistoryItems).toHaveCount({ min: 1 });
    
    const firstHistoryItem = chatHistoryItems.first();
    const historyText = await firstHistoryItem.textContent();
    expect(historyText).toContain('Italian');
  });
});