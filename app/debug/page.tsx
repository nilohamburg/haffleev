"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SetAdminRole } from "./set-admin"
import { Toaster } from "@/components/ui/toaster"

export default function DebugPage() {
  const { user, isAdmin, debugAdminRole, refreshUserData } = useAuth()

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug-Informationen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Benutzer:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Admin-Status:</h2>
              <p className="text-xl font-bold">{isAdmin ? "JA" : "NEIN"}</p>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => debugAdminRole()}>Admin-Rolle überprüfen</Button>

              <Button onClick={() => refreshUserData()}>Benutzerdaten neu laden</Button>
            </div>

            <hr />

            <SetAdminRole />
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
