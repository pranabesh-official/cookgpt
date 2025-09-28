import { NextRequest, NextResponse } from 'next/server';
import { langChainConversationService, LangChainConversationContext } from '@/lib/langchain-conversation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, context } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      );
    }

    // Process the message with LangChain (server-side)
    const response = await langChainConversationService.processMessage(
      userMessage,
      context as LangChainConversationContext
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Return fallback response
    const fallbackResponse = {
      message: "I'm having a little trouble right now, but I'm still here to help! Could you try asking me again? I'd love to assist you with your cooking needs! 👨‍🍳",
      shouldGenerateRecipe: false,
      isEducational: false,
      conversationFlow: 'general',
      emotionalTone: 'helpful',
    };

    return NextResponse.json({ response: fallbackResponse });
  }
}

export async function DELETE() {
  try {
    // Clear conversation memory
    langChainConversationService.clearMemory();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing memory:', error);
    return NextResponse.json(
      { error: 'Failed to clear memory' },
      { status: 500 }
    );
  }
}
