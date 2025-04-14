"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string

    if (!userId) {
      return { success: false, error: "Benutzer-ID fehlt" }
    }

    // Aktualisiere die Benutzerinformationen in der Datenbank
    const { error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Fehler beim Aktualisieren des Profils:", error)
      return { success: false, error: "Fehler beim Aktualisieren des Profils" }
    }

    // Revalidiere den Pfad, um die Änderungen sofort anzuzeigen
    revalidatePath("/profile/edit")
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Unerwarteter Fehler beim Aktualisieren des Profils:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten" }
  }
}

export async function updateUserPassword(formData: FormData) {
  try {
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Die neuen Passwörter stimmen nicht überein" }
    }

    // Aktualisiere das Passwort über die Supabase Auth API
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Fehler beim Aktualisieren des Passworts:", error)
      return { success: false, error: "Fehler beim Aktualisieren des Passworts" }
    }

    return { success: true }
  } catch (error) {
    console.error("Unerwarteter Fehler beim Aktualisieren des Passworts:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten" }
  }
}
