import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types';

/**
 * PATCH /api/admin/charities/[charityId] - Update charity
 * DELETE /api/admin/charities/[charityId] - Delete charity
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ charityId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charityId } = await params;
    const body: Partial<Database['public']['Tables']['charities']['Update']> = await request.json();

    const supabase = await getSupabaseServerClient();

    const { data: updatedCharity, error } = await supabase
      .from('charities')
      .update(body)
      .eq('id', charityId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ charity: updatedCharity });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ charityId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charityId } = await params;

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', charityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
