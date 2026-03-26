import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ImportForm } from "./components/import-form"

export default async function ImportPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Import Questions</h1>
        <p className="text-muted-foreground text-sm">
          Paste a JSON array or upload a <code>.json</code> file to bulk-add questions.
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
