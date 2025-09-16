# Prompt Layer Validation Testing Guide

This document describes how to test the prompt validation system that ensures user dietary preferences are respected when generating recipes and meal plans.

## Overview

The prompt validation system prevents users from requesting recipes that conflict with their dietary restrictions (e.g., a vegan user requesting chicken recipes). Instead, it provides educational responses and suggests alternatives.

## Features Tested

### 1. Dietary Restriction Validation
- **Vegan restrictions**: Blocks requests for meat, fish, eggs, dairy
- **Vegetarian restrictions**: Blocks requests for meat and fish
- **Gluten-free restrictions**: Blocks requests for wheat, pasta, bread
- **Dairy-free restrictions**: Blocks requests for milk, cheese, butter

### 2. Recipe Generation Validation
- Validates user prompts before generating recipes
- Provides helpful alternatives when conflicts are detected
- Generates educational content about dietary restrictions

### 3. Meal Planning Validation
- Validates meal plan requests against dietary preferences
- Generates compliant meal plans when requests are valid
- Rejects meal plan generation for conflicting requests

## Test Pages

### 1. Basic Prompt Validation (`/test-prompt`)
Tests individual recipe requests and prompt validation.

### 2. Meal Planning Validation (`/test-meal-planning`)
Tests meal planning requests and validation.

## Running Tests

### Prerequisites
1. Ensure the development server is running: `npm run dev`
2. Install Playwright: `npm install -D playwright`
3. Install Playwright browsers: `npx playwright install`

### Test Commands

```bash
# Run all Playwright tests
npm run test:e2e

# Run tests with UI (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/prompt-validation.spec.ts
npx playwright test tests/meal-planning.spec.ts
```

## Test Scenarios

### Recipe Generation Tests

#### 1. Vegan User Requesting Chicken
- **Test**: User with vegan preferences asks for chicken recipe
- **Expected**: Validation fails, dietary conflict detected
- **Response**: Educational message with tofu/plant-based alternatives

#### 2. Vegetarian User Requesting Beef
- **Test**: User with vegetarian preferences asks for beef recipe
- **Expected**: Validation fails, dietary conflict detected
- **Response**: Educational message with plant-based alternatives

#### 3. Gluten-Free User Requesting Pasta
- **Test**: User with gluten-free preferences asks for pasta recipe
- **Expected**: Validation fails, dietary conflict detected
- **Response**: Educational message with gluten-free alternatives

#### 4. Valid Vegan Request
- **Test**: User with vegan preferences asks for tofu recipe
- **Expected**: Validation passes, recipe generation proceeds
- **Response**: Confirmation and recipe generation

### Meal Planning Tests

#### 1. Vegan Meal Plan with Chicken Request
- **Test**: User requests meal plan including chicken
- **Expected**: Validation fails, meal plan generation blocked
- **Response**: Educational content and alternative suggestions

#### 2. Complex Dietary Restrictions
- **Test**: User with multiple restrictions requests conflicting ingredients
- **Expected**: Validation fails, multiple conflicts detected
- **Response**: Comprehensive educational content

#### 3. Valid Meal Plan Request
- **Test**: User requests compliant meal plan
- **Expected**: Validation passes, meal plan generated
- **Response**: 7-day meal plan with recipes

## Manual Testing

### Step 1: Set User Preferences
1. Navigate to `/test-prompt` or `/test-meal-planning`
2. Click "Set Test User (Vegan)" to set vegan preferences
3. Verify preferences are displayed correctly

### Step 2: Test Validation
1. Choose a test scenario or enter custom prompt
2. Click "Test" or "Test Validation" button
3. Review validation results and conversation response

### Step 3: Test Recipe Generation
1. Enter a valid prompt that respects dietary preferences
2. Click "Generate Meal Plan" (for meal planning) or let recipe generation proceed
3. Verify recipes are generated and respect preferences

## Expected Behaviors

### For Invalid Requests
- ✅ Validation shows "Invalid" status
- ✅ Conflict type is identified (dietary, cuisine, ingredient)
- ✅ Conflicting items are listed
- ✅ Helpful suggestions are provided
- ✅ Alternative ingredients are suggested
- ✅ Educational content is displayed
- ✅ Recipe generation is blocked

### For Valid Requests
- ✅ Validation shows "Valid" status
- ✅ No conflicts detected
- ✅ Recipe generation proceeds
- ✅ Generated recipes respect dietary preferences

## Test Data

### Dietary Restrictions Tested
- `vegan`: No animal products
- `vegetarian`: No meat/fish
- `gluten-free`: No wheat/gluten
- `dairy-free`: No dairy products
- `keto`: Low-carb, high-fat
- `low-carb`: Reduced carbohydrates
- `paleo`: Whole foods only

### Common Conflicts
- **Vegan**: chicken, beef, fish, eggs, milk, cheese
- **Vegetarian**: chicken, beef, fish, pork
- **Gluten-free**: wheat, pasta, bread, soy sauce
- **Dairy-free**: milk, cheese, yogurt, butter

### Alternative Ingredients
- **Chicken alternatives**: tofu, tempeh, seitan, chickpeas
- **Beef alternatives**: portobello mushrooms, jackfruit, lentils
- **Pasta alternatives**: zucchini noodles, rice noodles, quinoa pasta
- **Milk alternatives**: almond milk, soy milk, oat milk

## Troubleshooting

### Common Issues

#### 1. Tests Fail to Load
- Ensure development server is running on port 3000
- Check that test pages are accessible in browser
- Verify Playwright is properly installed

#### 2. Validation Not Working
- Check browser console for JavaScript errors
- Verify user preferences are properly set
- Ensure prompt validation service is imported correctly

#### 3. Recipe Generation Fails
- Check Gemini API key configuration
- Verify Firebase connection for image processing
- Check network requests in browser dev tools

### Debug Mode
Run tests in debug mode to step through execution:
```bash
npm run test:e2e:debug
```

## Performance Considerations

### Test Execution Time
- Individual validation tests: ~2-5 seconds
- Recipe generation tests: ~10-30 seconds
- Full test suite: ~2-5 minutes

### Browser Performance
- Tests run in parallel for faster execution
- Screenshots and videos captured on failure
- Trace files generated for debugging

## Continuous Integration

### GitHub Actions
Tests can be integrated into CI/CD pipelines:
```yaml
- name: Run Playwright Tests
  run: npm run test:e2e
```

### Docker Support
Tests can run in containerized environments:
```bash
docker run --rm -v $(pwd):/app -w /app mcr.microsoft.com/playwright:latest npm run test:e2e
```

## Contributing

### Adding New Test Scenarios
1. Add test case to appropriate test file
2. Update test scenarios array in test pages
3. Ensure test covers both validation and response
4. Add appropriate assertions for expected behavior

### Extending Validation Logic
1. Update `prompt-validation-service.ts`
2. Add new conflict types and detection logic
3. Update test cases to cover new scenarios
4. Document new functionality

## Support

For issues or questions about the prompt validation system:
1. Check browser console for errors
2. Review test output for specific failure details
3. Verify user preferences and test data
4. Check API configurations and dependencies
