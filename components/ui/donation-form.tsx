"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createDonationCheckoutSession } from "@/lib/actions"

const formSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = Number.parseFloat(val.replace(",", "."))
      return !isNaN(num) && num > 0
    },
    {
      message: "Bitte geben Sie einen gültigen Betrag ein",
    },
  ),
  name: z.string().min(2, {
    message: "Der Name muss mindestens 2 Zeichen lang sein",
  }),
  message: z.string().optional(),
})

export function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      name: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Konvertiere den Betrag in Cent
      const amountInCents = Math.round(Number.parseFloat(values.amount.replace(",", ".")) * 100)

      const result = await createDonationCheckoutSession({
        amount: amountInCents,
        name: values.name,
        message: values.message || "",
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Fehler bei der Spende:", error)
      toast({
        title: "Fehler",
        description:
          "Bei der Verarbeitung Ihrer Spende ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spendenbetrag (€)</FormLabel>
              <FormControl>
                <Input placeholder="10,00" {...field} />
              </FormControl>
              <FormDescription>Geben Sie den Betrag ein, den Sie spenden möchten.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ihr Name</FormLabel>
              <FormControl>
                <Input placeholder="Max Mustermann" {...field} />
              </FormControl>
              <FormDescription>Ihr Name wird in der Spendenliste angezeigt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nachricht (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ihre Nachricht..." {...field} />
              </FormControl>
              <FormDescription>Eine persönliche Nachricht, die mit Ihrer Spende angezeigt wird.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird verarbeitet..." : "Jetzt spenden"}
        </Button>
      </form>
    </Form>
  )
}
