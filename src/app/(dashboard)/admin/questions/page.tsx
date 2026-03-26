import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { QuestionsList } from "./components/questions-list"

export default async function AdminQuestionsPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground text-sm">All questions in the database.</p>
        </div>
      </div>
      <QuestionsList />
    </div>
  )
}
