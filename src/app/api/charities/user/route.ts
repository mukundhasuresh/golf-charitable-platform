import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getUserCharity } from '@/services/charity.service';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/charities/user - Get user's selected charity and percentage
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity, error: charityError } = await getUserCharity(user.id);

    if (charityError) {
      return NextResponse.json({ error: charityError }, { status: 400 });
    }

    return NextResponse.json({
      charity,
      percentage: user.charity_percentage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
