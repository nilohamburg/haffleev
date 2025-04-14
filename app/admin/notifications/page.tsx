"use client"

import { useState, useEffect } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminGuard } from "@/components/auth-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { sendEmailNotification, sendWhatsAppNotification, scheduleEventNotification } from "@/app/actions/notifications"
import { Mail, MessageSquare, Send, Calendar, Bell } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function AdminNotificationsPage() {
  // E-Mail-Benachrichtigungen
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [emailRecipientType, setEmailRecipientType] = useState("all")
  const [emailSending, setEmailSending] = useState(false)

  // WhatsApp-Benachrichtigungen
  const [whatsappContent, setWhatsappContent] = useState("")
  const [whatsappRecipientType, setWhatsappRecipientType] = useState("all")
  const [whatsappSending, setWhatsappSending] = useState(false)

  // Ereignisbasierte Benachrichtigungen
  const [eventType, setEventType] = useState("artist_performance")
  const [eventId, setEventId] = useState("")
  const [eventMessage, setEventMessage] = useState("")
  const [eventNotificationType, setEventNotificationType] = useState("whatsapp")
  const [eventMinutesBefore, setEventMinutesBefore] = useState("30")
  const [eventScheduling, setEventScheduling] = useState(false)
  const [artists, setArtists] = useState([])
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)

  // Benutzergruppen für gezielte Benachrichtigungen
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // Laden der Künstler und Auktionen für die Dropdown-Menüs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Künstler laden
        const { data: artistsData, error: artistsError } = await supabase
          .from("artists")
          .select("id, name")
          .order("name")

        if (artistsError) throw artistsError

        // Auktionen laden
        const { data: auctionsData, error: auctionsError } = await supabase
          .from("auction_items")
          .select("id, title")
          .order("title")

        if (auctionsError) throw auctionsError

        setArtists(artistsData || [])
        setAuctions(auctionsData || [])
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error)
        toast({
          title: "Fehler",
          description: "Beim Laden der Daten ist ein Fehler aufgetreten",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Betreff ein",
        variant: "destructive",
      })
      return
    }

    if (!emailContent.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Inhalt ein",
        variant: "destructive",
      })
      return
    }

    try {
      setEmailSending(true)

      const result = await sendEmailNotification({
        subject: emailSubject,
        content: emailContent,
        recipientType: emailRecipientType,
        selectedGroups: selectedGroups,
      })

      if (result.success) {
        toast({
          title: "Erfolg",
          description: `${result.count} E-Mails wurden erfolgreich in die Warteschlange gestellt`,
        })
        // Formular zurücksetzen
        setEmailSubject("")
        setEmailContent("")
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Beim Senden der E-Mails ist ein Fehler aufgetreten",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fehler beim Senden der E-Mails:", error)
      toast({
        title: "Fehler",
        description: "Beim Senden der E-Mails ist ein unerwarteter Fehler aufgetreten",
        variant: "destructive",
      })
    } finally {
      setEmailSending(false)
    }
  }

  const handleSendWhatsApp = async () => {
    if (!whatsappContent.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Inhalt ein",
        variant: "destructive",
      })
      return
    }

    try {
      setWhatsappSending(true)

      const result = await sendWhatsAppNotification({
        content: whatsappContent,
        recipientType: whatsappRecipientType,
        selectedGroups: selectedGroups,
      })

      if (result.success) {
        toast({
          title: "Erfolg",
          description: `${result.count} WhatsApp-Nachrichten wurden erfolgreich in die Warteschlange gestellt`,
        })
        // Formular zurücksetzen
        setWhatsappContent("")
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Beim Senden der WhatsApp-Nachrichten ist ein Fehler aufgetreten",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fehler beim Senden der WhatsApp-Nachrichten:", error)
      toast({
        title: "Fehler",
        description: "Beim Senden der WhatsApp-Nachrichten ist ein unerwarteter Fehler aufgetreten",
        variant: "destructive",
      })
    } finally {
      setWhatsappSending(false)
    }
  }

  const handleScheduleEventNotification = async () => {
    if (!eventId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Ereignis aus",
        variant: "destructive",
      })
      return
    }

    if (!eventMessage.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Nachricht ein",
        variant: "destructive",
      })
      return
    }

    try {
      setEventScheduling(true)

      const result = await scheduleEventNotification({
        eventType,
        eventId,
        message: eventMessage,
        notificationType: eventNotificationType,
        minutesBefore: Number.parseInt(eventMinutesBefore),
      })

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Die ereignisbasierte Benachrichtigung wurde erfolgreich geplant",
        })
        // Formular zurücksetzen
        setEventMessage("")
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Beim Planen der Benachrichtigung ist ein Fehler aufgetreten",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fehler beim Planen der Benachrichtigung:", error)
      toast({
        title: "Fehler",
        description: "Beim Planen der Benachrichtigung ist ein unerwarteter Fehler aufgetreten",
        variant: "destructive",
      })
    } finally {
      setEventScheduling(false)
    }
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-festival-900">Benachrichtigungen</h1>
              <Link href="/admin/notifications/scheduled">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Geplante Benachrichtigungen
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="whatsapp" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger
                  value="whatsapp"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ereignisse
                </TabsTrigger>
              </TabsList>

              {/* WhatsApp-Benachrichtigungen */}
              <TabsContent value="whatsapp">
                <Card>
                  <CardHeader>
                    <CardTitle>WhatsApp-Nachricht senden</CardTitle>
                    <CardDescription>Senden Sie WhatsApp-Nachrichten an registrierte Benutzer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappRecipientType">Empfänger</Label>
                      <Select value={whatsappRecipientType} onValueChange={setWhatsappRecipientType}>
                        <SelectTrigger id="whatsappRecipientType">
                          <SelectValue placeholder="Empfänger auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Benutzer</SelectItem>
                          <SelectItem value="ticket_holders">Ticketbesitzer</SelectItem>
                          <SelectItem value="donors">Spender</SelectItem>
                          <SelectItem value="bidders">Bieter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappContent">Nachricht</Label>
                      <Textarea
                        id="whatsappContent"
                        value={whatsappContent}
                        onChange={(e) => setWhatsappContent(e.target.value)}
                        placeholder="Inhalt der WhatsApp-Nachricht"
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSendWhatsApp} disabled={whatsappSending} className="w-full">
                      {whatsappSending ? (
                        "Wird gesendet..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          WhatsApp-Nachricht senden
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* E-Mail-Benachrichtigungen */}
              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>E-Mail-Benachrichtigung senden</CardTitle>
                    <CardDescription>Senden Sie E-Mail-Benachrichtigungen an registrierte Benutzer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailRecipientType">Empfänger</Label>
                      <Select value={emailRecipientType} onValueChange={setEmailRecipientType}>
                        <SelectTrigger id="emailRecipientType">
                          <SelectValue placeholder="Empfänger auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Benutzer</SelectItem>
                          <SelectItem value="ticket_holders">Ticketbesitzer</SelectItem>
                          <SelectItem value="donors">Spender</SelectItem>
                          <SelectItem value="bidders">Bieter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Betreff</Label>
                      <Input
                        id="emailSubject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Betreff der E-Mail"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailContent">Inhalt</Label>
                      <Textarea
                        id="emailContent"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Inhalt der E-Mail"
                        rows={8}
                      />
                    </div>

                    <Button onClick={handleSendEmail} disabled={emailSending} className="w-full">
                      {emailSending ? (
                        "Wird gesendet..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          E-Mail senden
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ereignisbasierte Benachrichtigungen */}
              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Ereignisbasierte Benachrichtigungen</CardTitle>
                    <CardDescription>
                      Planen Sie Benachrichtigungen für bestimmte Ereignisse wie Künstlerauftritte oder Auktionen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventType">Ereignistyp</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger id="eventType">
                          <SelectValue placeholder="Ereignistyp auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="artist_performance">Künstlerauftritt</SelectItem>
                          <SelectItem value="auction_start">Auktionsstart</SelectItem>
                          <SelectItem value="auction_end">Auktionsende</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventId">{eventType === "artist_performance" ? "Künstler" : "Auktion"}</Label>
                      <Select value={eventId} onValueChange={setEventId}>
                        <SelectTrigger id="eventId">
                          <SelectValue
                            placeholder={`${eventType === "artist_performance" ? "Künstler" : "Auktion"} auswählen`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {eventType === "artist_performance"
                            ? artists.map((artist: any) => (
                                <SelectItem key={artist.id} value={artist.id.toString()}>
                                  {artist.name}
                                </SelectItem>
                              ))
                            : auctions.map((auction: any) => (
                                <SelectItem key={auction.id} value={auction.id.toString()}>
                                  {auction.title}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventNotificationType">Benachrichtigungstyp</Label>
                      <Select value={eventNotificationType} onValueChange={setEventNotificationType}>
                        <SelectTrigger id="eventNotificationType">
                          <SelectValue placeholder="Benachrichtigungstyp auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">E-Mail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventMinutesBefore">Minuten vor dem Ereignis</Label>
                      <Select value={eventMinutesBefore} onValueChange={setEventMinutesBefore}>
                        <SelectTrigger id="eventMinutesBefore">
                          <SelectValue placeholder="Zeit auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Minuten</SelectItem>
                          <SelectItem value="30">30 Minuten</SelectItem>
                          <SelectItem value="60">1 Stunde</SelectItem>
                          <SelectItem value="120">2 Stunden</SelectItem>
                          <SelectItem value="1440">1 Tag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventMessage">Nachricht</Label>
                      <Textarea
                        id="eventMessage"
                        value={eventMessage}
                        onChange={(e) => setEventMessage(e.target.value)}
                        placeholder="Inhalt der Benachrichtigung"
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleScheduleEventNotification} disabled={eventScheduling} className="w-full">
                      {eventScheduling ? (
                        "Wird geplant..."
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Benachrichtigung planen
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hinweis zur Twilio WhatsApp-Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <h3 className="font-medium text-yellow-800 mb-2">Twilio WhatsApp Sandbox-Modus</h3>
                    <p className="text-yellow-700 mb-4">
                      Diese Funktion verwendet die Twilio WhatsApp Sandbox. Um Nachrichten zu erhalten, müssen Sie
                      folgende Schritte durchführen:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-yellow-700">
                      <li>
                        Öffnen Sie WhatsApp auf Ihrem Telefon und senden Sie die Nachricht{" "}
                        <strong>join plenty-drawn</strong> an die Nummer <strong>+1 415 523 8886</strong>
                      </li>
                      <li>
                        Warten Sie auf die Bestätigungsnachricht von Twilio, die bestätigt, dass Ihre Nummer für die
                        Sandbox verifiziert wurde
                      </li>
                      <li>
                        Geben Sie Ihre verifizierte Telefonnummer im internationalen Format (z.B. +491234567890) in
                        Ihrem Benutzerprofil ein
                      </li>
                      <li>Jetzt können Sie WhatsApp-Nachrichten von der Festival-App erhalten</li>
                    </ol>
                    <p className="mt-4 text-yellow-700">
                      <strong>Wichtig:</strong> Im Sandbox-Modus können Sie nur an verifizierte Telefonnummern senden,
                      und Sie haben nach dem ersten Kontakt 24 Stunden Zeit, um Nachrichten zu senden, bevor Sie eine
                      Vorlage verwenden müssen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <Toaster />
      </div>
    </AdminGuard>
  )
}
