import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardContent } from "./components/dashboard-content"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (!user || !user.onboarded) redirect("/onboarding")
    return <DashboardContent userName={user.name ?? "Student"} />
  } catch {
    redirect("/onboarding")
  }
}
