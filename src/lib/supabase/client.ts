import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a singleton Supabase browser client for use in the browser
 * Sets up real-time subscriptions and handles auth state changes
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseBrowserClient;
}
