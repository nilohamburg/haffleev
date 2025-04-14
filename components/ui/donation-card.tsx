import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Donation } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface DonationCardProps {
  donation: Donation
}

export function DonationCard({ donation }: DonationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{donation.title}</CardTitle>
        <CardDescription>{formatCurrency(donation.amount)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{donation.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/donations/${donation.id}`}>Jetzt spenden</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
