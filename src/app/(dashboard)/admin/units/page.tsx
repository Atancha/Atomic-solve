import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UnitsManager } from "./components/units-manager"

export default async function AdminUnitsPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Classes &amp; Units</h1>
        <p className="text-muted-foreground text-sm">Add, edit, or remove units across all class levels.</p>
      </div>
      <UnitsManager />
    </div>
  )
}
