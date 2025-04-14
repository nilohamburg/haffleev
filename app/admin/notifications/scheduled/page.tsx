"use client"

import { useState, useEffect } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowLeft, Calendar, Mail, MessageSquare, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default function ScheduledNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .order("scheduled_for", { ascending: true })

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error("Fehler beim Laden der geplanten Benachrichtigungen:", error)
      toast({
        title: "Fehler",
        description: "Beim Laden der geplanten Benachrichtigungen ist ein Fehler aufgetreten",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase.from("scheduled_notifications").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Erfolg",
        description: "Die geplante Benachrichtigung wurde gelöscht",
      })

      // Liste aktualisieren
      setNotifications(notifications.filter((notification) => notification.id !== id))
    } catch (error) {
      console.error("Fehler beim Löschen der Benachrichtigung:", error)
      toast({
        title: "Fehler",
        description: "Beim Löschen der Benachrichtigung ist ein Fehler aufgetreten",
        variant: "destructive",
      })
    }
  }

  const formatDateTime = (dateTimeStr) => {
    try {
      return format(new Date(dateTimeStr), "dd.MM.yyyy HH:mm", { locale: de })
    } catch (error) {
      return "Ungültiges Datum"
    }
  }

  const getEventTypeLabel = (eventType) => {
    switch (eventType) {
      case "artist_performance":
        return "Künstlerauftritt"
      case "auction_start":
        return "Auktionsstart"
      case "auction_end":
        return "Auktionsende"
      default:
        return eventType
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Geplant
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Gesendet
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Fehlgeschlagen
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
              <div className="flex items-center gap-2">
                <Link href="/admin/notifications">
                  <Button variant="outline" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-festival-900">Geplante Benachrichtigungen</h1>
              </div>
              <Button onClick={fetchNotifications} variant="outline" disabled={loading}>
                {loading ? "Wird geladen..." : "Aktualisieren"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Übersicht</CardTitle>
                <CardDescription>
                  Alle geplanten Benachrichtigungen für Ereignisse wie Künstlerauftritte oder Auktionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-festival-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Keine geplanten Benachrichtigungen vorhanden</p>
                    <Link href="/admin/notifications">
                      <Button variant="outline" className="mt-4">
                        Benachrichtigung planen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ereignis</TableHead>
                          <TableHead>Ereigniszeit</TableHead>
                          <TableHead>Benachrichtigungszeit</TableHead>
                          <TableHead>Typ</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Nachricht</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.map((notification) => (
                          <TableRow key={notification.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{notification.event_name}</div>
                                <div className="text-sm text-gray-500">
                                  {getEventTypeLabel(notification.event_type)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDateTime(notification.event_time)}</TableCell>
                            <TableCell>{formatDateTime(notification.scheduled_for)}</TableCell>
                            <TableCell>
                              {notification.notification_type === "whatsapp" ? (
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1 text-green-600" />
                                  <span>WhatsApp</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1 text-blue-600" />
                                  <span>E-Mail</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(notification.status)}</TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={notification.message}>
                                {notification.message}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNotification(notification.id)}
                                disabled={notification.status === "sent"}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

        <Toaster />
      </div>
    </AdminGuard>
  )
}
