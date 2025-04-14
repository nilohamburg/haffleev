"use client"

import { useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, QrCode, Ticket, Upload } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function TicketsPage() {
  const [hasTicket, setHasTicket] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Tickets</h1>

        {hasTicket ? (
          <Card className="mb-8">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-festival-100 p-3 rounded-full mb-4">
                <Ticket className="h-6 w-6 text-festival-600" />
              </div>

              <h2 className="text-xl font-bold text-center text-festival-900 mb-2">Dein Ticket</h2>
              <p className="text-center text-gray-700 mb-6">
                Dein Festival-Ticket ist bereit! Zeige diesen QR-Code am Eingang.
              </p>

              <div className="bg-white p-4 rounded-lg border border-festival-200 mb-6">
                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-3">
                  <QrCode className="w-48 h-48 text-festival-900" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-festival-800">3-Tages Festival Pass</h3>
                  <p className="text-sm text-gray-600">Ticket #: HAF2024-12345</p>
                </div>
              </div>

              <Button variant="outline" className="border-festival-200 hover:bg-festival-100 hover:text-festival-900">
                Ticket herunterladen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-festival-100 p-3 rounded-full">
                  <Ticket className="h-6 w-6 text-festival-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-center text-festival-900 mb-2">Ticket hinzufügen</h2>
              <p className="text-center text-gray-700 mb-6">
                Lade deinen Ticket-QR-Code hoch oder scanne ihn mit deiner Kamera, um ihn zu deinem Profil hinzuzufügen.
              </p>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger
                    value="upload"
                    className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                  >
                    Hochladen
                  </TabsTrigger>
                  <TabsTrigger
                    value="scan"
                    className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                  >
                    Scannen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div className="mb-6">
                    <Label htmlFor="ticket-number" className="block text-sm font-medium text-gray-700 mb-2">
                      Ticketnummer
                    </Label>
                    <Input
                      id="ticket-number"
                      placeholder="Gib deine Ticketnummer ein"
                      className="bg-white border-festival-200 focus-visible:ring-festival-400 mb-4"
                    />

                    <div className="border-2 border-dashed border-festival-200 rounded-lg p-8 flex flex-col items-center justify-center bg-festival-50">
                      <Upload className="h-8 w-8 text-festival-400 mb-3" />
                      <p className="text-sm text-center text-gray-600 mb-3">
                        Ziehe dein Ticketbild hierher oder klicke zum Durchsuchen
                      </p>
                      <Button
                        variant="outline"
                        className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      >
                        Datei auswählen
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full bg-festival-600 hover:bg-festival-700" onClick={() => setHasTicket(true)}>
                    Ticket hochladen
                  </Button>
                </TabsContent>

                <TabsContent value="scan">
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-festival-200 rounded-lg p-4 flex flex-col items-center justify-center bg-festival-50 h-64">
                      <Camera className="h-8 w-8 text-festival-400 mb-3" />
                      <p className="text-sm text-center text-gray-600 mb-3">
                        Richte deine Kamera auf den QR-Code auf deinem Ticket
                      </p>
                      <Button
                        variant="outline"
                        className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      >
                        Kamera starten
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full bg-festival-600 hover:bg-festival-700" onClick={() => setHasTicket(true)}>
                    Ticket scannen
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-festival-800 mb-3">Ticket-Informationen</h2>
            <p className="text-gray-700 mb-4">
              Dein Festival-Ticket gewährt dir Zugang zu allen Bühnen und Auftritten vom 5. bis 7. September 2024. Bitte
              halte dein Ticket zum Scannen am Eingang bereit.
            </p>
            <p className="text-gray-700 mb-4">
              Wenn du noch kein Ticket gekauft hast, kannst du eines über unsere offizielle Website oder autorisierte
              Partner erwerben.
            </p>
            <Button className="w-full bg-festival-600 hover:bg-festival-700">Tickets kaufen</Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  )
}
