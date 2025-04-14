import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Artist } from "@/lib/types"

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {artist.image_url ? (
          <Image
            src={artist.image_url || "/placeholder.svg"}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Kein Bild</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{artist.name}</CardTitle>
        <CardDescription>{artist.genre}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{artist.description}</p>
      </CardContent>
      <CardFooter>
        {artist.website && (
          <Button variant="outline" asChild>
            <a href={artist.website} target="_blank" rel="noopener noreferrer">
              Website besuchen
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
