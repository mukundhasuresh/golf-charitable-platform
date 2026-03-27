import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getCharities, updateUserCharity } from '@/services/charity.service';

/**
 * GET /api/charities - Get all charities
 * POST /api/charities - Update user's charity selection
 */

export async function GET() {
  try {
    const { charities, error } = await getCharities();

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ charities });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charityId, percentage } = await request.json();

    if (!charityId || !percentage) {
      return NextResponse.json(
        { error: 'Charity ID and percentage are required' },
        { status: 400 }
      );
    }

    const { user: updatedUser, error } = await updateUserCharity(
      user.id,
      charityId,
      percentage
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
