import Link from "next/link"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Gavel, Heart, LayoutDashboard, Music, Settings, Ticket, Users } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Admin Panel</h1>

        <div className="grid gap-4">
          <Link href="/admin/dashboard">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <LayoutDashboard className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Dashboard</h2>
                  <p className="text-sm text-gray-600">Overview and statistics</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/schedule">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <CalendarDays className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Schedule Management</h2>
                  <p className="text-sm text-gray-600">Manage festival days and performances</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/artists">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Music className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Artist Management</h2>
                  <p className="text-sm text-gray-600">Add and edit artist profiles</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/auctions">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Gavel className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Auction Management</h2>
                  <p className="text-sm text-gray-600">Create and monitor auctions</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/donations">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Heart className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Donation Management</h2>
                  <p className="text-sm text-gray-600">Manage charity projects and donations</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/tickets">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Ticket className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Ticket Management</h2>
                  <p className="text-sm text-gray-600">Manage and validate tickets</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Users className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">User Management</h2>
                  <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Settings className="h-5 w-5 text-festival-600" />
                </div>
                <div>
                  <h2 className="font-bold text-festival-800">Settings</h2>
                  <p className="text-sm text-gray-600">Configure app settings</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
