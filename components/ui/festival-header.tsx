import Link from "next/link"
import Image from "next/image"

export function FestivalHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-festival-100">
      <div className="container px-4 py-3 max-w-md mx-auto flex items-center justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src="https://feel-your-soul.de/wp-content/uploads/2023/01/HAFFleev_LogoV6-e1675086765977.png"
            alt="HAFFleev Charity Festival"
            width={150}
            height={50}
            priority
          />
        </Link>
      </div>
    </header>
  )
}
