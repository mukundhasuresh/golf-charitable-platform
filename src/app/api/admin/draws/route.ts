import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Generate 5 random numbers between 1-45
 */
function generateDrawNumbers(): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * GET /api/admin/draws - Get all draws (admin only)
 * POST /api/admin/draws - Create new draw (admin only)
 */

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabaseServerClient();

    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ draws });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, year, jackpot_amount } = await request.json();

    if (!month || !year || !jackpot_amount) {
      return NextResponse.json(
        { error: 'Month, year, and jackpot_amount are required' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Generate random numbers
    const numbers = generateDrawNumbers();

    const { data: newDraw, error } = await supabase
      .from('draws')
      .insert([
        {
          month,
          year,
          numbers,
          status: 'pending',
          jackpot_amount,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ draw: newDraw }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
