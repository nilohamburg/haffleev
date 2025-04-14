import { Progress } from "@/components/ui/progress"
import { Users, Target } from "lucide-react"

interface DonationProgressProps {
  raised: number
  goal: number
  donorsCount: number
  projectsCount: number
}

export function DonationProgress({ raised, goal, donorsCount, projectsCount }: DonationProgressProps) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100)

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between mb-2">
        <span className="font-bold text-festival-900">${raised.toLocaleString()}</span>
        <span className="text-festival-600">Ziel: ${goal.toLocaleString()}</span>
      </div>

      <Progress value={percentage} className="h-2 bg-festival-100" indicatorClassName="bg-festival-500" />

      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center gap-1 text-festival-700">
          <Users className="h-4 w-4" />
          <span>{donorsCount} Spender</span>
        </div>
        <div className="flex items-center gap-1 text-festival-700">
          <Target className="h-4 w-4" />
          <span>{projectsCount} Projekte</span>
        </div>
      </div>
    </div>
  )
}
