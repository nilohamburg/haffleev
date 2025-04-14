import Image from "next/image"
import Link from "next/link"
import { FestivalHeader } from "@/components/festival-header"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Instagram, MapPin, Music, Twitter } from "lucide-react"

// Importiere die BottomNavigation-Komponente am Anfang der Datei
import { BottomNavigation } from "@/components/bottom-navigation"

// This would come from your backend in a real app
// For demo purposes, we're using a static object
const artistsData = {
  "dj-harmony": {
    name: "DJ Harmony",
    image: "/placeholder.svg?height=300&width=300",
    bio: "DJ Harmony is known for blending electronic beats with charitable causes. With over 10 years of experience, she has performed at numerous charity events worldwide.",
    genre: "Electronic",
    socials: {
      instagram: "djharmony",
      twitter: "djharmony",
    },
    performances: [{ date: "Friday, Sep 6", time: "16:30", stage: "Main Stage" }],
  },
  "the-givers": {
    name: "The Givers",
    image: "/placeholder.svg?height=300&width=300",
    bio: "The Givers are a rock band dedicated to social causes. Their music combines powerful lyrics with energetic performances that inspire audiences to take action.",
    genre: "Rock",
    socials: {
      instagram: "thegivers",
      twitter: "thegivers",
    },
    performances: [{ date: "Friday, Sep 6", time: "18:00", stage: "Forest Stage" }],
  },
  "echo-collective": {
    name: "Echo Collective",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Echo Collective creates indie music that resonates with themes of community and environmental awareness. Their harmonious sounds create an immersive experience.",
    genre: "Indie",
    socials: {
      instagram: "echocollective",
      twitter: "echocollective",
    },
    performances: [{ date: "Saturday, Sep 7", time: "18:30", stage: "Forest Stage" }],
  },
}

export default function ArtistPage({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch this data from your backend
  const artist = artistsData[params.slug] || {
    name: "Artist Not Found",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Information not available",
    genre: "Unknown",
    socials: {},
    performances: [],
  }

  // Ändere den return-Wert, um die BottomNavigation-Komponente einzubinden
  // Füge pb-20 zur äußersten div-Klasse hinzu, um Platz für die Navigation zu schaffen
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <Link href="/lineup" className="text-festival-600 mb-4 inline-block">
          ← Back to Line-up
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="relative h-48 w-full">
            <Image src={artist.image || "/placeholder.svg"} alt={artist.name} fill className="object-cover" />
          </div>

          <div className="p-4">
            <h1 className="text-2xl font-bold text-festival-900">{artist.name}</h1>
            <div className="flex items-center gap-1 text-festival-600 mt-1 mb-4">
              <Music className="h-4 w-4" />
              <span>{artist.genre}</span>
            </div>

            <p className="text-gray-700 mb-6">{artist.bio}</p>

            <div className="flex gap-3 mb-6">
              {artist.socials.instagram && (
                <a href={`https://instagram.com/${artist.socials.instagram}`} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-festival-200 hover:bg-festival-100"
                  >
                    <Instagram className="h-4 w-4 text-festival-600" />
                  </Button>
                </a>
              )}
              {artist.socials.twitter && (
                <a href={`https://twitter.com/${artist.socials.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-festival-200 hover:bg-festival-100"
                  >
                    <Twitter className="h-4 w-4 text-festival-600" />
                  </Button>
                </a>
              )}
            </div>

            <h2 className="font-bold text-festival-800 mb-3">Performances</h2>
            {artist.performances.length > 0 ? (
              <div className="space-y-3">
                {artist.performances.map((performance, index) => (
                  <div key={index} className="p-3 bg-festival-50 rounded-lg">
                    <div className="flex items-center gap-1 text-festival-700 mb-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{performance.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-festival-700 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>{performance.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-festival-700">
                      <MapPin className="h-4 w-4" />
                      <span>{performance.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No scheduled performances</p>
            )}
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
