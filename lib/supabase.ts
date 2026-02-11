import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'https://your-project.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key-here';
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbOrder {
  id: string;
  order_number: string;
  order_message: string;
  contact_person: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  expected_delivery_date?: string;
  rejection_reason?: string;
  customer_id: string;
  delivered_at?: string;
  photo_url?: string;
}

export interface DbPickupRequest {
  id: string;
  customer_id: string;
  order_ids: string[];
  requested_at: string;
  status: string;
}

export interface DbUserRole {
  user_id: string;
  role: string;
  created_at: string;
}
