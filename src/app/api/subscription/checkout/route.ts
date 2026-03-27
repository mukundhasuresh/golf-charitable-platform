import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { createCheckoutSession } from '@/services/subscription.service';

/**
 * POST /api/subscription/checkout - Create Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const { sessionId, error } = await createCheckoutSession(user.id, plan as 'monthly' | 'yearly');

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ sessionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
