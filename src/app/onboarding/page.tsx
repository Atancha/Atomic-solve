import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { OnboardingForm } from "./components/onboarding-form"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (user?.onboarded) redirect("/dashboard")
  } catch {
    // DB unavailable — let the onboarding form handle sync
  }

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome! Let&apos;s set up your profile</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Tell us about yourself so we can personalise your daily questions.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
