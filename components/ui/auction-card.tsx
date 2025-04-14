import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Auction } from "@/lib/types"
import { formatDateTime, formatCurrency, getRemainingTime } from "@/lib/utils"
import Link from "next/link"

interface AuctionCardProps {
  auction: Auction
  isPast?: boolean
}

export function AuctionCard({ auction, isPast = false }: AuctionCardProps) {
  const remainingTime = getRemainingTime(auction.end_time)

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {auction.image_url ? (
          <Image
            src={auction.image_url || "/placeholder.svg"}
            alt={auction.title}
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
        <CardTitle>{auction.title}</CardTitle>
        <CardDescription>
          {isPast ? "Endete am" : "Endet am"} {formatDateTime(auction.end_time)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 mb-3">{auction.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Aktuelles Gebot</p>
            <p className="text-lg font-bold">{formatCurrency(auction.current_bid || auction.starting_bid)}</p>
          </div>
          {!isPast && (
            <div>
              <p className="text-sm text-gray-500">Verbleibend</p>
              <p className={`text-sm font-medium ${remainingTime.includes("abgelaufen") ? "text-red-500" : ""}`}>
                {remainingTime}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isPast ? (
          <Button variant="outline" disabled>
            Versteigerung beendet
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/auctions/${auction.id}`}>Gebot abgeben</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
