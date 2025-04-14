"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { updateUserProfile, updateUserPassword } from "@/app/actions/profile"
import { AuthGuard } from "@/components/auth-guard"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function ProfileEditPage() {
  const { user, refreshUserData } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [profileStatus, setProfileStatus] = useState<{ success: boolean; error?: string } | null>(null)
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; error?: string } | null>(null)

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  // Lade die Benutzerdaten, wenn die Komponente geladen wird
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
      setPhone(user.phone || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingProfile(true)
    setProfileStatus(null)

    if (!user) return

    const formData = new FormData()
    formData.append("userId", user.id)
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("phone", phone)

    const result = await updateUserProfile(formData)

    if (result.success) {
      setProfileStatus({ success: true })
      // Aktualisiere die Benutzerdaten im Kontext
      await refreshUserData()
    } else {
      setProfileStatus({ success: false, error: result.error })
    }

    setIsSubmittingProfile(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPassword(true)
    setPasswordStatus(null)

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, error: "Die neuen Passwörter stimmen nicht überein" })
      setIsSubmittingPassword(false)
      return
    }

    const formData = new FormData()
    formData.append("currentPassword", currentPassword)
    formData.append("newPassword", newPassword)
    formData.append("confirmPassword", confirmPassword)

    const result = await updateUserPassword(formData)

    if (result.success) {
      setPasswordStatus({ success: true })
      // Setze die Passwortfelder zurück
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordStatus({ success: false, error: result.error })
    }

    setIsSubmittingPassword(false)
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-festival-50 to-festival-100 pb-20">
        <FestivalHeader />

        <main className="flex-1 container px-4 py-6 max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold text-festival-900">Profil bearbeiten</h1>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                Persönliche Daten
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
              >
                Passwort ändern
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Persönliche Daten</CardTitle>
                  <CardDescription>Aktualisiere deine persönlichen Informationen</CardDescription>
                </CardHeader>
                <CardContent>
                  {profileStatus && (
                    <Alert
                      className={`mb-4 ${profileStatus.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
                    >
                      <AlertDescription>
                        {profileStatus.success
                          ? "Deine Daten wurden erfolgreich aktualisiert."
                          : profileStatus.error || "Ein Fehler ist aufgetreten."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
                      <p className="text-xs text-gray-500">Die E-Mail-Adresse kann nicht geändert werden.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefonnummer (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+49 123 4567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-festival-600 hover:bg-festival-700"
                      disabled={isSubmittingProfile}
                    >
                      {isSubmittingProfile ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                          Speichern...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          Änderungen speichern
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Passwort ändern</CardTitle>
                  <CardDescription>Aktualisiere dein Passwort, um dein Konto zu schützen</CardDescription>
                </CardHeader>
                <CardContent>
                  {passwordStatus && (
                    <Alert
                      className={`mb-4 ${passwordStatus.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
                    >
                      <AlertDescription>
                        {passwordStatus.success
                          ? "Dein Passwort wurde erfolgreich aktualisiert."
                          : passwordStatus.error || "Ein Fehler ist aufgetreten."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Neues Passwort</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-festival-600 hover:bg-festival-700"
                      disabled={isSubmittingPassword}
                    >
                      {isSubmittingPassword ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                          Passwort ändern...
                        </span>
                      ) : (
                        "Passwort ändern"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
