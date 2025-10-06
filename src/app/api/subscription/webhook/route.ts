import { NextResponse } from "next/server";
export const dynamic = 'force-static';

// Mock Cashfree webhook handler for local development
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Received Cashfree webhook (mock):', body);
    
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Update subscription status in database
    // 3. Update user's subscription tier
    // 4. Send confirmation emails
    
    // Mock webhook processing
    const { subscriptionId, status, eventType } = body;
    
    if (subscriptionId && status) {
      console.log(`Processing subscription ${subscriptionId} with status: ${status}`);
      
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook processed successfully',
        processed: {
          subscriptionId,
          status,
          eventType,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid webhook payload' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Mock webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: "Cashfree Webhook Endpoint (Mock)",
    status: "active",
    supportedEvents: [
      "SUBSCRIPTION_ACTIVATED",
      "SUBSCRIPTION_CANCELLED", 
      "SUBSCRIPTION_EXPIRED",
      "PAYMENT_SUCCESS",
      "PAYMENT_FAILED"
    ]
  });
}
