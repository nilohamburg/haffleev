import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Heart, Ticket, Users, Gavel } from "lucide-react"
import { FestivalHeader } from "@/components/festival-header"
import { FeaturedArtist } from "@/components/featured-artist"
import { DonationProgress } from "@/components/donation-progress"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-festival-900 mb-4">HAFFleev Charity Festival 2024</h2>
          <p className="text-festival-700 mb-6">
            Sei dabei bei drei Tagen voller Musik, Kunst und Wohltätigkeit. 5.-7. September 2024.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link href="/schedule">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <CalendarDays className="h-6 w-6 text-festival-500" />
                <span>Zeitplan</span>
              </Button>
            </Link>
            <Link href="/lineup">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <Users className="h-6 w-6 text-festival-500" />
                <span>Line-up</span>
              </Button>
            </Link>
            <Link href="/auctions">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <Gavel className="h-6 w-6 text-festival-500" />
                <span>Versteigerungen</span>
              </Button>
            </Link>
            <Link href="/map">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <MapPin className="h-6 w-6 text-festival-500" />
                <span>Karte</span>
              </Button>
            </Link>
            <Link href="/donate">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <Heart className="h-6 w-6 text-festival-500" />
                <span>Spenden</span>
              </Button>
            </Link>
            <Link href="/tickets/buy">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-festival-200 hover:bg-festival-100 hover:text-festival-900"
              >
                <Ticket className="h-6 w-6 text-festival-500" />
                <span>Tickets</span>
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-festival-900 mb-4">Künstler im Fokus</h2>
          <div className="space-y-4">
            <FeaturedArtist
              name="DJ Harmony"
              image="/placeholder.svg?height=80&width=80"
              time="Freitag, 20:00 Uhr"
              stage="Hauptbühne"
            />
            <FeaturedArtist
              name="The Givers"
              image="/placeholder.svg?height=80&width=80"
              time="Samstag, 21:30 Uhr"
              stage="Waldbühne"
            />
            <FeaturedArtist
              name="Echo Collective"
              image="/placeholder.svg?height=80&width=80"
              time="Sonntag, 19:00 Uhr"
              stage="Seebühne"
            />
          </div>
          <div className="mt-4 text-center">
            <Link href="/lineup">
              <Button variant="link" className="text-festival-600 hover:text-festival-800">
                Alle Künstler anzeigen
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-festival-900 mb-4">Spendenfortschritt</h2>
          <DonationProgress raised={15750} goal={50000} donorsCount={128} projectsCount={3} />
          <div className="mt-4 text-center">
            <Link href="/donate">
              <Button className="bg-festival-600 hover:bg-festival-700 text-white">Jetzt Spenden</Button>
            </Link>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
