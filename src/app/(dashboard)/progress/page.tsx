import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ProgressContent } from "./components/progress-content"

export default async function ProgressPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground text-sm">Track your accuracy and completion across all units.</p>
      </div>
      <ProgressContent />
    </div>
  )
}
