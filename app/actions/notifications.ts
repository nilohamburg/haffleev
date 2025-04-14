"use server"

import { supabase } from "@/lib/supabase"

type EmailNotificationParams = {
  subject: string
  content: string
  recipientType: string
  selectedGroups: string[]
}

type WhatsAppNotificationParams = {
  content: string
  recipientType: string
  selectedGroups: string[]
}

type EventNotificationParams = {
  eventType: string
  eventId: string
  message: string
  notificationType: string
  minutesBefore: number
}

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

export async function sendEmailNotification(params: EmailNotificationParams) {
  try {
    // Überprüfen, ob SendGrid API-Schlüssel konfiguriert ist
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SendGrid API-Schlüssel nicht konfiguriert")
      return {
        success: false,
        error: "E-Mail-Dienst ist nicht konfiguriert. Bitte fügen Sie den SendGrid API-Schlüssel hinzu.",
        count: 0,
      }
    }

    // Benutzer basierend auf dem ausgewählten Empfängertyp abrufen
    const { data: users, error } = await getUsersByType(params.recipientType)

    if (error) {
      console.error("Fehler beim Abrufen der Benutzer:", error)
      return {
        success: false,
        error: "Fehler beim Abrufen der Benutzer",
        count: 0,
      }
    }

    if (!users || users.length === 0) {
      return {
        success: false,
        error: "Keine Empfänger gefunden",
        count: 0,
      }
    }

    // In einer echten Anwendung würden wir hier SendGrid verwenden, um E-Mails zu senden
    // Für dieses Beispiel simulieren wir den Versand
    console.log(`[E-Mail] Sende E-Mail an ${users.length} Empfänger:`)
    console.log(`[E-Mail] Betreff: ${params.subject}`)
    console.log(`[E-Mail] Inhalt: ${params.content}`)

    // E-Mail-Versand in der Datenbank protokollieren
    const { error: logError } = await supabase.from("notification_logs").insert({
      type: "email",
      recipient_count: users.length,
      subject: params.subject,
      content: params.content,
      sent_at: new Date().toISOString(),
      status: "sent",
    })

    if (logError) {
      console.error("Fehler beim Protokollieren der E-Mail-Benachrichtigung:", logError)
    }

    return {
      success: true,
      count: users.length,
    }
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail-Benachrichtigung:", error)
    return {
      success: false,
      error: "Ein unerwarteter Fehler ist aufgetreten",
      count: 0,
    }
  }
}

export async function sendWhatsAppNotification(params: WhatsAppNotificationParams) {
  try {
    // Überprüfen, ob Twilio API-Schlüssel konfiguriert sind
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.error("Twilio API-Schlüssel nicht konfiguriert")
      return {
        success: false,
        error: "WhatsApp-Dienst ist nicht konfiguriert. Bitte fügen Sie die Twilio API-Schlüssel hinzu.",
        count: 0,
      }
    }

    // Benutzer basierend auf dem ausgewählten Empfängertyp abrufen
    const { data: users, error } = await getUsersByType(params.recipientType)

    if (error) {
      console.error("Fehler beim Abrufen der Benutzer:", error)
      return {
        success: false,
        error: "Fehler beim Abrufen der Benutzer",
        count: 0,
      }
    }

    if (!users || users.length === 0) {
      return {
        success: false,
        error: "Keine Empfänger gefunden",
        count: 0,
      }
    }

    // Filtern Sie Benutzer ohne Telefonnummer heraus
    const usersWithPhone = users.filter((user) => user.phone)

    if (usersWithPhone.length === 0) {
      return {
        success: false,
        error: "Keine Empfänger mit Telefonnummer gefunden",
        count: 0,
      }
    }

    // Für Testzwecke verwenden wir nur die erste Telefonnummer
    const testUser = usersWithPhone[0]
    const toNumber = testUser.phone // Telefonnummer im Format +491234567890

    // WhatsApp-Nachricht senden
    const result = await sendTwilioWhatsAppMessage(toNumber, params.content)

    if (!result.success) {
      return {
        success: false,
        error: `Fehler beim Senden der WhatsApp-Nachricht: ${result.error}`,
        count: 0,
      }
    }

    console.log(`[WhatsApp] Testnachricht gesendet an: ${toNumber}`)
    console.log(`[WhatsApp] Inhalt: ${params.content}`)

    // In einer Produktionsumgebung würden wir hier alle Nachrichten senden
    console.log(`[WhatsApp] In der Produktion würden ${usersWithPhone.length} Nachrichten gesendet werden`)

    // WhatsApp-Versand in der Datenbank protokollieren
    const { error: logError } = await supabase.from("notification_logs").insert({
      type: "whatsapp",
      recipient_count: usersWithPhone.length,
      content: params.content,
      sent_at: new Date().toISOString(),
      status: "sent",
    })

    if (logError) {
      console.error("Fehler beim Protokollieren der WhatsApp-Benachrichtigung:", logError)
    }

    return {
      success: true,
      count: usersWithPhone.length,
    }
  } catch (error) {
    console.error("Fehler beim Senden der WhatsApp-Benachrichtigung:", error)
    return {
      success: false,
      error: "Ein unerwarteter Fehler ist aufgetreten",
      count: 0,
    }
  }
}

export async function scheduleEventNotification(params: EventNotificationParams) {
  try {
    let eventTime: string | null = null
    let eventName: string | null = null

    // Ereignisdetails abrufen
    if (params.eventType === "artist_performance") {
      // Künstlerauftritt-Details abrufen
      const { data: performance, error: performanceError } = await supabase
        .from("performances")
        .select("*, artists(name)")
        .eq("artist_id", params.eventId)
        .single()

      if (performanceError || !performance) {
        console.error("Fehler beim Abrufen der Auftrittsdetails:", performanceError)
        return {
          success: false,
          error: "Auftrittsdetails konnten nicht gefunden werden",
        }
      }

      eventTime = performance.date + " " + performance.time
      eventName = performance.artists?.name || "Unbekannter Künstler"
    } else if (params.eventType.includes("auction")) {
      // Auktionsdetails abrufen
      const { data: auction, error: auctionError } = await supabase
        .from("auction_items")
        .select("*")
        .eq("id", params.eventId)
        .single()

      if (auctionError || !auction) {
        console.error("Fehler beim Abrufen der Auktionsdetails:", auctionError)
        return {
          success: false,
          error: "Auktionsdetails konnten nicht gefunden werden",
        }
      }

      eventTime = params.eventType === "auction_start" ? auction.starts_at : auction.ends_at
      eventName = auction.title
    }

    if (!eventTime) {
      return {
        success: false,
        error: "Ereigniszeit konnte nicht ermittelt werden",
      }
    }

    // Berechnen der Benachrichtigungszeit (X Minuten vor dem Ereignis)
    const eventDate = new Date(eventTime)
    const notificationDate = new Date(eventDate.getTime() - params.minutesBefore * 60 * 1000)

    // Überprüfen, ob die Benachrichtigungszeit in der Vergangenheit liegt
    if (notificationDate < new Date()) {
      return {
        success: false,
        error: "Die Benachrichtigungszeit liegt in der Vergangenheit",
      }
    }

    // Ereignisbenachrichtigung in der Datenbank speichern
    const { error: insertError } = await supabase.from("scheduled_notifications").insert({
      event_type: params.eventType,
      event_id: params.eventId,
      event_name: eventName,
      event_time: eventTime,
      notification_type: params.notificationType,
      message: params.message,
      scheduled_for: notificationDate.toISOString(),
      status: "scheduled",
    })

    if (insertError) {
      console.error("Fehler beim Speichern der geplanten Benachrichtigung:", insertError)
      return {
        success: false,
        error: "Fehler beim Speichern der geplanten Benachrichtigung",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Fehler beim Planen der Ereignisbenachrichtigung:", error)
    return {
      success: false,
      error: "Ein unerwarteter Fehler ist aufgetreten",
    }
  }
}

// Hilfsfunktion zum Abrufen von Benutzern basierend auf dem Typ
async function getUsersByType(recipientType: string) {
  try {
    let query = supabase.from("users").select("*")

    switch (recipientType) {
      case "ticket_holders":
        // Benutzer mit Tickets
        query = supabase.from("users").select("*, tickets(*)").not("tickets", "is", null)
        break
      case "donors":
        // Benutzer, die gespendet haben
        query = supabase.from("users").select("*, donations(*)").not("donations", "is", null)
        break
      case "bidders":
        // Benutzer, die geboten haben
        query = supabase.from("users").select("*, bids(*)").not("bids", "is", null)
        break
      case "all":
      default:
        // Alle Benutzer
        query = supabase.from("users").select("*")
        break
    }

    const { data, error } = await query

    return { data, error }
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzer:", error)
    return { data: null, error }
  }
}
