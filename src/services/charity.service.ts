import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Charity, User } from '@/types';

/**
 * Get all charities
 */
export async function getCharities(): Promise<{ charities: Charity[] | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { charities: null, error: error.message };
    }

    return { charities: (charities || []) as Charity[], error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch charities';
    return { charities: null, error: message };
  }
}

/**
 * Get featured charities
 */
export async function getFeaturedCharities(): Promise<{ charities: Charity[] | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .order('name', { ascending: true });

    if (error) {
      return { charities: null, error: error.message };
    }

    return { charities: (charities || []) as Charity[], error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch featured charities';
    return { charities: null, error: message };
  }
}

/**
 * Get a user's selected charity
 */
export async function getUserCharity(userId: string): Promise<{ charity: Charity | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get user's charity_id
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('charity_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.charity_id) {
      return { charity: null, error: null };
    }

    const { data: charity, error: charityError } = await supabase
      .from('charities')
      .select('*')
      .eq('id', user.charity_id)
      .single();

    if (charityError) {
      return { charity: null, error: charityError.message };
    }

    return { charity: charity as Charity, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user charity';
    return { charity: null, error: message };
  }
}

/**
 * Update a user's selected charity and donation percentage
 */
export async function updateUserCharity(
  userId: string,
  charityId: string,
  percentage: number
): Promise<{ user: User | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Validate percentage
    if (percentage < 10 || percentage > 100) {
      return { user: null, error: 'Percentage must be between 10 and 100' };
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({
        charity_id: charityId,
        charity_percentage: percentage,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: updatedUser as User, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update charity';
    return { user: null, error: message };
  }
}
