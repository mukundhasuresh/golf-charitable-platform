import { createClient } from '@supabase/supabase-js';
import type { Score } from '@/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(url, anonKey);

/**
 * Add a new golf score for a user
 * If user already has 5 scores, delete the oldest one first
 */
export async function addScore(
  userId: string,
  score: number,
  date: string
): Promise<{ score: Score | null; error: string | null }> {
  try {
    const supabaseClient = supabase;

    // Check current score count
    const { data: currentScores, error: fetchError } = await supabaseClient
      .from('scores')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      return { score: null, error: fetchError.message };
    }

    // If 5 scores exist, delete the oldest one
    if ((currentScores || []).length >= 5) {
      const oldestScore = currentScores?.[0];
      if (oldestScore) {
        const { error: deleteError } = await supabase
          .from('scores')
          .delete()
          .eq('id', oldestScore.id);

        if (deleteError) {
          return { score: null, error: deleteError.message };
        }
      }
    }

    // Insert new score
    const { data: newScore, error: insertError } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          score,
          date,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { score: null, error: insertError.message };
    }

    return { score: newScore as Score, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add score';
    return { score: null, error: message };
  }
}

/**
 * Get all scores for a user, sorted by newest first
 */
export async function getScores(userId: string): Promise<{ scores: Score[] | null; error: string | null }> {
  try {
    const supabaseClient = supabase;

    const { data: scores, error } = await supabaseClient
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { scores: null, error: error.message };
    }

    return { scores: (scores || []) as Score[], error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scores';
    return { scores: null, error: message };
  }
}

/**
 * Delete a score by ID (with user verification)
 */
export async function deleteScore(
  scoreId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const supabaseClient = supabase;

    // Verify ownership
    const { data: score, error: fetchError } = await supabaseClient
      .from('scores')
      .select('user_id')
      .eq('id', scoreId)
      .single();

    if (fetchError || !score || score.user_id !== userId) {
      return { error: 'Unauthorized' };
    }

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete score';
    return { error: message };
  }
}
