import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default async function DonationSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect("/donations")
  }

  // Aktualisiere den Status der Transaktion
  const { error } = await supabase
    .from("donation_transactions")
    .update({ status: "completed" })
    .eq("stripe_session_id", sessionId)

  if (error) {
    console.error("Fehler beim Aktualisieren der Transaktion:", error)
  }

  return (
    <div className="container py-12 flex flex-col items-center">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Vielen Dank für Ihre Spende!</h1>
        <p className="text-gray-600 mb-6">Ihre Unterstützung hilft uns, das HAFFleev Festival noch besser zu machen.</p>
        <Button asChild>
          <Link href="/donations">Zurück zur Spendenübersicht</Link>
        </Button>
      </div>
    </div>
  )
}
