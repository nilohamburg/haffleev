import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

// Initialisiere Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { ticketId, userId, quantity = 1 } = await request.json()

    // Hole Ticket-Informationen aus der Datenbank
    const { data: ticketData, error: ticketError } = await supabase
      .from("ticket_products")
      .select("*")
      .eq("id", ticketId)
      .single()

    if (ticketError || !ticketData) {
      return NextResponse.json({ error: "Ticket nicht gefunden" }, { status: 404 })
    }

    // Erstelle einen Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: ticketData.price * quantity,
      currency: "eur",
      metadata: {
        ticketId,
        userId,
        quantity,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Fehler beim Erstellen des Payment Intent:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
