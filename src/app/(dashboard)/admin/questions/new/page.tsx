import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { QuestionForm } from "../components/question-form"

export default async function NewQuestionPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Question</h1>
        <p className="text-muted-foreground text-sm">Create a new question for a unit.</p>
      </div>
      <QuestionForm mode="new" />
    </div>
  )
}
