export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      charities: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
        }
      }
      draws: {
        Row: {
          id: string
          month: number
          year: number
          numbers: number[]
          status: 'pending' | 'published'
          jackpot_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          month: number
          year: number
          numbers: number[]
          status?: 'pending' | 'published'
          jackpot_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          month?: number
          year?: number
          numbers?: number[]
          status?: 'pending' | 'published'
          jackpot_amount?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          subscription_status: 'active' | 'inactive' | 'cancelled'
          charity_id: string | null
          charity_percentage: number
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          charity_id?: string | null
          charity_percentage?: number
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          charity_id?: string | null
          charity_percentage?: number
          is_admin?: boolean
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          date?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_subscription_id: string
          stripe_customer_id: string
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_subscription_id: string
          stripe_customer_id: string
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'monthly' | 'yearly'
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_subscription_id?: string
          stripe_customer_id?: string
          current_period_end?: string
          created_at?: string
        }
      }
      winners: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          match_type: 3 | 4 | 5
          prize_amount: number
          verification_status: 'pending' | 'approved' | 'rejected' | 'paid'
          proof_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          match_type: 3 | 4 | 5
          prize_amount: number
          verification_status?: 'pending' | 'approved' | 'rejected' | 'paid'
          proof_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          match_type?: 3 | 4 | 5
          prize_amount?: number
          verification_status?: 'pending' | 'approved' | 'rejected' | 'paid'
          proof_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}