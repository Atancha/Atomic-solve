import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { QuestionsSession } from "./components/questions-session"

export default async function QuestionsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Questions</h1>
        <p className="text-muted-foreground text-sm">Answer all 5 questions to complete your daily goal.</p>
      </div>
      <QuestionsSession />
    </div>
  )
}
