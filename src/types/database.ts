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
          images_remaining_this_cycle: number
          total_images_available: number
          images_used_this_cycle: number
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
          images_remaining_this_cycle?: number
          total_images_available?: number
          images_used_this_cycle?: number
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
          images_remaining_this_cycle?: number
          total_images_available?: number
          images_used_this_cycle?: number
          created_at?: string
          updated_at?: string
        }
      }
      client_sessions: {
        Row: {
          id: string
          salon_id: string
          expires_at: string
          ai_uses_count: number
          max_ai_uses: number
          is_active: boolean
          client_ip: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          salon_id: string
          expires_at: string
          ai_uses_count?: number
          max_ai_uses: number
          is_active?: boolean
          client_ip?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          salon_id?: string
          expires_at?: string
          ai_uses_count?: number
          max_ai_uses?: number
          is_active?: boolean
          client_ip?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
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
          processing_time_ms: number | null
          prompt_used: Json | null
          was_cached: boolean | null
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
          processing_time_ms?: number | null
          prompt_used?: Json | null
          was_cached?: boolean | null
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
          processing_time_ms?: number | null
          prompt_used?: Json | null
          was_cached?: boolean | null
          created_at?: string
          completed_at?: string | null
        }
      }
      b2c_users: {
        Row: {
          id: string
          session_token: string
          user_type: string
          max_ai_uses: number
          ai_uses_remaining: number
          session_duration: number
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_token: string
          user_type?: string
          max_ai_uses?: number
          ai_uses_remaining?: number
          session_duration?: number
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          user_type?: string
          max_ai_uses?: number
          ai_uses_remaining?: number
          session_duration?: number
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      b2c_transformation_history: {
        Row: {
          id: string
          user_id: string
          style_id: string
          original_image_url: string
          generated_image_url: string
          used_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style_id: string
          original_image_url: string
          generated_image_url: string
          used_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style_id?: string
          original_image_url?: string
          generated_image_url?: string
          used_ai?: boolean
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
      subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
      style_category: 'women' | 'men' | 'beard' | 'color'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}