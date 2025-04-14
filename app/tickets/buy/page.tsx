"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FestivalHeader } from "@/components/festival-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { createTicketCheckoutSession } from "@/app/actions/payment"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function BuyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Lade Ticket-Typen aus der Datenbank
    const fetchTicketTypes = async () => {
      const { data, error } = await supabase.from("ticket_types").select("*").gt("available_quantity", 0).order("price")

      if (error) {
        console.error("Fehler beim Laden der Ticket-Typen:", error)
        setError("Fehler beim Laden der Ticket-Typen. Bitte versuchen Sie es später erneut.")
      } else if (data) {
        setTicketTypes(data)
      }
    }

    fetchTicketTypes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTicket) {
      setError("Bitte wählen Sie einen Ticket-Typ aus.")
      return
    }

    if (!user) {
      router.push("/auth/login?redirect=/tickets/buy")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("ticketTypeId", selectedTicket)
    formData.append("userId", user.id)
    formData.append("quantity", quantity.toString())

    try {
      await createTicketCheckoutSession(formData)
    } catch (error) {
      console.error("Fehler beim Erstellen der Checkout-Session:", error)
      setError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
      setLoading(false)
    }
  }

  const getTicketPrice = () => {
    const ticket = ticketTypes.find((t) => t.id.toString() === selectedTicket)
    return ticket ? ticket.price * quantity : 0
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Tickets kaufen</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket-Typ auswählen</CardTitle>
              <CardDescription>Wählen Sie den gewünschten Ticket-Typ aus</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <RadioGroup value={selectedTicket} onValueChange={setSelectedTicket} className="space-y-4">
                {ticketTypes.length > 0 ? (
                  ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-start space-x-3 p-3 border border-festival-200 rounded-lg"
                    >
                      <RadioGroupItem value={ticket.id.toString()} id={`ticket-${ticket.id}`} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={`ticket-${ticket.id}`} className="font-medium text-festival-800 block">
                          {ticket.name} - {ticket.price.toFixed(2)}€
                        </Label>
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Verfügbar: {ticket.available_quantity} Tickets</p>
                      </div>
                      {ticket.image && (
                        <div className="w-16 h-16 relative">
                          <Image
                            src={ticket.image || "/placeholder.svg"}
                            alt={ticket.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">Keine Tickets verfügbar.</p>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anzahl</CardTitle>
              <CardDescription>Wählen Sie die Anzahl der Tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="quantity">Anzahl der Tickets</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                  className="bg-white border-festival-200 focus-visible:ring-festival-400"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung</CardTitle>
              <CardDescription>Überprüfen Sie Ihre Bestellung</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket-Typ:</span>
                  <span className="font-medium">
                    {selectedTicket ? ticketTypes.find((t) => t.id.toString() === selectedTicket)?.name : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anzahl:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold">Gesamtpreis:</span>
                  <span className="font-bold text-festival-900">{getTicketPrice().toFixed(2)}€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-festival-600 hover:bg-festival-700"
            disabled={loading || !selectedTicket || ticketTypes.length === 0}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Verarbeitung...
              </span>
            ) : (
              "Jetzt kaufen"
            )}
          </Button>
        </form>
      </main>

      <BottomNavigation />
    </div>
  )
}
