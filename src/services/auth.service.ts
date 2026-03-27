import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(url, anonKey);

/**
 * Sign up a new user with email, password, and full name
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
        });

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      return {
        user: {
          id: data.user.id,
          email,
          full_name: fullName,
          subscription_status: 'inactive',
          charity_id: null,
          charity_percentage: 10,
          is_admin: false,
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    return { user: null, error: 'Failed to create user' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed';
    return { user: null, error: message };
  }
}

/**
 * Sign in user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      return {
        user: profile as User,
        error: null,
      };
    }

    return { user: null, error: 'Failed to sign in' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    return { user: null, error: message };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign out failed';
    return { error: message };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ? (await supabase.from('profiles').select('*').eq('id', data.user.id).single()).data as User : null;
  } catch {
    return null;
  }
}
