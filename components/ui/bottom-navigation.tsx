"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Map, QrCode, User } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

export function BottomNavigation() {
  const pathname = usePathname()
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [hasTicket, setHasTicket] = useState(false)
  const [ticketData, setTicketData] = useState<any>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkTicket = async () => {
      if (user) {
        const { data, error } = await supabase.from("tickets").select("*").eq("user_id", user.id).limit(1).single()

        if (data && !error) {
          setHasTicket(true)
          setTicketData(data)
        } else {
          setHasTicket(false)
          setTicketData(null)
        }
      }
    }

    if (user) {
      checkTicket()
    }
  }, [user])

  const handleQrClick = () => {
    if (!user) {
      router.push("/auth/login?redirect=/tickets")
      return
    }

    if (hasTicket) {
      setShowQrDialog(true)
    } else {
      router.push("/tickets/buy")
    }
  }

  // Verbesserte Funktion zum Navigieren zur Profilseite
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (loading) {
      // Warte, bis der Authentifizierungsstatus geladen ist
      return
    }

    if (user) {
      // Wenn der Benutzer angemeldet ist, direkt zur Profilseite navigieren
      router.push("/profile")
    } else {
      // Wenn nicht angemeldet, zur Anmeldeseite mit Redirect zur Profilseite
      router.push("/auth/login?redirect=/profile")
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-festival-100 z-10">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4 py-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                pathname === "/" ? "text-festival-600" : "text-gray-500"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Entdecken</span>
            </Button>
          </Link>

          <Link href="/schedule">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                pathname.startsWith("/schedule") ? "text-festival-600" : "text-gray-500"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Kalender</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 h-auto py-2 text-gray-500"
            onClick={handleQrClick}
          >
            <div className="bg-festival-600 text-white p-3 rounded-full -mt-8 shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-xs mt-1">QR</span>
          </Button>

          <Link href="/map">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                pathname.startsWith("/map") ? "text-festival-600" : "text-gray-500"
              }`}
            >
              <Map className="h-5 w-5" />
              <span className="text-xs">Karte</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${
              pathname.startsWith("/profile") ? "text-festival-600" : "text-gray-500"
            }`}
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Konto</span>
          </Button>
        </div>
      </div>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center p-4">
            <h2 className="text-xl font-bold text-center text-festival-900 mb-4">Dein Ticket</h2>
            <div className="bg-white p-4 rounded-lg border border-festival-200 mb-4">
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-3">
                <QrCode className="w-48 h-48 text-festival-900" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-festival-800">{ticketData?.ticket_type || "3-Tages Festival Pass"}</h3>
                <p className="text-sm text-gray-600">Ticket #: {ticketData?.ticket_number || "HAF2024-12345"}</p>
                {ticketData?.is_used && (
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
    </>
  )
}
