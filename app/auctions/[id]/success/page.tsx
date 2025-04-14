import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default async function AuctionBidSuccessPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { session_id?: string }
}) {
  const auctionId = Number.parseInt(params.id)
  const sessionId = searchParams.session_id

  if (!sessionId || isNaN(auctionId)) {
    redirect("/auctions")
  }

  // Aktualisiere den Status des Gebots
  const { data: bid, error: bidError } = await supabase
    .from("auction_bids")
    .update({ status: "completed" })
    .eq("stripe_session_id", sessionId)
    .select("amount")
    .single()

  if (bidError) {
    console.error("Fehler beim Aktualisieren des Gebots:", bidError)
  } else if (bid) {
    // Aktualisiere das aktuelle Gebot der Auktion
    const { error: auctionError } = await supabase
      .from("auctions")
      .update({ current_bid: bid.amount })
      .eq("id", auctionId)

    if (auctionError) {
      console.error("Fehler beim Aktualisieren der Auktion:", auctionError)
    }
  }

  return (
    <div className="container py-12 flex flex-col items-center">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ihr Gebot wurde erfolgreich platziert!</h1>
        <p className="text-gray-600 mb-6">
          Vielen Dank für Ihre Teilnahme an der Versteigerung. Sie werden benachrichtigt, wenn Sie der Höchstbietende
          sind.
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href={`/auctions/${auctionId}`}>Zurück zur Auktion</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auctions">Alle Versteigerungen</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
