"use client"

import { useEffect, useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gavel, Heart, LogOut, QrCode, Ticket, Edit } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true)

        // Tickets abrufen
        const { data: ticketsData } = await supabase.from("tickets").select("*").eq("user_id", user.id)

        if (ticketsData) {
          setTickets(ticketsData)
        }

        // Gebote abrufen
        const { data: bidsData } = await supabase
          .from("bids")
          .select(`
            *,
            auction_item:auction_item_id (
              title,
              current_bid
            )
          `)
          .eq("user_id", user.id)

        if (bidsData) {
          setBids(bidsData)
        }

        // Spenden abrufen
        const { data: donationsData } = await supabase
          .from("donations")
          .select(`
            *,
            project:project_id (
              name
            )
          `)
          .eq("user_id", user.id)

        if (donationsData) {
          setDonations(donationsData)
        }

        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleShowTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowQrDialog(true)
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
        <FestivalHeader />

        <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
          <Card className="mb-6">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="w-24 h-24 border-4 border-festival-200">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Benutzer" />
                <AvatarFallback>
                  {user?.first_name?.charAt(0)}
                  {user?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-xl font-bold text-festival-900 mt-4">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-festival-600">{user?.email}</p>
              {user?.phone && <p className="text-festival-500">{user.phone}</p>}

              <div className="flex gap-3 mt-4">
                <Link href="/profile/edit">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Profil bearbeiten
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger
                value="tickets"
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger
                value="bids"
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                Gebote
              </TabsTrigger>
              <TabsTrigger
                value="donations"
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                Spenden
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-festival-100 p-3 rounded-full">
                          <Ticket className="h-5 w-5 text-festival-600" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-bold text-festival-800">{ticket.ticket_type}</h2>
                          <p className="text-sm text-gray-600">Ticket #: {ticket.ticket_number}</p>
                          <p className="text-xs text-gray-500">
                            Gekauft am: {new Date(ticket.purchase_date).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                          onClick={() => handleShowTicket(ticket)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Anzeigen
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <p className="text-gray-500 mb-4">Du hast noch keine Tickets gekauft.</p>
                </div>
              )}

              <Link href="/tickets/buy">
                <Button className="w-full bg-festival-600 hover:bg-festival-700">
                  {tickets.length > 0 ? "Weiteres Ticket kaufen" : "Ticket kaufen"}
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="bids">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                </div>
              ) : bids.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {bids.map((bid) => (
                    <Card key={bid.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-festival-100 p-3 rounded-full">
                          <Gavel className="h-5 w-5 text-festival-600" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-bold text-festival-800">{bid.auction_item?.title}</h2>
                          <p className="text-sm text-gray-600">
                            Dein Gebot: {(bid.amount / 100).toFixed(2)}€
                            {bid.auction_item?.current_bid === bid.amount ? " (Höchstgebot)" : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            Geboten am: {new Date(bid.created_at).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Link href={`/auctions/${bid.auction_item_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                          >
                            Anzeigen
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <p className="text-gray-500 mb-4">Du hast noch keine Gebote abgegeben.</p>
                </div>
              )}

              <Link href="/auctions">
                <Button className="w-full bg-festival-600 hover:bg-festival-700">Versteigerungen durchsuchen</Button>
              </Link>
            </TabsContent>

            <TabsContent value="donations">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {donations.map((donation) => (
                    <Card key={donation.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-festival-100 p-3 rounded-full">
                          <Heart className="h-5 w-5 text-festival-600" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-bold text-festival-800">{donation.project?.name}</h2>
                          <p className="text-sm text-gray-600">Gespendet: {(donation.amount / 100).toFixed(2)}€</p>
                          <p className="text-xs text-gray-500">
                            Gespendet am: {new Date(donation.created_at).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Link href={`/projects/${donation.project_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                          >
                            Anzeigen
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <p className="text-gray-500 mb-4">Du hast noch keine Spenden getätigt.</p>
                </div>
              )}

              <Link href="/donate">
                <Button className="w-full bg-festival-600 hover:bg-festival-700">Spenden</Button>
              </Link>
            </TabsContent>
          </Tabs>
        </main>

        <BottomNavigation />

        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center p-4">
              <h2 className="text-xl font-bold text-center text-festival-900 mb-4">Dein Ticket</h2>
              <div className="bg-white p-4 rounded-lg border border-festival-200 mb-4">
                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-3">
                  <QrCode className="w-48 h-48 text-festival-900" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-festival-800">{selectedTicket?.ticket_type}</h3>
                  <p className="text-sm text-gray-600">Ticket #: {selectedTicket?.ticket_number}</p>
                  {selectedTicket?.is_used && (
                    <p className="text-sm text-red-500 mt-2">Dieses Ticket wurde bereits verwendet</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                onClick={() => setShowQrDialog(false)}
              >
                Schließen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
