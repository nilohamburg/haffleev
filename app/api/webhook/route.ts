import { type NextRequest, NextResponse } from "next/server"
import { handleStripeWebhook } from "@/app/actions/payment"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    const result = await handleStripeWebhook(payload, signature)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Webhook-Events:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
