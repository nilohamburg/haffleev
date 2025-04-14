import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CharityProjectProps {
  project: {
    id: number
    name: string
    image?: string
    description: string
    raised: number
    goal: number
  }
}

export function CharityProject({ project }: CharityProjectProps) {
  const percentage = Math.min(Math.round((project.raised / project.goal) * 100), 100)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={project.image || "/placeholder.svg?height=200&width=300"}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-festival-800 text-lg mb-2">{project.name}</h3>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{project.description}</p>

          <div className="flex justify-between mb-2">
            <span className="font-bold text-festival-900">{project.raised.toLocaleString()} €</span>
            <span className="text-festival-600">Ziel: {project.goal.toLocaleString()} €</span>
          </div>

          <Progress value={percentage} className="h-2 mb-3 bg-festival-100" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-festival-700">{percentage}% finanziert</span>
          </div>

          <div className="flex gap-2">
            <Link href={`/donate?project=${project.id}`} className="flex-1">
              <Button className="w-full bg-festival-600 hover:bg-festival-700">Spenden</Button>
            </Link>
            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" className="border-festival-200 hover:bg-festival-100 hover:text-festival-900">
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
