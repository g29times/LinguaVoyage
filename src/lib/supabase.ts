import { createClient } from '@supabase/supabase-js';

// NOTE: Previously hardcoded for convenience. Kept here commented per cautious refactor rule.
// const supabaseUrl = 'https://qvntafrmpjswmzlnnphh.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bnRhZnJtcGpzd216bG5ucGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjQ1NTYsImV4cCI6MjA3MDkwMDU1Nn0.IMg5N7x4mDG87ytFBqftk6N4sbkb1UyNqvGRmRntff8';

// Use environment variables (configure in .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for authentication
export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
    full_name?: string;
  };
  app_metadata?: {
    provider?: string;
  };
};

// Database types
export type Database = {
  public: {
    Tables: {
      app_24b6a0157d_user_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          learning_goals: string[];
          preferred_topics: string[];
          daily_time_commitment: number;
          timezone: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          learning_goals: string[];
          preferred_topics: string[];
          daily_time_commitment: number;
          timezone: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['app_24b6a0157d_user_profiles']['Insert'], 'user_id'>>;
      };
      app_24b6a0157d_user_progress: {
        Row: {
          id: string;
          user_id: string;
          total_ip: number;
          current_streak: number;
          unlocked_badges: string[];
          unlocked_spells: string[];
          mbti_indicators: {
            extraversion_score: number;
            sensing_score: number;
            thinking_score: number;
            judging_score: number;
            confidence_level: number;
            data_points: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_ip?: number;
          current_streak?: number;
          unlocked_badges?: string[];
          unlocked_spells?: string[];
          mbti_indicators?: {
            extraversion_score: number;
            sensing_score: number;
            thinking_score: number;
            judging_score: number;
            confidence_level: number;
            data_points: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['app_24b6a0157d_user_progress']['Insert'], 'user_id'>>;
      };
      app_24b6a0157d_learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_data: Record<string, unknown>;
          modules_completed: string[];
          ip_earned: number;
          performance_metrics: Record<string, unknown>;
          start_time: string;
          end_time?: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          session_data: Record<string, unknown>;
          modules_completed?: string[];
          ip_earned?: number;
          performance_metrics?: Record<string, unknown>;
          start_time: string;
          end_time?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['app_24b6a0157d_learning_sessions']['Insert'], 'user_id'>>;
      };
    };
  };
};