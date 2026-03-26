"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Pencil, Trash2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MathText } from "@/components/math-text"

type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  unit: { title: string; grade: string; level: string }
}

type Unit = { id: string; title: string; grade: string; level: string }

const LEVEL_LABELS: Record<string, string> = {
  ALL: "All Classes",
  PRIMARY: "Primary",
  HIGH_SCHOOL: "High School",
  INTERNATIONAL: "International",
}

export function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [levelFilter, setLevelFilter] = useState("ALL")
  const [unitFilter, setUnitFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadQuestions = (unitId?: string) => {
    setLoading(true)
    const url = unitId && unitId !== "ALL"
      ? `/api/admin/questions?unitId=${unitId}`
      : "/api/admin/questions"
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setQuestions(d.questions ?? []); setLoading(false) })
  }

  useEffect(() => {
    fetch("/api/admin/units").then((r) => r.json()).then((d) => setUnits(d.units ?? []))
    loadQuestions()
  }, [])

  const handleLevelFilter = (level: string) => {
    setLevelFilter(level)
    setUnitFilter("ALL")
    setSearch("")
    loadQuestions()
  }

  const handleUnitFilter = (unitId: string) => {
    setUnitFilter(unitId)
    setSearch("")
    loadQuestions(unitId)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return
    setDeleting(id)
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" })
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    setDeleting(null)
  }

  const clearFilters = () => {
    setLevelFilter("ALL")
    setUnitFilter("ALL")
    setSearch("")
    loadQuestions()
  }

  // Units filtered by selected level (for the unit pills)
  const unitsForLevel = levelFilter === "ALL" ? units : units.filter((u) => u.level === levelFilter)

  // Client-side search on top of server-filtered questions
  const displayed = useMemo(() => {
    if (!search.trim()) return questions
    const q = search.toLowerCase()
    return questions.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.unit.title.toLowerCase().includes(q) ||
        item.unit.grade.toLowerCase().includes(q)
    )
  }, [questions, search])

  const hasActiveFilter = levelFilter !== "ALL" || unitFilter !== "ALL" || search.trim() !== ""

  return (
    <div className="space-y-5">

      {/* ── Filter bar ── */}
      <div className="rounded-xl border bg-card p-4 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, units, grades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Class filter pills */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Class</p>
          <div className="flex flex-wrap gap-2">
            {["ALL", "PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelFilter(lvl)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  levelFilter === lvl
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {LEVEL_LABELS[lvl]}
              </button>
            ))}
          </div>
        </div>

        {/* Unit filter pills — shown once a class is selected */}
        {unitsForLevel.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleUnitFilter("ALL")}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  unitFilter === "ALL"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All Units
              </button>
              {unitsForLevel.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUnitFilter(u.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1.5",
                    unitFilter === u.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {u.title}
                  <span className={cn(
                    "text-xs",
                    unitFilter === u.id ? "opacity-75" : "opacity-60"
                  )}>
                    {u.grade}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter summary + clear */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between pt-1 border-t">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{displayed.length}</span> question{displayed.length !== 1 ? "s" : ""}
              {levelFilter !== "ALL" && <> in <span className="font-semibold text-foreground">{LEVEL_LABELS[levelFilter]}</span></>}
              {unitFilter !== "ALL" && <> · <span className="font-semibold text-foreground">{units.find(u => u.id === unitFilter)?.title}</span></>}
              {search && <> matching &ldquo;<span className="font-semibold text-foreground">{search}</span>&rdquo;</>}
            </p>
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        {!hasActiveFilter && !loading && (
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""} total
          </p>
        )}
        <Button asChild className="ml-auto">
          <Link href="/admin/questions/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Link>
        </Button>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {hasActiveFilter
              ? "No questions match your filters."
              : <>No questions yet. <Link href="/admin/questions/new" className="underline">Add one</Link>.</>
            }
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map((q) => (
            <Card key={q.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs shrink-0">{LEVEL_LABELS[q.unit.level]}</Badge>
                      <Badge variant="outline" className="text-xs shrink-0">{q.unit.grade}</Badge>
                      <span className="text-xs text-muted-foreground font-medium truncate">{q.unit.title}</span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2"><MathText text={q.text} /></p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Correct: <span className="font-semibold text-foreground">{q.correctAnswer}</span>
                      {" — "}<MathText text={(q.options as string[])[["A","B","C","D"].indexOf(q.correctAnswer)]} />
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/admin/questions/${q.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(q.id)}
                      disabled={deleting === q.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
