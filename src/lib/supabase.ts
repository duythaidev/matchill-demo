import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../app/config';

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── DATABASE TYPES ───────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          skill_level: number;
          sports: string[];
          city: string;
          lat: number | null;
          lng: number | null;
          radius_km: number;
          bio: string | null;
          role: 'player' | 'venueOwner' | 'admin';
          reputation_score: number;
          attendance_rate: number;
          avg_rating: number;
          total_games: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'unlocked_at'>;
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>;
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          images: string[];
          sport: string | null;
          location: string | null;
          likes: string[];
          saves: string[];
          share_count: number;
          is_reported: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          likes: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['post_comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['post_comments']['Insert']>;
      };
      venues: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          lat: number | null;
          lng: number | null;
          sports: string[];
          price_per_hour: number;
          images: string[];
          rating: number;
          total_reviews: number;
          amenities: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['venues']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['venues']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          venue_id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          sport: string;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          qr_code: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      match_requests: {
        Row: {
          id: string;
          creator_id: string;
          sport: string;
          skill_level: number;
          venue_id: string | null;
          scheduled_time: string;
          slots_needed: number;
          slots_filled: number;
          status: 'open' | 'full' | 'cancelled' | 'completed';
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['match_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['match_requests']['Insert']>;
      };
      chats: {
        Row: {
          id: string;
          name: string | null;
          is_group: boolean;
          members: string[];
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chats']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chats']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          type: 'text' | 'image' | 'system';
          seen_by: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_id: string;
          target_type: 'user' | 'post' | 'venue' | 'chat';
          reason: string;
          description: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
    };
  };
}
