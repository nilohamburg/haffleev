import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId && !email) {
      return NextResponse.json({ error: "Benutzer-ID oder E-Mail ist erforderlich" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Benutzer-ID finden, wenn nur E-Mail angegeben wurde
    let targetUserId = userId
    if (!targetUserId && email) {
      const { data: userData, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

      if (userError) {
        return NextResponse.json({ error: `Benutzer mit E-Mail ${email} nicht gefunden` }, { status: 404 })
      }

      targetUserId = userData.id
    }

    // Überprüfen, ob bereits eine Admin-Rolle existiert
    const { data: existingRole, error: checkError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("role", "admin")

    if (checkError) {
      return NextResponse.json({ error: "Fehler beim Überprüfen der Admin-Rolle" }, { status: 500 })
    }

    // Wenn keine Admin-Rolle existiert, erstelle eine
    if (!existingRole || existingRole.length === 0) {
      const { error: insertError } = await supabase.from("user_roles").insert([
        {
          user_id: targetUserId,
          role: "admin",
          created_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        return NextResponse.json({ error: "Fehler beim Hinzufügen der Admin-Rolle" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Admin-Rolle hinzugefügt" })
    }

    return NextResponse.json({ success: true, message: "Benutzer ist bereits Admin" })
  } catch (error) {
    console.error("Fehler beim Setzen der Admin-Rolle:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
