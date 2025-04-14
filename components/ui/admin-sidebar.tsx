"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Ticket, CalendarDays, Music, Gavel, Heart, Settings, LogOut, Bell } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path ? "bg-festival-100 text-festival-900" : "text-gray-600 hover:bg-gray-100"
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold text-festival-900">Admin Panel</h2>
      </div>

      <nav className="mt-4">
        <Link href="/admin/dashboard">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/dashboard")}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/users")}`}>
            <Users className="h-5 w-5" />
            <span>Benutzer</span>
          </div>
        </Link>

        <Link href="/admin/tickets">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/tickets")}`}>
            <Ticket className="h-5 w-5" />
            <span>Tickets</span>
          </div>
        </Link>

        <Link href="/admin/schedule">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/schedule")}`}>
            <CalendarDays className="h-5 w-5" />
            <span>Zeitplan</span>
          </div>
        </Link>

        <Link href="/admin/artists">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/artists")}`}>
            <Music className="h-5 w-5" />
            <span>Künstler</span>
          </div>
        </Link>

        <Link href="/admin/auctions">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/auctions")}`}>
            <Gavel className="h-5 w-5" />
            <span>Auktionen</span>
          </div>
        </Link>

        <Link href="/admin/donations">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/donations")}`}>
            <Heart className="h-5 w-5" />
            <span>Spenden</span>
          </div>
        </Link>

        <Link href="/admin/notifications">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/notifications")}`}>
            <Bell className="h-5 w-5" />
            <span>Benachrichtigungen</span>
          </div>
        </Link>

        <Link href="/admin/settings">
          <div className={`flex items-center gap-3 px-4 py-3 ${isActive("/admin/settings")}`}>
            <Settings className="h-5 w-5" />
            <span>Einstellungen</span>
          </div>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Abmelden</span>
        </button>
      </nav>
    </div>
  )
}
