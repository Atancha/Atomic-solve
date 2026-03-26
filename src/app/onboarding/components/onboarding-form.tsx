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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const LEVELS = [
  { value: "PRIMARY", label: "Primary" },
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "INTERNATIONAL", label: "International" },
] as const

const GRADES_BY_LEVEL: Record<string, string[]> = {
  PRIMARY: ["Grade 6", "Grade 7", "Grade 10"],
  HIGH_SCHOOL: ["Form 3", "Form 4"],
  INTERNATIONAL: ["Grade 5", "Grade 6", "Grade 8", "Grade 9"],
}

const schema = z.object({
  level: z.enum(["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"]),
  grade: z.string().min(1, "Select a grade"),
  unitIds: z.array(z.string()).min(1, "Select at least one unit"),
})

type FormValues = z.infer<typeof schema>

type Unit = { id: string; title: string; grade: string }

export function OnboardingForm() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [synced, setSynced] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { level: undefined, grade: "", unitIds: [] },
  })

  const level = form.watch("level")
  const grade = form.watch("grade")

  // Sync user to DB on mount
  useEffect(() => {
    fetch("/api/user/sync", { method: "POST" }).then(() => setSynced(true))
  }, [])

  // Fetch units when grade changes
  useEffect(() => {
    if (!level || !grade) { setUnits([]); return }
    fetch(`/api/units?level=${level}&grade=${encodeURIComponent(grade)}`)
      .then((r) => r.json())
      .then((d) => setUnits(d.units ?? []))
  }, [level, grade])

  // Reset grade/units when level changes
  useEffect(() => {
    form.setValue("grade", "")
    form.setValue("unitIds", [])
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

  const grades = level ? GRADES_BY_LEVEL[level] ?? [] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Profile</CardTitle>
        <CardDescription>Choose your level, grade, and units to practise.</CardDescription>
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

            {/* Units */}
            {grade && units.length > 0 && (
              <FormField
                control={form.control}
                name="unitIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Units to Practise</FormLabel>
                    <p className="text-muted-foreground text-xs mb-2">Select the topics you want daily questions from.</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {units.map((unit) => (
                        <FormField
                          key={unit.id}
                          control={form.control}
                          name="unitIds"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 rounded-lg border p-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(unit.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? []
                                    field.onChange(
                                      checked
                                        ? [...current, unit.id]
                                        : current.filter((id) => id !== unit.id)
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal text-sm leading-tight">
                                {unit.title}
                                <Badge variant="outline" className="ml-2 text-xs">{unit.grade}</Badge>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {grade && units.length === 0 && (
              <p className="text-muted-foreground text-sm">No units found for this grade yet.</p>
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
