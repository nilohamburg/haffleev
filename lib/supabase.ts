import { createClient } from "@supabase/supabase-js"

// Erstelle einen Supabase-Client mit den Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Typen für unsere Datenbank-Tabellen
export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export type UserRole = {
  id: number
  user_id: string
  role: string
  created_at: string
}

export type Artist = {
  id: number
  name: string
  image: string
  bio: string
  genre: string
  socials: {
    instagram?: string
    twitter?: string
  }
  created_at: string
  updated_at: string
}

export type Performance = {
  id: number
  artist_id: number
  date: string
  time: string
  stage: string
  created_at: string
  updated_at: string
}

export type TicketProduct = {
  id: string
  name: string
  description: string
  price: number
  image?: string
  available_from?: string
  available_until?: string
  max_per_user: number
  created_at: string
  updated_at: string
}

export type Ticket = {
  id: string
  user_id: string
  ticket_type: string
  ticket_number: string
  purchase_date: string
  price: number
  is_used: boolean
  qr_code: string
  created_at: string
  updated_at: string
}

export type AuctionItem = {
  id: number
  title: string
  description: string
  image: string
  starting_bid: number
  current_bid?: number
  bids_count: number
  winner_id?: string
  status: "active" | "upcoming" | "ended"
  starts_at: string
  ends_at?: string
  created_at: string
  updated_at: string
}

export type Bid = {
  id: number
  auction_item_id: number
  user_id: string
  amount: number
  created_at: string
}

export type CharityProject = {
  id: number
  name: string
  description: string
  image: string
  goal: number
  raised: number
  created_at: string
  updated_at: string
}

export type Donation = {
  id: number
  user_id: string
  project_id: number
  amount: number
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  amount: number
  payment_method: string
  status: string
  payment_intent_id?: string
  related_type: string
  related_id: string
  created_at: string
  updated_at: string
}
