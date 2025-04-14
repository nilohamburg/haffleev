"use client"

import { useEffect, useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminGuard } from "@/components/auth-guard"
import { supabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Search, Download, Plus, Check, X } from "lucide-react"
import type { Ticket, User } from "@/lib/supabase"

type TicketWithUser = Ticket & { user: User }

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketWithUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          user:user_id (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .order("purchase_date", { ascending: false })

      if (error) {
        console.error("Fehler beim Laden der Tickets:", error)
      } else if (data) {
        setTickets(data as TicketWithUser[])
      }

      setLoading(false)
    }

    fetchTickets()
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      ticket.ticket_number.toLowerCase().includes(searchLower) ||
      ticket.ticket_type.toLowerCase().includes(searchLower) ||
      (ticket.user?.email && ticket.user.email.toLowerCase().includes(searchLower)) ||
      (ticket.user?.first_name && ticket.user.first_name.toLowerCase().includes(searchLower)) ||
      (ticket.user?.last_name && ticket.user.last_name.toLowerCase().includes(searchLower))
    )
  })

  const handleToggleUsed = async (ticketId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("tickets").update({ is_used: !currentStatus }).eq("id", ticketId)

    if (!error) {
      setTickets(tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, is_used: !currentStatus } : ticket)))
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
              <h1 className="text-2xl font-bold text-festival-900">Ticket-Verwaltung</h1>

              <div className="flex gap-2">
                <Button variant="outline" className="border-festival-200 hover:bg-festival-100">
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
                <Button className="bg-festival-600 hover:bg-festival-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ticket erstellen
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Suche nach Ticket-Nr., Benutzer, Typ..."
                    className="pl-10 bg-white border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket-Nr.</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Kaufdatum</TableHead>
                      <TableHead>Preis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Keine Tickets gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                          <TableCell>
                            {ticket.user ? (
                              <div>
                                <div>{`${ticket.user.first_name} ${ticket.user.last_name}`}</div>
                                <div className="text-xs text-gray-500">{ticket.user.email}</div>
                              </div>
                            ) : (
                              "Unbekannt"
                            )}
                          </TableCell>
                          <TableCell>{ticket.ticket_type}</TableCell>
                          <TableCell>{new Date(ticket.purchase_date).toLocaleDateString("de-DE")}</TableCell>
                          <TableCell>{(ticket.price / 100).toFixed(2)}€</TableCell>
                          <TableCell>
                            {ticket.is_used ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Verwendet
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aktiv
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUsed(ticket.id, ticket.is_used)}
                              >
                                {ticket.is_used ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm">
                                QR
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
