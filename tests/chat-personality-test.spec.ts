import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive personality and conversation flow tests for enhanced LangChain chat
 */
test.describe('ChefGPT Personality & Conversation Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Handle login if needed
    if (await page.locator('text=Sign In').isVisible()) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    }
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should demonstrate warm and enthusiastic personality', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Test various personality indicators
    const testMessages = [
      'Hello!',
      'I\'m excited to learn cooking!',
      'What\'s your favorite recipe?',
      'I made my first dish today!'
    ];

    for (const message of testMessages) {
      await chatInput.fill(message);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
      
      const response = page.locator('[data-testid="bot-message"]').last();
      const responseText = await response.textContent();
      
      // Check for enthusiastic language
      const enthusiasticWords = ['wonderful', 'amazing', 'excited', 'love', 'fantastic', 'delightful'];
      const hasEnthusiasm = enthusiasticWords.some(word => 
        responseText?.toLowerCase().includes(word)
      );
      
      expect(hasEnthusiasm).toBeTruthy();
    }
  });

  test('should adapt tone based on user emotional state', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Test encouraging tone for discouraged user
    await chatInput.fill('I failed at cooking again, I\'m terrible at this');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const encouragingResponse = page.locator('[data-testid="bot-message"]').last();
    const encouragingText = await encouragingResponse.textContent();
    
    expect(encouragingText).toMatch(/don\'t worry|everyone|practice|improve|proud|great/i);
    
    // Test excited tone for enthusiastic user
    await chatInput.fill('I just mastered making perfect pasta! I\'m so excited!');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const excitedResponse = page.locator('[data-testid="bot-message"]').last();
    const excitedText = await excitedResponse.textContent();
    
    expect(excitedText).toMatch(/amazing|fantastic|wonderful|congratulations|proud/i);
  });

  test('should provide contextual cooking advice with personality', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Test seasonal cooking advice
    await chatInput.fill('It\'s winter and I want something warm and comforting');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const seasonalResponse = page.locator('[data-testid="bot-message"]').last();
    const seasonalText = await seasonalResponse.textContent();
    
    expect(seasonalText).toMatch(/warm|comforting|cozy|perfect for winter/i);
    
    // Test time-sensitive advice
    await chatInput.fill('I only have 15 minutes to cook dinner');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const quickResponse = page.locator('[data-testid="bot-message"]').last();
    const quickText = await quickResponse.textContent();
    
    expect(quickText).toMatch(/quick|fast|15 minutes|perfect timing/i);
  });

  test('should remember and reference previous conversation topics', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Establish a topic
    await chatInput.fill('I\'m planning a dinner party for 8 people');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Reference the topic without restating it
    await chatInput.fill('What about appetizers?');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const contextResponse = page.locator('[data-testid="bot-message"]').last();
    const contextText = await contextResponse.textContent();
    
    // Should reference the dinner party context
    expect(contextText).toMatch(/dinner party|8 people|guests|party/i);
  });

  test('should provide educational content with appropriate enthusiasm', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    const educationalQuestions = [
      'Why do we need to let bread rise?',
      'What\'s the difference between baking powder and baking soda?',
      'How do I know when pasta is al dente?'
    ];

    for (const question of educationalQuestions) {
      await chatInput.fill(question);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
      
      const response = page.locator('[data-testid="bot-message"]').last();
      const responseText = await response.textContent();
      
      // Should be educational and enthusiastic
      expect(responseText).toMatch(/great question|wonderful|excellent|love that you asked/i);
      expect(responseText?.length).toBeGreaterThan(100); // Substantial educational content
    }
  });

  test('should handle dietary preferences with empathy and creativity', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    const dietaryScenarios = [
      'I\'m vegan and miss the taste of cheese',
      'I\'m gluten-free and want to bake bread',
      'I\'m allergic to nuts but love desserts'
    ];

    for (const scenario of dietaryScenarios) {
      await chatInput.fill(scenario);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
      
      const response = page.locator('[data-testid="bot-message"]').last();
      const responseText = await response.textContent();
      
      // Should be empathetic and offer creative solutions
      expect(responseText).toMatch(/understand|absolutely|wonderful|creative|alternative/i);
      expect(responseText).not.toMatch(/unfortunately|sorry|can\'t help/i);
    }
  });

  test('should celebrate user achievements and milestones', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    const achievements = [
      'I just made my first successful soufflé!',
      'I finally got the perfect sear on my steak',
      'I baked bread for the first time and it was amazing!'
    ];

    for (const achievement of achievements) {
      await chatInput.fill(achievement);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
      
      const response = page.locator('[data-testid="bot-message"]').last();
      const responseText = await response.textContent();
      
      // Should celebrate with enthusiasm
      expect(responseText).toMatch(/congratulations|amazing|fantastic|proud|wonderful|incredible/i);
      expect(responseText).toMatch(/🎉|✨|👨‍🍳/); // Should include celebratory emojis
    }
  });

  test('should provide cooking tips with encouraging language', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    await chatInput.fill('I always burn my garlic, what am I doing wrong?');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const response = page.locator('[data-testid="bot-message"]').last();
    const responseText = await response.textContent();
    
    // Should provide helpful tips with encouraging tone
    expect(responseText).toMatch(/don\'t worry|common|easy fix|you\'ll get it|practice/i);
    expect(responseText).toMatch(/heat|low|medium|watch|stir/i); // Actual cooking advice
  });

  test('should handle complex multi-part conversations naturally', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    // Start a complex conversation
    await chatInput.fill('I want to learn Italian cooking');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Build on the conversation
    await chatInput.fill('I\'m particularly interested in pasta');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Add more context
    await chatInput.fill('I have a pasta machine but I\'m a beginner');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    // Ask for specific help
    await chatInput.fill('What should I start with?');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const finalResponse = page.locator('[data-testid="bot-message"]').last();
    const finalText = await finalResponse.textContent();
    
    // Should reference all the context: Italian, pasta, machine, beginner
    expect(finalText).toMatch(/italian|pasta|machine|beginner|start/i);
    expect(finalText).toMatch(/perfect|wonderful|great choice/i); // Encouraging tone
  });

  test('should use appropriate emojis and formatting for personality', async () => {
    const chatInput = page.locator('textarea[placeholder*="Ask me about recipes"]');
    
    await chatInput.fill('I\'m so excited to cook something special!');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
    
    const response = page.locator('[data-testid="bot-message"]').last();
    const responseText = await response.textContent();
    
    // Should use appropriate emojis
    expect(responseText).toMatch(/👨‍🍳|✨|🎉|🍳/);
    
    // Should use exclamation marks for enthusiasm
    expect(responseText).toMatch(/!/);
  });
});

// Helper functions for personality testing
async function checkPersonalityTone(page: Page, expectedTone: 'encouraging' | 'excited' | 'patient' | 'helpful') {
  const response = page.locator('[data-testid="bot-message"]').last();
  const responseText = await response.textContent();
  
  const toneWords = {
    encouraging: ['wonderful', 'great', 'amazing', 'proud', 'excellent'],
    excited: ['fantastic', 'incredible', 'love', 'excited', 'delightful'],
    patient: ['don\'t worry', 'take your time', 'practice', 'everyone', 'beginner'],
    helpful: ['here\'s how', 'let me help', 'perfect', 'exactly', 'right']
  };
  
  const words = toneWords[expectedTone];
  return words.some(word => responseText?.toLowerCase().includes(word));
}

async function checkEmotionalIntelligence(page: Page, userEmotion: 'discouraged' | 'excited' | 'confused' | 'proud') {
  const response = page.locator('[data-testid="bot-message"]').last();
  const responseText = await response.textContent();
  
  const appropriateResponses = {
    discouraged: ['don\'t worry', 'everyone', 'practice', 'improve', 'proud'],
    excited: ['amazing', 'fantastic', 'love your enthusiasm', 'wonderful'],
    confused: ['let me explain', 'great question', 'here\'s how', 'don\'t worry'],
    proud: ['congratulations', 'amazing', 'fantastic', 'proud', 'wonderful']
  };
  
  const words = appropriateResponses[userEmotion];
  return words.some(word => responseText?.toLowerCase().includes(word));
}
