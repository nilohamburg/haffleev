"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export function SetAdminRole() {
  const { user, refreshUserData } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSetAdmin = async () => {
    try {
      setLoading(true)

      const targetEmail = email || user?.email || ""

      const response = await fetch("/api/set-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: targetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Setzen der Admin-Rolle")
      }

      toast({
        title: "Erfolg",
        description: data.message,
      })

      // Benutzerdaten neu laden
      await refreshUserData()
    } catch (error) {
      console.error("Fehler:", error)
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Admin-Rolle setzen</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="E-Mail (leer für aktuellen Benutzer)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSetAdmin} disabled={loading}>
          {loading ? "Wird gesetzt..." : "Admin-Rolle setzen"}
        </Button>
      </div>
    </div>
  )
}
