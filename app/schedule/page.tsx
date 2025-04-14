import Link from "next/link"
import { FestivalHeader } from "@/components/festival-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Music } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

// Dies würde in einer echten App vom Backend kommen
const festivalDays = [
  { date: "2024-09-05", label: "Do, 5. Sep" },
  { date: "2024-09-06", label: "Fr, 6. Sep" },
  { date: "2024-09-07", label: "Sa, 7. Sep" },
]

// Beispiel-Zeitplandaten - würden vom Backend kommen
const scheduleData = {
  "2024-09-05": [
    { time: "16:00", artist: "DJ Opening", stage: "Hauptbühne" },
    { time: "17:30", artist: "The Volunteers", stage: "Waldbühne" },
    { time: "19:00", artist: "Charity Beats", stage: "Seebühne" },
    { time: "20:30", artist: "Giving Souls", stage: "Hauptbühne" },
    { time: "22:00", artist: "Night Helpers", stage: "Waldbühne" },
  ],
  "2024-09-06": [
    { time: "15:00", artist: "Hope Collective", stage: "Seebühne" },
    { time: "16:30", artist: "DJ Harmony", stage: "Hauptbühne" },
    { time: "18:00", artist: "The Givers", stage: "Waldbühne" },
    { time: "19:30", artist: "Donation Crew", stage: "Seebühne" },
    { time: "21:00", artist: "Charity Kings", stage: "Hauptbühne" },
    { time: "22:30", artist: "Midnight Helpers", stage: "Waldbühne" },
  ],
  "2024-09-07": [
    { time: "14:00", artist: "Young Volunteers", stage: "Waldbühne" },
    { time: "15:30", artist: "Hope Sisters", stage: "Seebühne" },
    { time: "17:00", artist: "The Fundraisers", stage: "Hauptbühne" },
    { time: "18:30", artist: "Echo Collective", stage: "Waldbühne" },
    { time: "20:00", artist: "Abschlusszeremonie", stage: "Hauptbühne" },
  ],
}

export default function SchedulePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Festival Zeitplan</h1>

        <Tabs defaultValue={festivalDays[0].date} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            {festivalDays.map((day) => (
              <TabsTrigger
                key={day.date}
                value={day.date}
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {festivalDays.map((day) => (
            <TabsContent key={day.date} value={day.date} className="space-y-4">
              {scheduleData[day.date].map((event, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center border-l-4 border-festival-500">
                      <div className="p-4 text-center min-w-[80px] bg-festival-50">
                        <span className="block font-bold text-festival-900">{event.time}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <Link href={`/lineup/${event.artist.toLowerCase().replace(/\s+/g, "-")}`}>
                          <h3 className="font-bold text-festival-800 hover:text-festival-600">{event.artist}</h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-festival-600 mt-1">
                          <Music className="h-3 w-3" />
                          <span>{event.stage}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
