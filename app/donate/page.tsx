"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CharityProject } from "@/components/charity-project"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { createDonationCheckoutSession } from "@/app/actions/payment"
import { supabase } from "@/lib/supabase"

export default function DonatePage() {
  const [amount, setAmount] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [totalDonated, setTotalDonated] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    // Lade Projekte aus der Datenbank
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("charity_projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Fehler beim Laden der Projekte:", error)
      } else if (data) {
        setProjects(data)
      }
    }

    // Lade Gesamtspendenbetrag
    const fetchTotalDonated = async () => {
      const { data, error } = await supabase.from("donations").select("amount")

      if (error) {
        console.error("Fehler beim Laden des Gesamtspendenbetrags:", error)
      } else if (data) {
        const total = data.reduce((sum, donation) => sum + donation.amount, 0)
        setTotalDonated(total)
      }
    }

    // Setze den Namen, wenn der Benutzer angemeldet ist
    if (user) {
      setName(`${user.first_name} ${user.last_name}`.trim())
    }

    fetchProjects()
    fetchTotalDonated()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Bitte geben Sie einen gültigen Spendenbetrag ein.")
      return
    }

    if (!name) {
      setError("Bitte geben Sie Ihren Namen ein.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("amount", amount)
    formData.append("name", name)
    formData.append("message", message)

    if (selectedProject) {
      formData.append("projectId", selectedProject)
    }

    if (user) {
      formData.append("userId", user.id)
    }

    try {
      await createDonationCheckoutSession(formData)
    } catch (error) {
      console.error("Fehler beim Erstellen der Checkout-Session:", error)
      setError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
      setLoading(false)
    }
  }

  const handleAmountClick = (value: string) => {
    setAmount(value)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
      <FestivalHeader />

      <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-festival-900 mb-6">Spenden</h1>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-festival-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-festival-600" />
              </div>
            </div>
            <CardTitle className="text-center">Mach einen Unterschied</CardTitle>
            <CardDescription className="text-center">
              Deine Spende unterstützt direkt unsere Charity-Projekte und hilft, positive Veränderungen zu bewirken.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-festival-100 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Gesamtspendenbetrag</h2>
              <p className="text-3xl font-bold text-festival-600">{totalDonated.toFixed(2)} €</p>
              <p className="text-sm mt-2">
                Vielen Dank an alle Spender! Mit Ihrer Unterstützung können wir das Festival noch besser machen.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="amount" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger
                    value="amount"
                    className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                  >
                    Betrag wählen
                  </TabsTrigger>
                  <TabsTrigger
                    value="project"
                    className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                  >
                    Projekt wählen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="amount">
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("10")}
                    >
                      10€
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("25")}
                    >
                      25€
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("50")}
                    >
                      50€
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("100")}
                    >
                      100€
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("250")}
                    >
                      250€
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-festival-200 hover:bg-festival-100 hover:text-festival-900"
                      onClick={() => handleAmountClick("500")}
                    >
                      500€
                    </Button>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="amount">Individueller Betrag (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="Betrag eingeben"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white border-festival-200 focus-visible:ring-festival-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Ihr Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Max Mustermann"
                        className="bg-white border-festival-200 focus-visible:ring-festival-400"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Nachricht (optional)</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ihre Nachricht..."
                        className="bg-white border-festival-200 focus-visible:ring-festival-400"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="project">
                  <div className="space-y-4 mb-6">
                    <RadioGroup value={selectedProject} onValueChange={setSelectedProject}>
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center gap-3 p-3 border border-festival-200 rounded-lg"
                          >
                            <RadioGroupItem value={project.id.toString()} id={`project-${project.id}`} />
                            <Label htmlFor={`project-${project.id}`} className="flex-1">
                              <span className="font-medium text-festival-800">{project.name}</span>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500">Keine Projekte gefunden.</p>
                      )}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount-project">Spendenbetrag (€)</Label>
                      <Input
                        id="amount-project"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="Betrag eingeben"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-white border-festival-200 focus-visible:ring-festival-400"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="name-project">Ihr Name</Label>
                      <Input
                        id="name-project"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Max Mustermann"
                        className="bg-white border-festival-200 focus-visible:ring-festival-400"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message-project">Nachricht (optional)</Label>
                      <Textarea
                        id="message-project"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ihre Nachricht..."
                        className="bg-white border-festival-200 focus-visible:ring-festival-400"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                type="submit"
                className="w-full bg-festival-600 hover:bg-festival-700"
                disabled={loading || !amount || Number.parseFloat(amount) <= 0 || !name}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    Verarbeitung...
                  </span>
                ) : (
                  "Jetzt spenden"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-festival-900 mb-4">Unsere Charity-Projekte</h2>
        <div className="space-y-6">
          {projects.length > 0 ? (
            projects.map((project) => <CharityProject key={project.id} project={project} />)
          ) : (
            <p className="text-center py-8 text-gray-500">Keine Charity-Projekte gefunden.</p>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
