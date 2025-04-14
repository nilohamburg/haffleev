import { FestivalHeader } from "@/components/festival-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AmbulanceIcon as FirstAid, MapPin, Music, ParkingCircle, ShowerHead, Tent, Utensils } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Karte & Anfahrt</h1>

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Festivalgelände
            </TabsTrigger>
            <TabsTrigger
              value="directions"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Anfahrt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-6">
              {/* In einer echten App würde hier die Integration mit Mapbox oder Google Maps stehen */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">Hier würde die interaktive Karte angezeigt werden</p>
              </div>
            </div>

            <h2 className="font-bold text-festival-800 mb-3">Festival Standorte</h2>
            <div className="grid gap-3">
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <Music className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Hauptbühne</h3>
                    <p className="text-sm text-gray-500">Zentraler Bereich, größte Auftritte</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <Music className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Waldbühne</h3>
                    <p className="text-sm text-gray-500">Von Bäumen umgeben, intime Atmosphäre</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <Music className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Seebühne</h3>
                    <p className="text-sm text-gray-500">Wunderschöne Auftritte am Wasser</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <Utensils className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Essensbereich</h3>
                    <p className="text-sm text-gray-500">Verschiedene Essensanbieter und Sitzgelegenheiten</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <FirstAid className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Erste-Hilfe-Station</h3>
                    <p className="text-sm text-gray-500">Medizinische Hilfe und Notfälle</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <ShowerHead className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sanitäranlagen</h3>
                    <p className="text-sm text-gray-500">Toiletten, Duschen und Wasserstationen</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="bg-festival-100 p-2 rounded-full">
                    <Tent className="h-5 w-5 text-festival-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Campingbereich</h3>
                    <p className="text-sm text-gray-500">Ausgewiesene Campingzonen</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="directions" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold text-festival-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-festival-600" />
                  Festivalstandort
                </h2>
                <p className="text-gray-700 mb-3">
                  HAFFleev Festival Gelände
                  <br />
                  Seestraße 123
                  <br />
                  17429 Seebad Bansin
                </p>
                <div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                  {/* In einer echten App würde hier die Integration mit Mapbox oder Google Maps stehen */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Hier würde die Standortkarte angezeigt werden</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold text-festival-800 mb-3 flex items-center gap-2">
                  <ParkingCircle className="h-5 w-5 text-festival-600" />
                  Mit dem Auto
                </h2>
                <p className="text-gray-700 mb-3">
                  Von Berlin: A11 Richtung Stettin, dann B110 nach Usedom.
                  <br />
                  <br />
                  Von Hamburg: A20 Richtung Stralsund, dann B111 nach Usedom.
                  <br />
                  <br />
                  Parkplätze sind vor Ort für 10€ pro Tag verfügbar. Wir empfehlen Fahrgemeinschaften!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold text-festival-800 mb-3">Öffentliche Verkehrsmittel</h2>
                <p className="text-gray-700 mb-3">
                  Shuttle-Busse fahren vom Bahnhof Seebad Heringsdorf zum Festivalgelände alle 30 Minuten von 8:00 bis
                  24:00 Uhr.
                </p>
                <p className="text-gray-700">
                  Festival-Shuttle-Pässe sind für 5€ pro Tag oder 12€ für das Wochenende erhältlich.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
