import { test, expect, Page } from '@playwright/test';

// Test configuration for enhanced chat functionality
test.describe('Enhanced LangChain Chat E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Navigate to the dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to login (assuming there's a login flow)
    const loginButton = page.locator('text=Sign In').first();
    if (await loginButton.isVisible()) {
      // Mock login or use test credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    }
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display enhanced welcome message with ChefGPT personality', async () => {
    // Check for the enhanced welcome message
    const welcomeMessage = page.locator('text=ChefGPT').first();
    await expect(welcomeMessage).toBeVisible();
    
    // Check for personality indicators
    await expect(page.locator('text=👨‍🍳')).toBeVisible();
    await expect(page.locator('text=✨')).toBeVisible();
    await expect(page.locator('text=enthusiastic')).toBeVisible();
  });

  test('should handle human-like conversation flow', async () => {
    // Test greeting interaction
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('Hello! I\'m new to cooking and need some help');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for warm, encouraging response
    const botResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(botResponse).toContainText(/welcome|help|excited|great/i);
    
    // Test follow-up conversation
    await chatInput.fill('What should I cook for dinner tonight?');
    await page.keyboard.press('Enter');
    
    // Wait for recipe-focused response
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    const recipeResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(recipeResponse).toContainText(/recipe|dinner|cook|delicious/i);
  });

  test('should maintain conversation context and memory', async () => {
    // Start a conversation about Italian food
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('I love Italian food, what can you suggest?');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Follow up without mentioning Italian food again
    await chatInput.fill('What about something quick and easy?');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check that the bot remembers the Italian food context
    const contextResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(contextResponse).toContainText(/italian|pasta|pizza|risotto/i);
  });

  test('should provide educational content with appropriate tone', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('Why do we need to rest dough?');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for educational, patient tone
    const educationalResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(educationalResponse).toContainText(/gluten|relax|elastic|science/i);
    
    // Check for encouraging tone
    await expect(educationalResponse).toContainText(/great question|wonderful|excellent/i);
  });

  test('should handle dietary restrictions with empathy', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('I\'m vegetarian and want to make a hearty meal');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for empathetic, understanding response
    const dietaryResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(dietaryResponse).toContainText(/vegetarian|plant-based|delicious|perfect/i);
    
    // Should not suggest meat-based alternatives
    await expect(dietaryResponse).not.toContainText(/chicken|beef|pork|fish/i);
  });

  test('should adapt communication style based on user experience level', async () => {
    // Test beginner level
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('I\'m a complete beginner, how do I make pasta?');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for beginner-friendly language
    const beginnerResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(beginnerResponse).toContainText(/simple|easy|step-by-step|don\'t worry/i);
    
    // Test advanced level
    await chatInput.fill('I\'m an experienced chef, show me advanced techniques');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for more sophisticated language
    const advancedResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(advancedResponse).toContainText(/technique|method|refinement|mastery/i);
  });

  test('should provide emotional support and encouragement', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('I tried cooking but it didn\'t turn out well, I\'m discouraged');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check for encouraging, supportive response
    const supportiveResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(supportiveResponse).toContainText(/don\'t worry|everyone|practice|improve|encourage/i);
    
    // Should include positive reinforcement
    await expect(supportiveResponse).toContainText(/great|wonderful|amazing|proud/i);
  });

  test('should handle conversation flow transitions smoothly', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Start with a greeting
    await chatInput.fill('Hi there!');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Transition to recipe request
    await chatInput.fill('Actually, I need a quick lunch idea');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Transition to educational question
    await chatInput.fill('By the way, what\'s the difference between baking and roasting?');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Check that all transitions feel natural
    const messages = page.locator('[data-testid="bot-message"]');
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThanOrEqual(3);
    
    // Each response should feel connected to the previous context
    for (let i = 0; i < messageCount; i++) {
      const message = messages.nth(i);
      await expect(message).toBeVisible();
    }
  });

  test('should clear conversation memory when starting new chat', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Have a conversation
    await chatInput.fill('I love spicy food');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Start new chat
    const newChatButton = page.locator('text=New Recipe Chat').first();
    await newChatButton.click();
    
    // Wait for new welcome message
    await page.waitForSelector('text=ChefGPT', { timeout: 5000 });
    
    // Start new conversation without context
    await chatInput.fill('What should I cook?');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Should not reference previous spicy food preference
    const newResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(newResponse).not.toContainText(/spicy|hot|chili/i);
  });

  test('should handle error scenarios gracefully with friendly tone', async () => {
    // Simulate a scenario that might cause an error
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('Generate 1000 recipes at once');
    await page.keyboard.press('Enter');
    
    // Wait for response (should handle gracefully)
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 15000 });
    
    // Check for friendly error handling
    const errorResponse = page.locator('[data-testid="bot-message"]').last();
    await expect(errorResponse).toContainText(/help|sorry|try|again/i);
    
    // Should maintain positive tone even in error
    await expect(errorResponse).toContainText(/happy|love|assist/i);
  });

  test('should provide contextual recipe suggestions with personality', async () => {
    // Set up user preferences first (if there's a preferences page)
    await page.goto('http://localhost:3000/preferences');
    await page.waitForLoadState('networkidle');
    
    // Fill in some preferences
    await page.selectOption('select[name="cookingSkillLevel"]', 'beginner');
    await page.check('input[value="vegetarian"]');
    await page.click('button[type="submit"]');
    
    // Go back to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Request a recipe
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    await chatInput.fill('I want something healthy for dinner');
    await page.keyboard.press('Enter');
    
    // Wait for recipe generation
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 30000 });
    
    // Check that recipes are vegetarian and beginner-friendly
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    const firstRecipe = recipeCards.first();
    
    // Should not contain meat
    await expect(firstRecipe).not.toContainText(/chicken|beef|pork|fish/i);
    
    // Should be beginner-friendly
    await expect(firstRecipe).toContainText(/easy|simple|beginner/i);
  });
});

// Helper function to wait for chat response
async function waitForChatResponse(page: Page, timeout = 10000) {
  await page.waitForSelector('[data-testid="bot-message"]', { timeout });
  // Wait a bit more for any animations or loading states
  await page.waitForTimeout(1000);
}

// Helper function to check for personality indicators
async function checkPersonalityIndicators(page: Page, response: any) {
  const personalityWords = [
    'wonderful', 'amazing', 'delicious', 'perfect', 'excellent',
    'love', 'enjoy', 'delightful', 'fantastic', 'great'
  ];
  
  const responseText = await response.textContent();
  const hasPersonality = personalityWords.some(word => 
    responseText?.toLowerCase().includes(word)
  );
  
  return hasPersonality;
}
