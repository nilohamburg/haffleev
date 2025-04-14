import { loadStripe } from "@stripe/stripe-js"

// Lade Stripe mit dem öffentlichen Schlüssel
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// Typen für Ticket-Produkte
export type TicketProduct = {
  id: string
  name: string
  description: string
  price: number
  image?: string
}

// Beispiel-Ticket-Produkte (in einer echten App würden diese aus der Datenbank kommen)
export const ticketProducts: TicketProduct[] = [
  {
    id: "ticket-1day",
    name: "1-Tages Ticket",
    description: "Zugang zum Festival für einen Tag deiner Wahl",
    price: 4900, // 49,00 €
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "ticket-3day",
    name: "3-Tages Festival Pass",
    description: "Voller Zugang zum Festival für alle drei Tage",
    price: 9900, // 99,00 €
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "ticket-vip",
    name: "VIP Pass",
    description: "Voller Zugang mit VIP-Bereichen und Extras",
    price: 19900, // 199,00 €
    image: "/placeholder.svg?height=200&width=300",
  },
]
