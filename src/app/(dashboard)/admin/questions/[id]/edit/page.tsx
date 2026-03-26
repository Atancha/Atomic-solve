import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { QuestionForm } from "../../components/question-form"

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  const { id } = await params
  const question = await db.question.findUnique({ where: { id } })
  if (!question) notFound()

  const options = question.options as string[]

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Question</h1>
        <p className="text-muted-foreground text-sm">Update the question details below.</p>
      </div>
      <QuestionForm
        mode="edit"
        initial={{
          id: question.id,
          unitId: question.unitId,
          text: question.text,
          options: [options[0], options[1], options[2], options[3]],
          correctAnswer: question.correctAnswer as "A" | "B" | "C" | "D",
          explanation: question.explanation,
        }}
      />
    </div>
  )
}
