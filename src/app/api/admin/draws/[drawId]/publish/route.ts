import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/draws/[drawId]/publish - Publish a draw and auto-calculate winners
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { drawId } = await params;
    const supabase = await getSupabaseServerClient();

    // Get the draw
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
    }

    if (draw.status === 'published') {
      return NextResponse.json({ error: 'Draw already published' }, { status: 400 });
    }

    // Update draw status to published
    const { data: updatedDraw, error: updateError } = await supabase
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Auto-calculate winners (simplified - get all users with scores)
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score')
      .order('created_at', { ascending: false });

    if (allScores && allScores.length > 0) {
      // Group by user and get top 5 scores
      const userScoresMap: Record<string, number[]> = {};
      allScores.forEach(({ user_id, score }) => {
        if (!userScoresMap[user_id]) {
          userScoresMap[user_id] = [];
        }
        if (userScoresMap[user_id].length < 5) {
          userScoresMap[user_id].push(score);
        }
      });

      // Check for winners
      for (const [userId, scores] of Object.entries(userScoresMap)) {
        const matches = scores.filter(s => draw.numbers.includes(s)).length;

        if (matches >= 3) {
          let percentage = 0;
          if (matches === 5) percentage = 0.4;
          else if (matches === 4) percentage = 0.35;
          else if (matches === 3) percentage = 0.25;

          const prizeAmount = Math.floor(draw.jackpot_amount * percentage);

          // Create winner record
          await supabase.from('winners').insert([
            {
              draw_id: drawId,
              user_id: userId,
              match_type: matches,
              prize_amount: prizeAmount,
              verification_status: 'pending',
            },
          ]);
        }
      }
    }

    return NextResponse.json({ draw: updatedDraw });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
