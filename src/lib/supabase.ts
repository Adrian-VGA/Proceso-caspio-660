import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          project_number: string;
          survey_data: any;
          goals: any;
          participant_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          project_number: string;
          survey_data?: any;
          goals?: any;
          participant_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          project_number?: string;
          survey_data?: any;
          goals?: any;
          participant_data?: any;
          updated_at?: string;
        };
      };
      saved_progresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          survey_data: any;
          participant_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          survey_data: any;
          participant_data: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          survey_data?: any;
          participant_data?: any;
        };
      };
    };
  };
};