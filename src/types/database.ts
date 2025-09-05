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
      salons: {
        Row: {
          id: string
          name: string
          email: string
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          session_duration: number
          max_ai_uses: number
          total_ai_generations_used: number
          free_trial_generations: number
          qr_code_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          session_duration?: number
          max_ai_uses?: number
          total_ai_generations_used?: number
          free_trial_generations?: number
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          session_duration?: number
          max_ai_uses?: number
          total_ai_generations_used?: number
          free_trial_generations?: number
          qr_code_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          salon_id: string
          expires_at: string
          ai_uses: number
          max_ai_uses: number
          created_at: string
        }
        Insert: {
          id?: string
          salon_id: string
          expires_at: string
          ai_uses?: number
          max_ai_uses: number
          created_at?: string
        }
        Update: {
          id?: string
          salon_id?: string
          expires_at?: string
          ai_uses?: number
          max_ai_uses?: number
          created_at?: string
        }
      }
      styles: {
        Row: {
          id: string
          category: 'women' | 'men' | 'beard' | 'color'
          name: string
          description: string
          prompt: Json
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: 'women' | 'men' | 'beard' | 'color'
          name: string
          description: string
          prompt: Json
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: 'women' | 'men' | 'beard' | 'color'
          name?: string
          description?: string
          prompt?: Json
          image_url?: string | null
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          salon_id: string
          style_id: string
          used_at: string
        }
        Insert: {
          id?: string
          salon_id: string
          style_id: string
          used_at?: string
        }
        Update: {
          id?: string
          salon_id?: string
          style_id?: string
          used_at?: string
        }
      }
      ai_generations: {
        Row: {
          id: string
          session_id: string
          style_id: string
          original_image_url: string
          generated_image_url: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          style_id: string
          original_image_url: string
          generated_image_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          style_id?: string
          original_image_url?: string
          generated_image_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
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
      subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
      style_category: 'women' | 'men' | 'beard' | 'color'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}