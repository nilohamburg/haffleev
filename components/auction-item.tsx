"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"
import { useState, useEffect } from "react"

interface AuctionItemProps {
  item: any
  status: "active" | "upcoming" | "ended"
}

export function AuctionItem({ item, status }: AuctionItemProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    if (status === "active") {
      const calculateTimeLeft = () => {
        const difference = new Date(item.endsAt).getTime() - Date.now()

        if (difference <= 0) {
          setTimeLeft("Ended")
          return
        }

        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      }

      calculateTimeLeft()
      const timer = setInterval(calculateTimeLeft, 1000)

      return () => clearInterval(timer)
    } else if (status === "upcoming") {
      const calculateTimeToStart = () => {
        const difference = new Date(item.startsAt).getTime() - Date.now()

        if (difference <= 0) {
          setTimeLeft("Starting soon")
          return
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        setTimeLeft(`Starts in ${days}d ${hours}h`)
      }

      calculateTimeToStart()
      const timer = setInterval(calculateTimeToStart, 60000) // Update every minute

      return () => clearInterval(timer)
    }
  }, [item, status])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-40 w-full">
          <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
          {status === "active" && (
            <div className="absolute top-2 right-2 bg-festival-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeLeft}</span>
            </div>
          )}
          {status === "upcoming" && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {timeLeft}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-festival-800 text-lg mb-2">{item.title}</h3>

          {status === "active" && (
            <>
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Current Bid</div>
                  <div className="font-bold text-festival-900">${item.currentBid}</div>
                </div>
                <div className="flex items-center gap-1 text-festival-600">
                  <Users className="h-4 w-4" />
                  <span>{item.bidsCount} bids</span>
                </div>
              </div>

              <Link href={`/auctions/${item.id}`}>
                <Button className="w-full bg-festival-600 hover:bg-festival-700">Place Bid</Button>
              </Link>
            </>
          )}

          {status === "upcoming" && (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-500">Starting Bid</div>
                <div className="font-bold text-festival-900">${item.startingBid}</div>
              </div>

              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </>
          )}

          {status === "ended" && (
            <>
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Final Bid</div>
                  <div className="font-bold text-festival-900">${item.finalBid}</div>
                </div>
                <div className="flex items-center gap-1 text-festival-600">
                  <Users className="h-4 w-4" />
                  <span>{item.bidsCount} bids</span>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Won by <span className="font-medium text-festival-700">{item.winner}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
