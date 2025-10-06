import { NextResponse } from "next/server";
export const dynamic = 'force-static';

// Cashfree real integration (uses sandbox by default). Falls back to mock link if credentials are missing.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { data } = body || {};
    const userId = data?.userId;
    const planId = data?.planId;
    const userEmail = data?.email;
    const userPhone = data?.phone || '9999999999';

    if (!userId || !planId) {
      return NextResponse.json({ error: { message: "User ID and Plan ID are required" } }, { status: 400 });
    }

    const subscriptionId = `sub_${userId}_${planId}_${Date.now()}`;

    const CF_ID = process.env.CASHFREE_CLIENT_ID;
    const CF_SECRET = process.env.CASHFREE_CLIENT_SECRET;
    const API_BASE = process.env.CASHFREE_API_BASE || 'https://sandbox.cashfree.com';
    const returnHost = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000';
    const returnUrl = `${returnHost}/subscription`;

    // If credentials exist, call Cashfree API
    if (CF_ID && CF_SECRET) {
      const plans: Record<string, { planName: string; maxAmount: number; recurringAmount: number; intervalType: 'month' | 'year'; intervals: number; description: string; }>= {
        basic: { planName: 'CookGPT Basic Plan', maxAmount: 499, recurringAmount: 499, intervalType: 'month', intervals: 1, description: 'Basic monthly plan' },
        pro: { planName: 'CookGPT Pro Plan', maxAmount: 799, recurringAmount: 799, intervalType: 'month', intervals: 1, description: 'Pro monthly plan' },
      };
      const plan = plans[planId as keyof typeof plans];
      if (!plan) {
        return NextResponse.json({ error: { message: 'Invalid plan ID' } }, { status: 400 });
      }

      const payload = {
        subscriptionId,
        planName: plan.planName,
        subscriptionType: 'PERIODIC',
        maxAmount: plan.maxAmount,
        recurringAmount: plan.recurringAmount,
        intervalType: plan.intervalType,
        intervals: plan.intervals,
        description: plan.description,
        customerName: (userEmail || 'user').split('@')[0],
        customerEmail: userEmail,
        customerPhone: userPhone,
        returnUrl,
        notifyUrl: `${returnHost}/api/subscription/webhook`
      };

      const resp = await fetch(`${API_BASE}/api/v2/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': CF_ID,
          'X-Client-Secret': CF_SECRET,
          'x-api-version': '2022-09-01'
        },
        body: JSON.stringify(payload)
      });

      const result = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('Cashfree API error', resp.status, result);
        return NextResponse.json({ error: { message: result?.message || 'Cashfree error', details: result } }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        subscriptionId,
        authLink: result.authLink || result.paymentLink,
        status: result.status || 'SUCCESS'
      });
    }

    // Fallback mock link if no credentials on server
    const mockAuthLink = `https://sandbox.cashfree.com/pg-subs/authorize?subscriptionId=${encodeURIComponent(subscriptionId)}&return_url=${encodeURIComponent(returnUrl)}&plan=${encodeURIComponent(planId)}`;
    return NextResponse.json({ success: true, subscriptionId, authLink: mockAuthLink, status: 'SUCCESS' });
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: { message: error?.message || "Internal server error" } }, { status: 500 });
  }
}

// Mock webhook endpoint for local testing
export async function GET() {
  return NextResponse.json({ 
    message: "Cashfree Subscription API Mock",
    endpoints: {
      "POST /api/subscription/create": "Create subscription",
      "POST /api/subscription/webhook": "Handle webhooks"
    }
  });
}


