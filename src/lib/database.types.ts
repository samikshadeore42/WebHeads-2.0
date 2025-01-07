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
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
      itineraries: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          itinerary_id: string
          name: string
          date: string | null
          location: string | null
          cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          name: string
          date?: string | null
          location?: string | null
          cost?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          name?: string
          date?: string | null
          location?: string | null
          cost?: number | null
          created_at?: string
        }
      }
      collaborators: {
        Row: {
          itinerary_id: string
          user_id: string
          role: string
        }
        Insert: {
          itinerary_id: string
          user_id: string
          role: string
        }
        Update: {
          itinerary_id?: string
          user_id?: string
          role?: string
        }
      }
      expenses: {
        Row: {
          id: string
          itinerary_id: string
          amount: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          amount: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          amount?: number
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}