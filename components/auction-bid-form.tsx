"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createAuctionBidCheckoutSession } from "@/lib/actions"
import { useAuth } from "@/lib/auth"

interface AuctionBidFormProps {
  auctionId: number
  currentBid: number
  minIncrement: number
}

export function AuctionBidForm({ auctionId, currentBid, minIncrement }: AuctionBidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const minBid = currentBid + minIncrement

  const formSchema = z.object({
    bidAmount: z.string().refine(
      (val) => {
        const num = Number.parseFloat(val.replace(",", "."))
        return !isNaN(num) && num >= minBid
      },
      {
        message: `Das Gebot muss mindestens ${minBid.toFixed(2)} € betragen`,
      },
    ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bidAmount: minBid.toFixed(2),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Nicht angemeldet",
        description: "Bitte melden Sie sich an, um ein Gebot abzugeben.",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/auctions/${auctionId}`)
      return
    }

    try {
      setIsSubmitting(true)

      // Konvertiere den Betrag
      const bidAmount = Number.parseFloat(values.bidAmount.replace(",", "."))

      const result = await createAuctionBidCheckoutSession({
        auctionId,
        bidAmount,
        userId: user.id,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Fehler beim Gebot:", error)
      toast({
        title: "Fehler",
        description:
          "Bei der Verarbeitung Ihres Gebots ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bidAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ihr Gebot (€)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Ihr Gebot muss mindestens {minBid.toFixed(2)} € betragen.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wird verarbeitet..." : "Gebot abgeben"}
        </Button>
      </form>
    </Form>
  )
}
