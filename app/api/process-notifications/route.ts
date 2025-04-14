import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Hilfsfunktion zum Senden einer WhatsApp-Nachricht über Twilio
async function sendTwilioWhatsAppMessage(to: string, body: string) {
  try {
    // Simulieren Sie den Versand für Testzwecke
    console.log(`[Simuliert] WhatsApp-Nachricht an ${to}: ${body}`)

    // Erfolgreiche Simulation zurückgeben
    return {
      success: true,
      messageId: "SIMULATED_" + Date.now(),
    }
  } catch (error) {
    console.error("Fehler beim Senden der WhatsApp-Nachricht:", error)
    return {
      success: false,
      error: error.message || "Unbekannter Fehler",
    }
  }
}

export async function GET(request: Request) {
  try {
    // API-Schlüssel zur Sicherheit überprüfen (optional)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("api_key")

    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: "Ungültiger API-Schlüssel" }, { status: 401 })
    }

    // Fällige Benachrichtigungen abrufen
    const now = new Date().toISOString()
    const { data: notifications, error } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", now)

    if (error) {
      console.error("Fehler beim Abrufen der Benachrichtigungen:", error)
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 })
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ message: "Keine fälligen Benachrichtigungen" })
    }

    // Benachrichtigungen verarbeiten
    const results = await Promise.all(
      notifications.map(async (notification) => {
        try {
          // Je nach Benachrichtigungstyp verarbeiten
          if (notification.notification_type === "whatsapp") {
            await sendWhatsAppNotification(notification)
          } else if (notification.notification_type === "email") {
            await sendEmailNotification(notification)
          }

          // Benachrichtigung als gesendet markieren
          await supabase
            .from("scheduled_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", notification.id)

          return {
            id: notification.id,
            status: "sent",
            success: true,
          }
        } catch (error) {
          console.error(`Fehler beim Senden der Benachrichtigung ${notification.id}:`, error)

          // Benachrichtigung als fehlgeschlagen markieren
          await supabase
            .from("scheduled_notifications")
            .update({
              status: "failed",
            })
            .eq("id", notification.id)

          return {
            id: notification.id,
            status: "failed",
            error: error.message,
            success: false,
          }
        }
      }),
    )

    return NextResponse.json({
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Fehler bei der Verarbeitung der Benachrichtigungen:", error)
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 })
  }
}

// WhatsApp-Benachrichtigung senden
async function sendWhatsAppNotification(notification) {
  try {
    // Benutzer basierend auf dem Ereignistyp abrufen
    let users = []

    if (notification.event_type === "artist_performance") {
      // Alle Ticketbesitzer benachrichtigen
      const { data, error } = await supabase.from("users").select("*").not("tickets", "is", null)
      if (error) throw error
      users = data || []
    } else if (notification.event_type.includes("auction")) {
      // Bei Auktionen alle Bieter für diese Auktion benachrichtigen
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("id", supabase.from("bids").select("user_id").eq("auction_item_id", notification.event_id))
      if (error) throw error
      users = data || []
    }

    // Filtern Sie Benutzer ohne Telefonnummer heraus
    const usersWithPhone = users.filter((user) => user.phone)

    if (usersWithPhone.length === 0) {
      throw new Error("Keine Empfänger mit Telefonnummer gefunden")
    }

    // Für Testzwecke verwenden wir nur die erste Telefonnummer
    const testUser = usersWithPhone[0]
    const toNumber = testUser.phone // Telefonnummer im Format +491234567890

    // WhatsApp-Nachricht senden
    const result = await sendTwilioWhatsAppMessage(toNumber, notification.message)

    if (!result.success) {
      throw new Error(`Fehler beim Senden der WhatsApp-Nachricht: ${result.error}`)
    }

    // WhatsApp-Versand in der Datenbank protokollieren
    await supabase.from("notification_logs").insert({
      type: "whatsapp",
      recipient_count: usersWithPhone.length,
      content: notification.message,
      sent_at: new Date().toISOString(),
      status: "sent",
      event_type: notification.event_type,
      event_id: notification.event_id,
    })

    return true
  } catch (error) {
    console.error("Fehler beim Senden der WhatsApp-Benachrichtigung:", error)
    throw error
  }
}

// E-Mail-Benachrichtigung senden
async function sendEmailNotification(notification) {
  try {
    // Überprüfen, ob SendGrid API-Schlüssel konfiguriert ist
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API-Schlüssel nicht konfiguriert")
    }

    // Benutzer basierend auf dem Ereignistyp abrufen
    let users = []

    if (notification.event_type === "artist_performance") {
      // Alle Ticketbesitzer benachrichtigen
      const { data, error } = await supabase.from("users").select("*").not("tickets", "is", null)
      if (error) throw error
      users = data || []
    } else if (notification.event_type.includes("auction")) {
      // Bei Auktionen alle Bieter für diese Auktion benachrichtigen
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("id", supabase.from("bids").select("user_id").eq("auction_item_id", notification.event_id))
      if (error) throw error
      users = data || []
    }

    if (!users || users.length === 0) {
      throw new Error("Keine Empfänger gefunden")
    }

    // In einer echten Anwendung würden wir hier SendGrid verwenden, um E-Mails zu senden
    // Für dieses Beispiel simulieren wir den Versand
    console.log(`[E-Mail] Sende E-Mail an ${users.length} Empfänger:`)
    console.log(`[E-Mail] Betreff: Ereignisbenachrichtigung: ${notification.event_name}`)
    console.log(`[E-Mail] Inhalt: ${notification.message}`)

    // E-Mail-Versand in der Datenbank protokollieren
    await supabase.from("notification_logs").insert({
      type: "email",
      recipient_count: users.length,
      subject: `Ereignisbenachrichtigung: ${notification.event_name}`,
      content: notification.message,
      sent_at: new Date().toISOString(),
      status: "sent",
      event_type: notification.event_type,
      event_id: notification.event_id,
    })

    return true
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail-Benachrichtigung:", error)
    throw error
  }
}
