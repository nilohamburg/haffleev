import { supabase } from "@/lib/supabase"
import { FestivalHeader } from "@/components/festival-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"

export const revalidate = 0 // Keine Caching, immer aktuelle Daten

// Formatiere das Datum für die Anzeige
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// Formatiere die Zeit für die Anzeige
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function LineupPage() {
  // Künstler abrufen
  const { data: artists, error: artistsError } = await supabase.from("artists").select("*").order("name")

  if (artistsError) {
    console.error("Fehler beim Laden der Künstler:", artistsError)
  }

  // Performances abrufen (anstelle von schedules)
  const { data: performances, error: performancesError } = await supabase
    .from("performances")
    .select("*")
    .order("date")
    .order("time")

  if (performancesError) {
    console.error("Fehler beim Laden der Performances:", performancesError)
  }

  // Wenn wir Performances haben, holen wir die zugehörigen Künstler
  let performancesWithArtists = []
  if (performances && performances.length > 0 && artists && artists.length > 0) {
    performancesWithArtists = performances.map((performance) => {
      const artist = artists.find((a) => a.id === performance.artist_id)
      return {
        ...performance,
        artist: artist || { name: "Unbekannter Künstler" },
      }
    })
  }

  // Gruppiere Performances nach Datum
  const performancesByDate = {}
  if (performancesWithArtists.length > 0) {
    performancesWithArtists.forEach((performance) => {
      if (!performancesByDate[performance.date]) {
        performancesByDate[performance.date] = []
      }
      performancesByDate[performance.date].push(performance)
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Festival Line-up</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-festival-400 h-4 w-4" />
          <Input
            placeholder="Künstler suchen..."
            className="pl-10 bg-white border-festival-200 focus-visible:ring-festival-400"
          />
        </div>

        <Tabs defaultValue="kuenstler" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger
              value="kuenstler"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Künstler
            </TabsTrigger>
            <TabsTrigger
              value="zeitplan"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Zeitplan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kuenstler">
            <div className="grid grid-cols-2 gap-4">
              {artists && artists.length > 0 ? (
                artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/lineup/${artist.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3">
                      <Image src={artist.image || "/placeholder.svg"} alt={artist.name} fill className="object-cover" />
                    </div>
                    <h3 className="font-bold text-festival-800 text-center">{artist.name}</h3>
                    <span className="text-sm text-festival-600">{artist.genre}</span>
                  </Link>
                ))
              ) : (
                <p className="col-span-2 text-center py-8">Keine Künstler gefunden.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="zeitplan">
            <div className="space-y-8">
              {Object.keys(performancesByDate).length > 0 ? (
                Object.entries(performancesByDate).map(([date, performances]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3">{formatDate(date)}</h3>
                    <div className="space-y-3">
                      {performances.map((performance) => (
                        <div
                          key={performance.id}
                          className="flex flex-col sm:flex-row border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="sm:w-1/4 font-medium">{performance.time}</div>
                          <div className="sm:w-3/4">
                            <div className="font-semibold">{performance.artist.name}</div>
                            <div className="text-sm text-gray-600">{performance.stage}</div>
                            {performance.description && <div className="mt-1 text-sm">{performance.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8">Kein Zeitplan verfügbar.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
