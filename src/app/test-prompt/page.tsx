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

export default function TestPromptPage() {
  const { userPreferences, testAuthenticate } = useAuth();
  const [testPrompt, setTestPrompt] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [conversationResult, setConversationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test scenarios
  const testScenarios = [
    {
      name: 'Vegan requesting chicken',
      prompt: 'I want a recipe for grilled chicken',
      description: 'Tests dietary restriction validation'
    },
    {
      name: 'Vegetarian requesting beef',
      prompt: 'Can you make me a beef burger recipe?',
      description: 'Tests meat restriction validation'
    },
    {
      name: 'Gluten-free requesting pasta',
      prompt: 'I need a pasta carbonara recipe',
      description: 'Tests gluten restriction validation'
    },
    {
      name: 'Valid vegan request',
      prompt: 'I want a vegan tofu stir fry recipe',
      description: 'Tests valid dietary request'
    },
    {
      name: 'Skill level conflict',
      prompt: 'I want to make sous vide duck breast',
      description: 'Tests skill level validation'
    }
  ];

  const runValidationTest = async (prompt: string) => {
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
        currentTopic: 'test'
      };

      const conversation = await handleRecipeRequest(prompt, conversationContext);
      setConversationResult(conversation);

      toast.success('Validation test completed');
    } catch (error) {
      console.error('Validation test error:', error);
      toast.error('Validation test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const runCustomTest = async () => {
    if (!testPrompt.trim()) {
      toast.error('Please enter a test prompt');
      return;
    }

    await runValidationTest(testPrompt);
  };

  const setTestPreferences = (dietaryRestrictions: string[]) => {
    if (userPreferences) {
      // This would normally update preferences, but for testing we'll just show what would happen
      toast.info(`Would set preferences to: ${dietaryRestrictions.join(', ')}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Prompt Layer Validation Test</h1>
        <p className="text-gray-600 mb-4">
          Test the prompt validation system to ensure it properly handles dietary restrictions and user preferences.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={() => testAuthenticate()}>
            Set Test User (Vegan)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setTestPreferences(['vegetarian'])}
          >
            Set Vegetarian
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setTestPreferences(['gluten-free'])}
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Scenarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>
            Click on any scenario to test the prompt validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{scenario.name}</h3>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => runValidationTest(scenario.prompt)}
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

      {/* Custom Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Custom Test</CardTitle>
          <CardDescription>
            Enter your own prompt to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="custom-prompt">Test Prompt:</Label>
              <Input
                id="custom-prompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="e.g., I want a recipe for chicken curry"
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={runCustomTest}
                disabled={isLoading || !testPrompt.trim()}
              >
                {isLoading ? 'Testing...' : 'Test Prompt'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
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
    </div>
  );
}
