import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Dog {
  id: string
  name: string
  photo_url?: string
  created_at: string
  user_id: string
}

export interface Feeding {
  id: string
  dog_id: string
  timestamp: string
  user_id: string
}
