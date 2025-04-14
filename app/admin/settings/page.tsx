"use client"

import { useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminGuard } from "@/components/auth-guard"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Save, Globe, Calendar, DollarSign, Bell, Shield } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsPage() {
  // Allgemeine Einstellungen
  const [festivalName, setFestivalName] = useState("HAFFleev Charity Festival")
  const [festivalDescription, setFestivalDescription] = useState("Drei Tage voller Musik, Kunst und Wohltätigkeit")
  const [contactEmail, setContactEmail] = useState("info@haffleev-festival.de")
  const [websiteUrl, setWebsiteUrl] = useState("https://haffleev-festival.de")

  // Veranstaltungseinstellungen
  const [startDate, setStartDate] = useState("2024-09-05")
  const [endDate, setEndDate] = useState("2024-09-07")
  const [location, setLocation] = useState("Seestraße 123, 17429 Seebad Bansin")
  const [maxAttendees, setMaxAttendees] = useState("5000")

  // Zahlungseinstellungen
  const [currency, setCurrency] = useState("EUR")
  const [taxRate, setTaxRate] = useState("19")
  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [paypalEnabled, setPaypalEnabled] = useState(false)

  // Benachrichtigungseinstellungen
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [adminEmailNotifications, setAdminEmailNotifications] = useState(true)
  const [notificationEmail, setNotificationEmail] = useState("admin@haffleev-festival.de")

  // Sicherheitseinstellungen
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [passwordMinLength, setPasswordMinLength] = useState("8")
  const [sessionTimeout, setSessionTimeout] = useState("60")

  const handleSaveSettings = async (section: string) => {
    try {
      // In einer echten Anwendung würden hier die Einstellungen in der Datenbank gespeichert werden
      // Für dieses Beispiel zeigen wir nur eine Erfolgsmeldung an

      toast({
        title: "Einstellungen gespeichert",
        description: `Die ${section}-Einstellungen wurden erfolgreich gespeichert.`,
      })
    } catch (error) {
      console.error(`Fehler beim Speichern der ${section}-Einstellungen:`, error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <h1 className="text-2xl font-bold text-festival-900 mb-6">Einstellungen</h1>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Allgemein
                </TabsTrigger>
                <TabsTrigger
                  value="event"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Veranstaltung
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Zahlung
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Benachrichtigungen
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-festival-100 data-[state=active]:text-festival-900"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sicherheit
                </TabsTrigger>
              </TabsList>

              {/* Allgemeine Einstellungen */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Allgemeine Einstellungen</CardTitle>
                    <CardDescription>Grundlegende Informationen über das Festival und die Website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="festivalName">Festival-Name</Label>
                      <Input id="festivalName" value={festivalName} onChange={(e) => setFestivalName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="festivalDescription">Beschreibung</Label>
                      <Textarea
                        id="festivalDescription"
                        value={festivalDescription}
                        onChange={(e) => setFestivalDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Kontakt-E-Mail</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website-URL</Label>
                      <Input id="websiteUrl" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
                    </div>
                    <Button onClick={() => handleSaveSettings("allgemeinen")}>
                      <Save className="h-4 w-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Veranstaltungseinstellungen */}
              <TabsContent value="event">
                <Card>
                  <CardHeader>
                    <CardTitle>Veranstaltungseinstellungen</CardTitle>
                    <CardDescription>Informationen über den Zeitraum und Ort des Festivals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Startdatum</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Enddatum</Label>
                        <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Veranstaltungsort</Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Maximale Teilnehmerzahl</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={maxAttendees}
                        onChange={(e) => setMaxAttendees(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => handleSaveSettings("Veranstaltungs")}>
                      <Save className="h-4 w-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Zahlungseinstellungen */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Zahlungseinstellungen</CardTitle>
                    <CardDescription>Einstellungen für Zahlungen und Zahlungsanbieter</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Währung</Label>
                      <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Steuersatz (%)</Label>
                      <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="stripeEnabled">Stripe aktivieren</Label>
                        <p className="text-sm text-gray-500">Aktivieren Sie Stripe als Zahlungsanbieter</p>
                      </div>
                      <Switch id="stripeEnabled" checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="paypalEnabled">PayPal aktivieren</Label>
                        <p className="text-sm text-gray-500">Aktivieren Sie PayPal als Zahlungsanbieter</p>
                      </div>
                      <Switch id="paypalEnabled" checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
                    </div>
                    <Button onClick={() => handleSaveSettings("Zahlungs")}>
                      <Save className="h-4 w-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benachrichtigungseinstellungen */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Benachrichtigungseinstellungen</CardTitle>
                    <CardDescription>Einstellungen für E-Mail- und Push-Benachrichtigungen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">E-Mail-Benachrichtigungen</Label>
                        <p className="text-sm text-gray-500">Senden Sie E-Mail-Benachrichtigungen an Benutzer</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Push-Benachrichtigungen</Label>
                        <p className="text-sm text-gray-500">Senden Sie Push-Benachrichtigungen an mobile Geräte</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="adminEmailNotifications">Admin-Benachrichtigungen</Label>
                        <p className="text-sm text-gray-500">Senden Sie E-Mail-Benachrichtigungen an Administratoren</p>
                      </div>
                      <Switch
                        id="adminEmailNotifications"
                        checked={adminEmailNotifications}
                        onCheckedChange={setAdminEmailNotifications}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notificationEmail">Benachrichtigungs-E-Mail</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => handleSaveSettings("Benachrichtigungs")}>
                      <Save className="h-4 w-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sicherheitseinstellungen */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sicherheitseinstellungen</CardTitle>
                    <CardDescription>
                      Einstellungen für die Sicherheit und den Zugriff auf die Anwendung
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactorAuth">Zwei-Faktor-Authentifizierung</Label>
                        <p className="text-sm text-gray-500">
                          Aktivieren Sie die Zwei-Faktor-Authentifizierung für Administratoren
                        </p>
                      </div>
                      <Switch id="twoFactorAuth" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Mindestlänge für Passwörter</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Sitzungs-Timeout (Minuten)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => handleSaveSettings("Sicherheits")}>
                      <Save className="h-4 w-4 mr-2" />
                      Einstellungen speichern
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>

        <Toaster />
      </div>
    </AdminGuard>
  )
}
