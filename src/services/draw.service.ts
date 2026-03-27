import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Draw, Score, Winner } from '@/types';

/**
 * Get the latest published draw
 */
export async function getLatestDraw(): Promise<{ draw: Draw | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: draw, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { draw: null, error: error.message };
    }

    return { draw: (draw as Draw) || null, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch draw';
    return { draw: null, error: message };
  }
}

/**
 * Get draw history (published draws) in descending order
 */
export async function getUserDrawHistory(): Promise<{ draws: Draw[] | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      return { draws: null, error: error.message };
    }

    return { draws: (draws || []) as Draw[], error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch draw history';
    return { draws: null, error: message };
  }
}

/**
 * Calculate how many numbers a user matched (3, 4, or 5)
 */
export function calculateMatches(userScores: number[], drawNumbers: number[]): 3 | 4 | 5 | 0 {
  // For golf Stableford scores (1-45), we take the last 5 scores as pseudo lottery numbers
  const userNumbers = userScores.slice(0, 5);
  const matched = userNumbers.filter(num => drawNumbers.includes(num)).length;

  if (matched === 5) return 5;
  if (matched === 4) return 4;
  if (matched === 3) return 3;
  return 0;
}

/**
 * Check if a user is a winner for a specific draw
 * Returns winner record if they matched at least 3 numbers
 */
export async function checkWinner(
  userId: string,
  drawId: string
): Promise<{ winner: Winner | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get user's scores
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (scoresError) {
      return { winner: null, error: scoresError.message };
    }

    // Get draw
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (drawError) {
      return { winner: null, error: drawError.message };
    }

    const userNumbers = (scores || []).map(s => s.score);
    const matchType = calculateMatches(userNumbers, draw.numbers);

    if (matchType === 0) {
      return { winner: null, error: null };
    }

    // Calculate prize based on match type
    // 40% for 5 matches, 35% for 4 matches, 25% for 3 matches
    let percentage = 0;
    if (matchType === 5) percentage = 0.4;
    else if (matchType === 4) percentage = 0.35;
    else if (matchType === 3) percentage = 0.25;

    const prizeAmount = Math.floor(draw.jackpot_amount * percentage);

    // Check if winner record already exists
    const { data: existingWinner, error: checkError } = await supabase
      .from('winners')
      .select('*')
      .eq('draw_id', drawId)
      .eq('user_id', userId)
      .single();

    if (existingWinner) {
      return { winner: existingWinner as Winner, error: null };
    }

    // Create new winner record
    const { data: newWinner, error: insertError } = await supabase
      .from('winners')
      .insert([
        {
          draw_id: drawId,
          user_id: userId,
          match_type: matchType,
          prize_amount: prizeAmount,
          verification_status: 'pending',
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { winner: null, error: insertError.message };
    }

    return { winner: newWinner as Winner, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check winner';
    return { winner: null, error: message };
  }
}
