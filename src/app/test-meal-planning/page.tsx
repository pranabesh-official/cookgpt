"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { handleRecipeRequest, generateCompliantRecipe } from '@/lib/conversation-service';
import { validateRecipeRequest } from '@/lib/prompt-validation-service';
import { toast } from 'sonner';

export default function TestMealPlanningPage() {
  const { userPreferences, testAuthenticate } = useAuth();
  const [mealPlanRequest, setMealPlanRequest] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [conversationResult, setConversationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any>(null);

  // Meal planning test scenarios
  const mealPlanningScenarios = [
    {
      name: 'Vegan meal plan with chicken request',
      prompt: 'I need a meal plan for the week, but I want to include grilled chicken for protein',
      description: 'Tests dietary restriction validation in meal planning context'
    },
    {
      name: 'Vegetarian meal plan with beef',
      prompt: 'Create a meal plan for me with beef stir fry and vegetarian options',
      description: 'Tests mixed dietary preferences in meal planning'
    },
    {
      name: 'Gluten-free meal plan with pasta',
      prompt: 'I need a gluten-free meal plan but want to include regular pasta dishes',
      description: 'Tests gluten restriction validation in meal planning'
    },
    {
      name: 'Valid vegan meal plan',
      prompt: 'Create a vegan meal plan for the week with tofu, lentils, and vegetables',
      description: 'Tests valid dietary request in meal planning'
    },
    {
      name: 'Complex meal plan with multiple restrictions',
      prompt: 'I need a meal plan that is vegan, gluten-free, and low-carb, but I want to include fish and dairy',
      description: 'Tests multiple conflicting dietary restrictions'
    }
  ];

  const runMealPlanningValidation = async (prompt: string) => {
    if (!userPreferences) {
      toast.error('Please set user preferences first');
      return;
    }

    setIsLoading(true);
    try {
      // Test the validation service
      const validation = validateRecipeRequest(prompt, userPreferences);
      setValidationResult(validation);

      // Test the conversation service
      const conversationContext = {
        userPreferences,
        chatHistory: [],
        currentTopic: 'meal_planning'
      };

      const conversation = await handleRecipeRequest(prompt, conversationContext);
      setConversationResult(conversation);

      toast.success('Meal planning validation completed');
    } catch (error) {
      console.error('Meal planning validation error:', error);
      toast.error('Meal planning validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!mealPlanRequest.trim()) {
      toast.error('Please enter a meal plan request');
      return;
    }

    if (!userPreferences) {
      toast.error('Please set user preferences first');
      return;
    }

    setIsLoading(true);
    try {
      // Validate the request first
      const validation = validateRecipeRequest(mealPlanRequest, userPreferences);
      
      if (!validation.isValid) {
        toast.error('Meal plan request conflicts with your dietary preferences');
        setValidationResult(validation);
        return;
      }

      // Generate compliant meal plan
      const conversationContext = {
        userPreferences,
        chatHistory: [],
        currentTopic: 'meal_planning'
      };

      const recipes = await generateCompliantRecipe(mealPlanRequest, conversationContext, 7);
      
      setGeneratedMealPlan({
        request: mealPlanRequest,
        recipes,
        validation: validation
      });

      toast.success('Meal plan generated successfully!');
    } catch (error) {
      console.error('Meal plan generation error:', error);
      toast.error('Failed to generate meal plan');
    } finally {
      setIsLoading(false);
    }
  };

  const runCustomMealPlanningTest = async () => {
    await runMealPlanningValidation(mealPlanRequest);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Meal Planning Prompt Validation Test</h1>
        <p className="text-gray-600 mb-4">
          Test the meal planning prompt validation system to ensure it properly handles dietary restrictions 
          and user preferences when generating weekly meal plans.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={() => testAuthenticate()}>
            Set Test User (Vegan)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.info('Would set preferences to: vegetarian')}
          >
            Set Vegetarian
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.info('Would set preferences to: gluten-free')}
          >
            Set Gluten-Free
          </Button>
        </div>
      </div>

      {/* Current Preferences Display */}
      {userPreferences && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current User Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-semibold">Dietary Restrictions:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userPreferences.dietaryRestrictions.length > 0 ? (
                    userPreferences.dietaryRestrictions.map(restriction => (
                      <Badge key={restriction} variant="secondary">
                        {restriction}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">None</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Skill Level:</Label>
                <Badge className="mt-2">{userPreferences.skillLevel}</Badge>
              </div>
              <div>
                <Label className="font-semibold">Cooking Time:</Label>
                <Badge className="mt-2">{userPreferences.cookingTime}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Planning Test Scenarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Meal Planning Test Scenarios</CardTitle>
          <CardDescription>
            Click on any scenario to test meal planning prompt validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mealPlanningScenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{scenario.name}</h3>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => runMealPlanningValidation(scenario.prompt)}
                    disabled={isLoading}
                  >
                    Test
                  </Button>
                </div>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  <strong>Prompt:</strong> "{scenario.prompt}"
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Meal Planning Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Custom Meal Planning Test</CardTitle>
          <CardDescription>
            Enter your own meal planning request to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal-plan-request">Meal Plan Request:</Label>
              <Input
                id="meal-plan-request"
                value={mealPlanRequest}
                onChange={(e) => setMealPlanRequest(e.target.value)}
                placeholder="e.g., I need a meal plan for the week that includes chicken, pasta, and vegetarian options"
                className="mt-2"
              />
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={runCustomMealPlanningTest}
                disabled={isLoading || !mealPlanRequest.trim()}
              >
                {isLoading ? 'Testing...' : 'Test Validation'}
              </Button>
              <Button 
                onClick={generateMealPlan}
                disabled={isLoading || !mealPlanRequest.trim()}
                variant="outline"
              >
                {isLoading ? 'Generating...' : 'Generate Meal Plan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results Display */}
      {validationResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Is Valid:</Label>
                <Badge 
                  variant={validationResult.isValid ? "default" : "destructive"}
                  className="ml-2"
                >
                  {validationResult.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
              
              {validationResult.conflictType && (
                <div>
                  <Label className="font-semibold">Conflict Type:</Label>
                  <Badge variant="outline" className="ml-2">
                    {validationResult.conflictType}
                  </Badge>
                </div>
              )}
              
              {validationResult.conflictingItems && (
                <div>
                  <Label className="font-semibold">Conflicting Items:</Label>
                  <div className="flex gap-2 mt-2">
                    {validationResult.conflictingItems.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {validationResult.suggestion && (
                <div>
                  <Label className="font-semibold">Suggestion:</Label>
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                    {validationResult.suggestion}
                  </p>
                </div>
              )}
              
              {validationResult.alternativePrompt && (
                <div>
                  <Label className="font-semibold">Alternative Prompt:</Label>
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                    {validationResult.alternativePrompt}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Results */}
      {conversationResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversation Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Message:</Label>
                <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                  {conversationResult.message}
                </p>
              </div>
              
              <div>
                <Label className="font-semibold">Should Generate Recipe:</Label>
                <Badge 
                  variant={conversationResult.shouldGenerateRecipe ? "default" : "secondary"}
                  className="ml-2"
                >
                  {conversationResult.shouldGenerateRecipe ? 'Yes' : 'No'}
                </Badge>
              </div>
              
              {conversationResult.alternatives && (
                <div>
                  <Label className="font-semibold">Alternative Ingredients:</Label>
                  <div className="flex gap-2 mt-2">
                    {conversationResult.alternatives.map((alt: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="font-semibold">Is Educational:</Label>
                <Badge 
                  variant={conversationResult.isEducational ? "default" : "secondary"}
                  className="ml-2"
                >
                  {conversationResult.isEducational ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Meal Plan */}
      {generatedMealPlan && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generated Meal Plan</CardTitle>
            <CardDescription>
              Successfully generated meal plan based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Original Request:</Label>
                <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                  {generatedMealPlan.request}
                </p>
              </div>
              
              <div>
                <Label className="font-semibold">Recipes Generated:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {generatedMealPlan.recipes.map((recipe: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <h4 className="font-semibold text-sm">{recipe.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {recipe.cookingTime} • {recipe.difficulty} • {recipe.servings} servings
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Validation Status:</Label>
                <Badge 
                  variant={generatedMealPlan.validation.isValid ? "default" : "destructive"}
                  className="ml-2"
                >
                  {generatedMealPlan.validation.isValid ? 'Valid Request' : 'Invalid Request'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
