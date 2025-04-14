import Link from "next/link"
import { FestivalHeader } from "@/components/festival-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function DonateSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-center text-festival-900 mb-2">Vielen Dank für deine Spende!</h1>
            <p className="text-center text-gray-700 mb-6">
              Deine Unterstützung hilft uns, das HAFFleev Festival noch besser zu machen und wichtige Charity-Projekte
              zu fördern.
            </p>

            <div className="w-full bg-festival-50 p-4 rounded-lg mb-6">
              <h2 className="font-bold text-festival-800 mb-2">Spendenübersicht</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-medium">{new Date().toLocaleDateString("de-DE")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zahlungsmethode:</span>
                  <span className="font-medium">Kreditkarte</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-3">
              <Link href="/donate">
                <Button className="w-full bg-festival-600 hover:bg-festival-700">Weitere Spende tätigen</Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                >
                  Zurück zur Startseite
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  )
}
