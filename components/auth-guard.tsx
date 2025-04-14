"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Warte, bis der Authentifizierungsstatus geladen ist
    if (!loading) {
      setIsChecking(false)

      // Wenn kein Benutzer vorhanden ist und wir nicht auf einer Auth-Seite sind
      if (!user && !pathname.includes("/auth/")) {
        // Leite zur Anmeldeseite weiter und gib den aktuellen Pfad als Redirect-Parameter mit
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else {
        // Benutzer ist angemeldet oder wir sind auf einer Auth-Seite
        setIsAuthorized(true)
      }
    }
  }, [user, loading, router, pathname])

  // Wenn noch geprüft wird oder nicht autorisiert ist, zeige Ladeanimation
  if (loading || isChecking || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-festival-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, debugAdminRole } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Warte, bis der Authentifizierungsstatus geladen ist
      if (!loading) {
        console.log("[AdminGuard] Authentifizierungsstatus geladen")
        console.log("[AdminGuard] Benutzer:", user?.email)
        console.log("[AdminGuard] isAdmin:", isAdmin)

        // Debug-Funktion aufrufen
        await debugAdminRole()

        setIsChecking(false)

        // Wenn kein Benutzer vorhanden ist
        if (!user) {
          console.log("[AdminGuard] Kein Benutzer, Weiterleitung zur Anmeldeseite")
          router.push("/auth/login?redirect=/admin")
          return
        }

        // Wenn der Benutzer kein Admin ist
        if (!isAdmin) {
          console.log("[AdminGuard] Benutzer ist kein Admin, Zugriff verweigert")
          toast({
            title: "Zugriff verweigert",
            description: "Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Benutzer ist ein Admin
        console.log("[AdminGuard] Benutzer ist Admin, Zugriff gewährt")
        setIsAuthorized(true)
      }
    }

    checkAdminStatus()
  }, [user, loading, isAdmin, router, debugAdminRole])

  // Wenn noch geprüft wird oder nicht autorisiert ist, zeige Ladeanimation
  if (loading || isChecking || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-festival-600"></div>
        <Toaster />
      </div>
    )
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
