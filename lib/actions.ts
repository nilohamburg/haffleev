"use server"
import { supabase } from "./supabase"
import Stripe from "stripe"

// Stripe-Instanz initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Funktion zum Erstellen einer Checkout-Session für Spenden
export async function createDonationCheckoutSession({
  amount,
  name,
  message,
}: {
  amount: number
  name: string
  message: string
}) {
  try {
    // Erstelle eine Checkout-Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Spende für das HAFFleev Festival",
              description: `Spende von ${name}${message ? `: ${message}` : ""}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donations`,
      metadata: {
        type: "donation",
        name,
        message,
      },
    })

    // Speichere die Transaktion in der Datenbank
    const { error } = await supabase.from("donation_transactions").insert([
      {
        stripe_session_id: session.id,
        amount: amount / 100, // Konvertiere von Cent zu Euro
        name,
        message,
        status: "pending",
      },
    ])

    if (error) {
      console.error("Fehler beim Speichern der Transaktion:", error)
      return { error: "Fehler beim Speichern der Transaktion" }
    }

    return { url: session.url }
  } catch (error) {
    console.error("Fehler beim Erstellen der Checkout-Session:", error)
    return { error: "Fehler beim Erstellen der Checkout-Session" }
  }
}

// Funktion zum Erstellen einer Checkout-Session für Auktionsgebote
export async function createAuctionBidCheckoutSession({
  auctionId,
  bidAmount,
  userId,
}: {
  auctionId: number
  bidAmount: number
  userId: string
}) {
  try {
    // Hole Auktionsdaten
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single()

    if (auctionError || !auction) {
      console.error("Fehler beim Laden der Auktion:", auctionError)
      return { error: "Auktion nicht gefunden" }
    }

    // Überprüfe, ob das Gebot gültig ist
    if (bidAmount <= (auction.current_bid || auction.starting_bid)) {
      return { error: "Das Gebot muss höher sein als das aktuelle Gebot" }
    }

    // Erstelle eine Checkout-Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Gebot für "${auction.title}"`,
              description: `Auktions-ID: ${auctionId}`,
            },
            unit_amount: bidAmount * 100, // Konvertiere von Euro zu Cent
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auctions/${auctionId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auctions/${auctionId}`,
      metadata: {
        type: "auction_bid",
        auction_id: auctionId.toString(),
        user_id: userId,
      },
    })

    // Speichere das Gebot in der Datenbank
    const { error } = await supabase.from("auction_bids").insert([
      {
        auction_id: auctionId,
        user_id: userId,
        amount: bidAmount,
        stripe_session_id: session.id,
        status: "pending",
      },
    ])

    if (error) {
      console.error("Fehler beim Speichern des Gebots:", error)
      return { error: "Fehler beim Speichern des Gebots" }
    }

    return { url: session.url }
  } catch (error) {
    console.error("Fehler beim Erstellen der Checkout-Session:", error)
    return { error: "Fehler beim Erstellen der Checkout-Session" }
  }
}

// Funktion zum Erstellen einer Checkout-Session für Tickets
export async function createTicketCheckoutSession({
  ticketTypeId,
  userId,
  quantity = 1,
}: {
  ticketTypeId: number
  userId: string
  quantity?: number
}) {
  try {
    // Hole Ticket-Typ-Daten
    const { data: ticketType, error: ticketTypeError } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("id", ticketTypeId)
      .single()

    if (ticketTypeError || !ticketType) {
      console.error("Fehler beim Laden des Ticket-Typs:", ticketTypeError)
      return { error: "Ticket-Typ nicht gefunden" }
    }

    // Überprüfe, ob genügend Tickets verfügbar sind
    if (ticketType.available_quantity < quantity) {
      return { error: "Nicht genügend Tickets verfügbar" }
    }

    // Erstelle eine Checkout-Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: ticketType.name,
              description: ticketType.description,
            },
            unit_amount: ticketType.price * 100, // Konvertiere von Euro zu Cent
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets`,
      metadata: {
        type: "ticket",
        ticket_type_id: ticketTypeId.toString(),
        user_id: userId,
        quantity: quantity.toString(),
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error("Fehler beim Erstellen der Checkout-Session:", error)
    return { error: "Fehler beim Erstellen der Checkout-Session" }
  }
}
