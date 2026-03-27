/**
 * Core TypeScript interfaces for the golf charity platform
 */

export type { Database } from './database';

/**
 * User profile stored in Supabase auth and profiles table
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'active' | 'inactive' | 'cancelled';
  charity_id: string | null;
  charity_percentage: number; // default 10, range 10-100
  is_admin: boolean;
  created_at: string;
}

/**
 * Golf score (Stableford points 1-45)
 * Users can have max 5 scores; adding a 6th deletes the oldest
 */
export interface Score {
  id: string;
  user_id: string;
  score: number; // 1-45 Stableford points
  date: string; // ISO date string
  created_at: string;
}

/**
 * Stripe subscription tied to a user
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_end: string; // ISO timestamp
  created_at?: string;
}

/**
 * Charitable organization users can support
 */
export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
}

/**
 * Monthly draw with 5 winning numbers
 * Jackpot distributed: 40% for 5 match, 35% for 4 match, 25% for 3 match
 */
export interface Draw {
  id: string;
  month: number; // 1-12
  year: number;
  numbers: number[]; // 5 numbers between 1-45
  status: 'pending' | 'published';
  jackpot_amount: number; // in cents
  created_at: string;
}

/**
 * Winner record when user matches draw numbers
 */
export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5; // matched 3, 4, or all 5 numbers
  prize_amount: number; // in cents
  verification_status: 'pending' | 'approved' | 'rejected' | 'paid';
  proof_url: string | null; // URL to proof of winnings
  created_at: string;
}

/**
 * Session information returned after authentication
 */
export interface AuthSession {
  user: User | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
}
