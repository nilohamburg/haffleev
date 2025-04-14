export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Artist {
  id: number
  name: string
  description: string
  genre: string
  image_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: number
  artist_id: number
  start_time: string
  end_time: string
  location: string
  description?: string
  created_at: string
  updated_at: string
  artists?: Artist
}

export interface Auction {
  id: number
  title: string
  description: string
  image_url?: string
  starting_bid: number
  current_bid?: number
  min_bid_increment: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface Donation {
  id: number
  title: string
  description: string
  amount: number
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: number
  user_id: string
  ticket_type_id: number
  purchase_date: string
  status: string
  qr_code: string
  created_at: string
  updated_at: string
  ticket_type?: TicketType
}

export interface TicketType {
  id: number
  name: string
  description: string
  price: number
  available_quantity: number
  created_at: string
  updated_at: string
}
