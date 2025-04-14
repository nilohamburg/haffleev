import { supabase } from "@/lib/supabase"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuctionBidForm } from "@/components/auction-bid-form"
import { formatDateTime, formatCurrency, getRemainingTime } from "@/lib/utils"
import Image from "next/image"
import { notFound } from "next/navigation"

export const revalidate = 0 // Keine Caching, immer aktuelle Daten

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const auctionId = Number.parseInt(params.id)

  if (isNaN(auctionId)) {
    notFound()
  }

  // Auktion abrufen
  const { data: auction, error } = await supabase.from("auctions").select("*").eq("id", auctionId).single()

  if (error || !auction) {
    notFound()
  }

  // Gebote abrufen
  const { data: bids, error: bidsError } = await supabase
    .from("auction_bids")
    .select("*, users(first_name, last_name)")
    .eq("auction_id", auctionId)
    .eq("status", "completed")
    .order("amount", { ascending: false })
    .limit(10)

  if (bidsError) {
    console.error("Fehler beim Laden der Gebote:", bidsError)
  }

  const isEnded = new Date(auction.end_time) < new Date()
  const remainingTime = getRemainingTime(auction.end_time)

  return (
    <div className="container pb-20">
      <h1 className="text-2xl font-bold my-4">{auction.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
            {auction.image_url ? (
              <Image
                src={auction.image_url || "/placeholder.svg"}
                alt={auction.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Kein Bild</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p>{auction.description}</p>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Startgebot:</span>
              <span className="font-medium">{formatCurrency(auction.starting_bid)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Aktuelles Gebot:</span>
              <span className="font-bold text-lg">{formatCurrency(auction.current_bid || auction.starting_bid)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Mindesterhöhung:</span>
              <span>{formatCurrency(auction.min_bid_increment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Endet am:</span>
              <span>{formatDateTime(auction.end_time)}</span>
            </div>
            {!isEnded && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Verbleibend:</span>
                <span className={remainingTime.includes("abgelaufen") ? "text-red-500" : ""}>{remainingTime}</span>
              </div>
            )}
          </div>

          {!isEnded ? (
            <AuctionBidForm
              auctionId={auction.id}
              currentBid={auction.current_bid || auction.starting_bid}
              minIncrement={auction.min_bid_increment}
            />
          ) : (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-600 font-medium">Diese Versteigerung ist bereits beendet.</p>
            </div>
          )}

          {bids && bids.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Letzte Gebote</h2>
              <div className="space-y-2">
                {bids.map((bid) => (
                  <div key={bid.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>
                      {bid.users?.first_name} {bid.users?.last_name?.charAt(0)}.
                    </span>
                    <span className="font-medium">{formatCurrency(bid.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
