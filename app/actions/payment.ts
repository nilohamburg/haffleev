"use server"

import { supabase } from "@/lib/supabase"
import Stripe from "stripe"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

// Stripe-Instanz initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Funktion zum Erstellen einer Checkout-Session für Tickets
export async function createTicketCheckoutSession(formData: FormData) {
  try {
    const ticketTypeId = formData.get("ticketTypeId") as string
    const userId = formData.get("userId") as string
    const quantity = Number.parseInt(formData.get("quantity") as string) || 1

    if (!ticketTypeId || !userId) {
      return { error: "Ticket-Typ und Benutzer-ID sind erforderlich" }
    }

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
            unit_amount: Math.round(ticketType.price * 100), // Konvertiere von Euro zu Cent
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/tickets/buy`,
      metadata: {
        type: "ticket",
        ticket_type_id: ticketTypeId,
        user_id: userId,
        quantity: quantity.toString(),
      },
    })

    if (session.url) {
      redirect(session.url)
    }

    return { error: "Fehler beim Erstellen der Checkout-Session" }
  } catch (error) {
    console.error("Fehler beim Erstellen der Checkout-Session:", error)
    return { error: "Fehler beim Erstellen der Checkout-Session" }
  }
}

// Funktion zum Erstellen einer Checkout-Session für Spenden
export async function createDonationCheckoutSession(formData: FormData) {
  try {
    const amount = Number.parseFloat(formData.get("amount") as string)
    const name = formData.get("name") as string
    const message = (formData.get("message") as string) || ""
    const projectId = formData.get("projectId") as string
    const userId = formData.get("userId") as string

    if (isNaN(amount) || amount <= 0) {
      return { error: "Ungültiger Spendenbetrag" }
    }

    // Hole Projekt-Daten, falls eine Projekt-ID angegeben wurde
    let projectName = "Allgemeine Spende"
    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from("charity_projects")
        .select("name")
        .eq("id", projectId)
        .single()

      if (!projectError && project) {
        projectName = project.name
      }
    }

    // Erstelle eine Checkout-Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Spende für ${projectName}`,
              description: message ? `Nachricht: ${message}` : "Vielen Dank für Ihre Unterstützung!",
            },
            unit_amount: Math.round(amount * 100), // Konvertiere von Euro zu Cent
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/donate`,
      metadata: {
        type: "donation",
        project_id: projectId || "",
        user_id: userId || "",
        name,
        message,
      },
    })

    if (session.url) {
      redirect(session.url)
    }

    return { error: "Fehler beim Erstellen der Checkout-Session" }
  } catch (error) {
    console.error("Fehler beim Erstellen der Checkout-Session:", error)
    return { error: "Fehler beim Erstellen der Checkout-Session" }
  }
}

// Funktion zum Verarbeiten von Stripe-Webhook-Events
export async function handleStripeWebhook(payload: any, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // Verarbeite das Event basierend auf dem Event-Typ
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Webhook-Events:", error)
    return { error: "Fehler beim Verarbeiten des Webhook-Events" }
  }
}

// Funktion zum Verarbeiten von abgeschlossenen Checkout-Sessions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata) {
    console.error("Keine Metadaten in der Session gefunden")
    return
  }

  const { type } = metadata

  switch (type) {
    case "ticket":
      await handleTicketPurchase(session)
      break
    case "donation":
      await handleDonation(session)
      break
    default:
      console.log(`Unbekannter Transaktionstyp: ${type}`)
  }
}

// Funktion zum Verarbeiten von Ticket-Käufen
async function handleTicketPurchase(session: Stripe.Checkout.Session) {
  const { metadata } = session
  if (!metadata) return

  const { ticket_type_id, user_id, quantity } = metadata
  const quantityNum = Number.parseInt(quantity) || 1

  // Generiere Tickets
  for (let i = 0; i < quantityNum; i++) {
    const ticketNumber = `HAF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase()
    const qrCode = uuidv4()

    // Speichere das Ticket in der Datenbank
    const { error } = await supabase.from("tickets").insert([
      {
        user_id,
        ticket_type_id,
        ticket_number: ticketNumber,
        qr_code: qrCode,
        purchase_date: new Date().toISOString(),
        status: "active",
      },
    ])

    if (error) {
      console.error("Fehler beim Speichern des Tickets:", error)
    }
  }

  // Aktualisiere die verfügbare Anzahl der Tickets
  const { error } = await supabase.rpc("update_ticket_quantity", {
    p_ticket_type_id: ticket_type_id,
    p_quantity: quantityNum,
  })

  if (error) {
    console.error("Fehler beim Aktualisieren der Ticket-Anzahl:", error)
  }

  // Revalidiere die Tickets-Seite
  revalidatePath("/tickets")
}

// Funktion zum Verarbeiten von Spenden
async function handleDonation(session: Stripe.Checkout.Session) {
  const { metadata, amount_total } = session
  if (!metadata || !amount_total) return

  const { project_id, user_id, name, message } = metadata
  const amountInEuro = amount_total / 100 // Konvertiere von Cent zu Euro

  // Speichere die Spende in der Datenbank
  const { error } = await supabase.from("donations").insert([
    {
      project_id: project_id || null,
      user_id: user_id || null,
      amount: amountInEuro,
      donor_name: name,
      message: message || null,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("Fehler beim Speichern der Spende:", error)
  }

  // Wenn eine Projekt-ID angegeben wurde, aktualisiere den gesammelten Betrag des Projekts
  if (project_id) {
    const { error: updateError } = await supabase.rpc("update_project_raised_amount", {
      p_project_id: project_id,
      p_amount: amountInEuro,
    })

    if (updateError) {
      console.error("Fehler beim Aktualisieren des Projektbetrags:", updateError)
    }
  }

  // Revalidiere die Spenden-Seite
  revalidatePath("/donate")
}
