import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin } from "lucide-react"

interface FeaturedArtistProps {
  name: string
  image: string
  time: string
  stage: string
}

export function FeaturedArtist({ name, image, time, stage }: FeaturedArtistProps) {
  return (
    <Link href={`/lineup/${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-4 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-20 h-20 rounded-full overflow-hidden">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-festival-800">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-festival-600">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-festival-600">
            <MapPin className="h-3 w-3" />
            <span>{stage}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
