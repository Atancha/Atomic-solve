import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, PlusCircle, FileJson, GraduationCap } from "lucide-react"

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_ID) redirect("/dashboard")

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">Manage questions and content for Atomic Solve.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">View, edit, or delete existing questions.</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/questions">Browse Questions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="h-5 w-5" />
              Add Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Create a new question for any unit.</p>
            <Button asChild size="sm" className="w-full">
              <Link href="/admin/questions/new">Add Question</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="h-5 w-5" />
              Import JSON
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Bulk-import questions from a JSON file.</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/import">Import Questions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5" />
              Classes &amp; Units
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Add, edit, or remove units by class level.</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/units">Manage Units</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
