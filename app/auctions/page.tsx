import { supabase } from "@/lib/supabase"
import { FestivalHeader } from "@/components/festival-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuctionItem } from "@/components/auction-item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const revalidate = 0 // Keine Caching, immer aktuelle Daten

export default async function AuctionsPage() {
  // Aktive Auktionen abrufen
  const { data: activeAuctions, error: activeError } = await supabase
    .from("auction_items")
    .select("*")
    .eq("status", "active")
    .order("ends_at")

  if (activeError) {
    console.error("Fehler beim Laden der aktiven Auktionen:", activeError)
  }

  // Bevorstehende Auktionen abrufen
  const { data: upcomingAuctions, error: upcomingError } = await supabase
    .from("auction_items")
    .select("*")
    .eq("status", "upcoming")
    .order("starts_at")

  if (upcomingError) {
    console.error("Fehler beim Laden der bevorstehenden Auktionen:", upcomingError)
  }

  // Beendete Auktionen abrufen
  const { data: endedAuctions, error: endedError } = await supabase
    .from("auction_items")
    .select("*")
    .eq("status", "ended")
    .order("ends_at", { ascending: false })
    .limit(5)

  if (endedError) {
    console.error("Fehler beim Laden der beendeten Auktionen:", endedError)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Versteigerungen</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Aktiv
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Bevorstehend
            </TabsTrigger>
            <TabsTrigger
              value="ended"
              className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
            >
              Beendet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeAuctions && activeAuctions.length > 0 ? (
              activeAuctions.map((item) => <AuctionItem key={item.id} item={item} status="active" />)
            ) : (
              <p className="text-center py-8">Keine aktiven Versteigerungen gefunden.</p>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingAuctions && upcomingAuctions.length > 0 ? (
              upcomingAuctions.map((item) => <AuctionItem key={item.id} item={item} status="upcoming" />)
            ) : (
              <p className="text-center py-8">Keine bevorstehenden Versteigerungen gefunden.</p>
            )}
          </TabsContent>

          <TabsContent value="ended" className="space-y-6">
            {endedAuctions && endedAuctions.length > 0 ? (
              endedAuctions.map((item) => <AuctionItem key={item.id} item={item} status="ended" />)
            ) : (
              <p className="text-center py-8">Keine beendeten Versteigerungen gefunden.</p>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
