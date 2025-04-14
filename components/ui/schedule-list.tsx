import type { Schedule } from "@/lib/types"
import { formatDate, formatTime } from "@/lib/utils"

interface ScheduleListProps {
  schedules: Schedule[]
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  // Gruppiere Zeitplan nach Datum
  const schedulesByDate = schedules.reduce(
    (acc, schedule) => {
      const date = formatDate(schedule.start_time)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(schedule)
      return acc
    },
    {} as Record<string, Schedule[]>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(schedulesByDate).map(([date, dateSchedules]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold mb-3">{date}</h3>
          <div className="space-y-3">
            {dateSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col sm:flex-row border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="sm:w-1/4 font-medium">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </div>
                <div className="sm:w-3/4">
                  <div className="font-semibold">{schedule.artists?.name || "Unbekannter Künstler"}</div>
                  <div className="text-sm text-gray-600">{schedule.location}</div>
                  {schedule.description && <div className="mt-1 text-sm">{schedule.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
