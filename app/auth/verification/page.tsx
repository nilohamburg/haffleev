"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function VerificationPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-festival-50 to-festival-100">
      <div className="m-auto w-full max-w-md p-4">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="https://feel-your-soul.de/wp-content/uploads/2023/01/HAFFleev_LogoV6-e1675086765977.png"
              alt="HAFFleev Charity Festival"
              width={200}
              height={70}
              priority
            />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">E-Mail bestätigen</CardTitle>
            <CardDescription className="text-center">
              Wir haben dir eine Bestätigungs-E-Mail gesendet. Bitte klicke auf den Link in der E-Mail, um deine
              Registrierung abzuschließen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Überprüfe deinen Posteingang und auch den Spam-Ordner, falls du die E-Mail nicht findest.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/login">
              <Button className="bg-festival-600 hover:bg-festival-700">Zurück zur Anmeldung</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
