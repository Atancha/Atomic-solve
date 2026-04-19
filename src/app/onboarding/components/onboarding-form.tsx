"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LEVELS = [
  { value: "PRIMARY", label: "Primary" },
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "INTERNATIONAL", label: "International" },
] as const

const schema = z.object({
  level: z.enum(["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"]),
  grade: z.string().min(1, "Select a grade"),
})

type FormValues = z.infer<typeof schema>

export function OnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [synced, setSynced] = useState(false)
  const [gradesByLevel, setGradesByLevel] = useState<Record<string, string[]>>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { level: undefined, grade: "" },
  })

  const level = form.watch("level")

  // Sync user to DB and load grades on mount
  useEffect(() => {
    fetch("/api/user/sync", { method: "POST" }).then(() => setSynced(true))
    fetch("/api/grades").then((r) => r.json()).then(setGradesByLevel)
  }, [])

  // Reset grade when level changes
  useEffect(() => {
    form.setValue("grade", "")
  }, [level, form])

  async function onSubmit(data: FormValues) {
    if (!synced) return
    setLoading(true)
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (res.ok) router.push("/dashboard")
  }

  const grades = level ? gradesByLevel[level] ?? [] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Profile</CardTitle>
        <CardDescription>Choose your level and grade — we&apos;ll handle the rest.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade */}
            {level && (
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade / Form</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading || !synced}>
              {loading ? "Saving…" : "Start Revising →"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
