import { supabase } from "@/lib/supabase"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DonationCard } from "@/components/donation-card"
import { DonationForm } from "@/components/donation-form"

export const revalidate = 0 // Keine Caching, immer aktuelle Daten

export default async function DonationsPage() {
  // Spendenoptionen abrufen
  const { data: donations, error } = await supabase.from("donations").select("*").order("amount")

  if (error) {
    console.error("Fehler beim Laden der Spendenoptionen:", error)
  }

  // Gesamtspendenbetrag abrufen
  const { data: totalData, error: totalError } = await supabase.from("donation_transactions").select("amount")

  if (totalError) {
    console.error("Fehler beim Laden des Gesamtspendenbetrags:", totalError)
  }

  // Gesamtspendenbetrag berechnen
  const totalAmount = totalData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0

  return (
    <div className="container pb-20">
      <h1 className="text-2xl font-bold my-4">Spenden</h1>

      <div className="bg-festival-100 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Gesamtspendenbetrag</h2>
        <p className="text-3xl font-bold text-festival-600">{totalAmount.toFixed(2)} €</p>
        <p className="text-sm mt-2">
          Vielen Dank an alle Spender! Mit Ihrer Unterstützung können wir das Festival noch besser machen.
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-3">Spendenoptionen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donations && donations.length > 0 ? (
          donations.map((donation) => <DonationCard key={donation.id} donation={donation} />)
        ) : (
          <p className="col-span-full text-center py-8">Keine Spendenoptionen gefunden.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Individuelle Spende</h2>
        <DonationForm />
      </div>

      <BottomNavigation />
    </div>
  )
}
