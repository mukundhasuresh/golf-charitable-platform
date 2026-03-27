import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/winners/[winnerId] - Update winner verification status
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ winnerId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { winnerId } = await params;
    const { verification_status } = await request.json();

    if (!verification_status || !['pending', 'approved', 'rejected', 'paid'].includes(verification_status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    const { data: updatedWinner, error } = await supabase
      .from('winners')
      .update({ verification_status })
      .eq('id', winnerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ winner: updatedWinner });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
