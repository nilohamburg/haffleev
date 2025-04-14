import { Skeleton } from "@/components/ui/skeleton"
import { FestivalHeader } from "@/components/festival-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminNotificationsLoading() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <FestivalHeader />

        <main className="container px-4 py-6 mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />

          <Skeleton className="h-10 w-full mb-6" />

          <Skeleton className="h-[400px] w-full mb-6" />
        </main>
      </div>
    </div>
  )
}
