"use client"

import { useEffect, useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { AdminGuard } from "@/components/auth-guard"
import { supabase } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Ticket, Heart, Gavel } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    totalDonations: 0,
    totalAuctions: 0,
    revenueData: [] as { name: string; umsatz: number }[],
  })

  useEffect(() => {
    const fetchStats = async () => {
      // Benutzerstatistiken
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Ticketstatistiken
      const { count: ticketCount } = await supabase.from("tickets").select("*", { count: "exact", head: true })

      // Spendenstatistiken
      const { count: donationCount } = await supabase.from("donations").select("*", { count: "exact", head: true })

      // Auktionsstatistiken
      const { count: auctionCount } = await supabase.from("auction_items").select("*", { count: "exact", head: true })

      // Umsatzdaten für das Diagramm (simuliert)
      const revenueData = [
        { name: "Jan", umsatz: 4000 },
        { name: "Feb", umsatz: 3000 },
        { name: "Mär", umsatz: 2000 },
        { name: "Apr", umsatz: 2780 },
        { name: "Mai", umsatz: 1890 },
        { name: "Jun", umsatz: 2390 },
        { name: "Jul", umsatz: 3490 },
      ]

      setStats({
        totalUsers: userCount || 0,
        totalTickets: ticketCount || 0,
        totalDonations: donationCount || 0,
        totalAuctions: auctionCount || 0,
        revenueData,
      })
    }

    fetchStats()
  }, [])

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <h1 className="text-2xl font-bold text-festival-900 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Benutzer</p>
                    <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Ticket className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tickets</p>
                    <h3 className="text-2xl font-bold">{stats.totalTickets}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Spenden</p>
                    <h3 className="text-2xl font-bold">{stats.totalDonations}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Gavel className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Auktionen</p>
                    <h3 className="text-2xl font-bold">{stats.totalAuctions}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardContent className="p-4">
                <h2 className="font-bold text-festival-800 mb-4">Umsatzübersicht</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="umsatz" fill="#1a8fe8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="font-bold text-festival-800 mb-4">Neueste Benutzer</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>max.mustermann@example.com</span>
                      <span className="text-gray-500">Vor 2 Stunden</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>anna.schmidt@example.com</span>
                      <span className="text-gray-500">Vor 5 Stunden</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>peter.mueller@example.com</span>
                      <span className="text-gray-500">Vor 1 Tag</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h2 className="font-bold text-festival-800 mb-4">Neueste Transaktionen</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>3-Tages Festival Pass</span>
                      <span className="text-green-600 font-medium">99,00 €</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Spende: Sauberes Wasser</span>
                      <span className="text-green-600 font-medium">50,00 €</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>VIP Pass</span>
                      <span className="text-green-600 font-medium">199,00 €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
