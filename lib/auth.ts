"use client"

import type React from "react"

import { supabase } from "./supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState, createContext, useContext } from "react"
import type { User } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any; user: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  refreshUserData: () => Promise<void>
  debugAdminRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Funktion zum Überprüfen der Admin-Rolle
  const checkAdminRole = async (userId: string) => {
    try {
      console.log(`[checkAdminRole] Überprüfe Admin-Rolle für Benutzer: ${userId}`)

      // Direkte Abfrage ohne .single(), um alle Ergebnisse zu sehen
      const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).eq("role", "admin")

      if (error) {
        console.error("[checkAdminRole] Fehler bei der Abfrage:", error)
        return false
      }

      console.log("[checkAdminRole] Abfrageergebnis:", data)

      const hasAdminRole = data && data.length > 0
      console.log(`[checkAdminRole] Admin-Rolle für Benutzer ${userId}: ${hasAdminRole ? "JA" : "NEIN"}`)

      // Wenn Admin-Rolle gefunden wurde, setze den State
      if (hasAdminRole) {
        setIsAdmin(true)
      }

      return hasAdminRole
    } catch (error) {
      console.error("[checkAdminRole] Unerwarteter Fehler:", error)
      return false
    }
  }

  // Debug-Funktion, um die Admin-Rolle zu überprüfen
  const debugAdminRole = async () => {
    if (!user) {
      console.log("[debugAdminRole] Kein Benutzer angemeldet")
      return
    }

    console.log("[debugAdminRole] Aktueller Benutzer:", user)
    console.log("[debugAdminRole] isAdmin State:", isAdmin)

    // Hole die aktuelle Sitzung
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error("[debugAdminRole] Fehler beim Abrufen der Sitzung:", sessionError)
      return
    }

    console.log("[debugAdminRole] Aktuelle Sitzung:", sessionData)

    // Überprüfe die Admin-Rolle direkt
    const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", user.id)

    if (error) {
      console.error("[debugAdminRole] Fehler bei der Abfrage aller Rollen:", error)
      return
    }

    console.log("[debugAdminRole] Alle Rollen des Benutzers:", data)

    // Überprüfe speziell die Admin-Rolle
    const { data: adminData, error: adminError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")

    if (adminError) {
      console.error("[debugAdminRole] Fehler bei der Abfrage der Admin-Rolle:", adminError)
      return
    }

    console.log("[debugAdminRole] Admin-Rolle des Benutzers:", adminData)
  }

  // Funktion zum Laden der Benutzerinformationen
  const loadUserInfo = async (userId: string) => {
    try {
      console.log(`[loadUserInfo] Lade Benutzerinformationen für: ${userId}`)

      // Überprüfe zuerst, ob der Benutzer existiert
      const { data: userExists, error: checkError } = await supabase.from("users").select("*").eq("id", userId)

      if (checkError) {
        console.error("[loadUserInfo] Fehler beim Überprüfen des Benutzers:", checkError)
        return null
      }

      // Wenn der Benutzer bereits existiert, geben wir ihn zurück
      if (userExists && userExists.length > 0) {
        console.log("[loadUserInfo] Benutzer gefunden:", userExists[0])

        // Überprüfe, ob der Benutzer ein Admin ist
        const isAdminUser = await checkAdminRole(userId)
        setIsAdmin(isAdminUser)
        console.log(`[loadUserInfo] isAdmin nach checkAdminRole: ${isAdminUser}`)

        return userExists[0] as User
      }

      // Wenn kein Benutzer gefunden wurde, holen wir die Sitzungsdaten
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("[loadUserInfo] Fehler beim Abrufen der Sitzung:", sessionError)
        return null
      }

      if (!sessionData?.session?.user) {
        console.error("[loadUserInfo] Keine aktive Sitzung gefunden")
        return null
      }

      const authUser = sessionData.session.user

      if (authUser && authUser.id === userId) {
        // Erstelle einen neuen Benutzer in der users-Tabelle
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              id: userId,
              email: authUser.email,
              first_name: "",
              last_name: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()

        if (insertError) {
          // Wenn ein Fehler auftritt, prüfe, ob es sich um einen Unique-Constraint-Fehler handelt
          if (insertError.code === "23505") {
            // Unique violation
            console.log("[loadUserInfo] Benutzer mit dieser E-Mail existiert bereits, versuche ihn zu finden")

            // Versuche, den Benutzer mit dieser E-Mail zu finden
            const { data: existingUser, error: findError } = await supabase
              .from("users")
              .select("*")
              .eq("email", authUser.email)
              .single()

            if (findError) {
              console.error("[loadUserInfo] Fehler beim Suchen des Benutzers mit E-Mail:", findError)
              return null
            }

            // Wenn wir den Benutzer gefunden haben, verwenden wir ihn
            if (existingUser) {
              console.log("[loadUserInfo] Benutzer mit E-Mail gefunden:", existingUser)

              // Überprüfe, ob der Benutzer ein Admin ist
              const isAdminUser = await checkAdminRole(existingUser.id)
              setIsAdmin(isAdminUser)
              console.log(`[loadUserInfo] isAdmin nach checkAdminRole für existierenden Benutzer: ${isAdminUser}`)

              return existingUser as User
            }
          }

          console.error("[loadUserInfo] Fehler beim Erstellen des Benutzers:", insertError)
          return null
        }

        console.log("[loadUserInfo] Neuer Benutzer erstellt:", newUser?.[0])
        return newUser?.[0] as User
      } else {
        console.error("[loadUserInfo] Benutzer-ID stimmt nicht mit der aktuellen Sitzung überein")
        return null
      }
    } catch (error) {
      console.error("[loadUserInfo] Unerwarteter Fehler:", error)
      return null
    }
  }

  useEffect(() => {
    // Überprüfe den aktuellen Authentifizierungsstatus
    const checkUser = async () => {
      try {
        setLoading(true)
        console.log("[checkUser] Überprüfe Authentifizierungsstatus")

        // Hole die aktuelle Sitzung
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[checkUser] Fehler beim Abrufen der Sitzung:", sessionError)
          setLoading(false)
          return
        }

        console.log("[checkUser] Sitzungsdaten:", sessionData)

        if (sessionData?.session?.user) {
          console.log("[checkUser] Benutzer in Sitzung gefunden:", sessionData.session.user)

          const userData = await loadUserInfo(sessionData.session.user.id)
          setUser(userData)
          console.log("[checkUser] Benutzer geladen:", userData)

          // Überprüfe die Admin-Rolle explizit
          const isAdminUser = await checkAdminRole(sessionData.session.user.id)
          setIsAdmin(isAdminUser)
          console.log(`[checkUser] isAdmin nach checkAdminRole: ${isAdminUser}`)
        } else {
          console.log("[checkUser] Kein Benutzer in Sitzung gefunden")
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("[checkUser] Unerwarteter Fehler:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Abonniere Authentifizierungsänderungen
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[onAuthStateChange] Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session) {
        const userData = await loadUserInfo(session.user.id)
        setUser(userData)
        console.log("[onAuthStateChange] Benutzer nach Anmeldung:", userData)

        // Überprüfe die Admin-Rolle explizit
        const isAdminUser = await checkAdminRole(session.user.id)
        setIsAdmin(isAdminUser)
        console.log(`[onAuthStateChange] isAdmin nach checkAdminRole: ${isAdminUser}`)
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        console.log("[onAuthStateChange] Benutzer abgemeldet oder gelöscht")
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`[signIn] Anmeldung für: ${email}`)

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("[signIn] Anmeldefehler:", error)
        return { error }
      }

      console.log("[signIn] Anmeldung erfolgreich:", data)

      if (data.user) {
        const userData = await loadUserInfo(data.user.id)
        setUser(userData)
        console.log("[signIn] Benutzer geladen:", userData)

        // Überprüfe die Admin-Rolle explizit
        const isAdminUser = await checkAdminRole(data.user.id)
        setIsAdmin(isAdminUser)
        console.log(`[signIn] isAdmin nach checkAdminRole: ${isAdminUser}`)
      }

      return { error: null }
    } catch (error) {
      console.error("[signIn] Unerwarteter Fehler:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Prüfe zuerst, ob ein Benutzer mit dieser E-Mail bereits existiert
      const { data: existingUser, error: checkError } = await supabase.from("users").select("*").eq("email", email)

      if (checkError) {
        console.error("[signUp] Fehler beim Überprüfen der E-Mail:", checkError)
        return { error: checkError, user: null }
      }

      if (existingUser && existingUser.length > 0) {
        return { error: new Error("Ein Benutzer mit dieser E-Mail existiert bereits"), user: null }
      }

      // Registriere den Benutzer bei Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        console.error("[signUp] Registrierungsfehler:", error)
        return { error, user: null }
      }

      if (data.user) {
        // Erstelle einen Eintrag in der users-Tabelle
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error("[signUp] Fehler beim Erstellen des Benutzerprofils:", profileError)
          return { error: profileError, user: null }
        }

        // Lade die Benutzerinformationen
        const newUserData = await loadUserInfo(data.user.id)
        setUser(newUserData)

        return { error: null, user: data.user }
      }

      return { error: new Error("Benutzer konnte nicht erstellt werden"), user: null }
    } catch (error) {
      console.error("[signUp] Unerwarteter Fehler:", error)
      return { error, user: null }
    }
  }

  const signOut = async () => {
    console.log("[signOut] Benutzer wird abgemeldet")
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push("/")
  }

  // Füge eine Funktion zum Neuladen der Benutzerdaten hinzu
  const refreshUserData = async () => {
    if (user) {
      console.log(`[refreshUserData] Lade Benutzerdaten neu für: ${user.id}`)

      const userData = await loadUserInfo(user.id)
      setUser(userData)
      console.log("[refreshUserData] Benutzer neu geladen:", userData)

      // Überprüfe die Admin-Rolle explizit
      const isAdminUser = await checkAdminRole(user.id)
      setIsAdmin(isAdminUser)
      console.log(`[refreshUserData] isAdmin nach checkAdminRole: ${isAdminUser}`)
    }
  }

  // Füge die refreshUserData-Funktion zum Kontext hinzu
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    refreshUserData,
    debugAdminRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
