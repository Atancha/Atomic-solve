"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MathText } from "@/components/math-text"
import { MathKeyboard } from "@/components/math-keyboard"

type Unit = { id: string; title: string; grade: string; level: string }

type FormData = {
  unitId: string
  text: string
  options: [string, string, string, string]
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
}

type Props = {
  initial?: FormData & { id: string }
  mode: "new" | "edit"
}

type ActiveField = "text" | "option0" | "option1" | "option2" | "option3" | "explanation"

const OPTION_LABELS = ["A", "B", "C", "D"] as const

const LEVEL_LABELS: Record<string, string> = {
  ALL: "All Levels",
  PRIMARY: "Primary",
  HIGH_SCHOOL: "High School",
  INTERNATIONAL: "International",
}

const LEVEL_OPTIONS = ["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"] as const

const ACTIVE_FIELD_LABELS: Record<ActiveField, string> = {
  text: "Question",
  option0: "Option A",
  option1: "Option B",
  option2: "Option C",
  option3: "Option D",
  explanation: "Explanation",
}

// Shows rendered math ABOVE the raw input so the user sees the clean output first
function MathPreview({ value }: { value: string }) {
  if (!value.includes("$")) return null
  return (
    <div className="rounded-md border-2 border-primary/25 bg-primary/5 px-3 py-2.5 text-sm mb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/70 block mb-1">
        Rendered
      </span>
      <MathText text={value} />
    </div>
  )
}

export function QuestionForm({ initial, mode }: Props) {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [levelFilter, setLevelFilter] = useState<string>("ALL")
  const [unitOpen, setUnitOpen] = useState(false)
  const [form, setForm] = useState<FormData>(
    initial ?? {
      unitId: "",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
    }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // ── Field refs ──────────────────────────────────────────────────────────────
  const textRef = useRef<HTMLTextAreaElement>(null)
  const explanationRef = useRef<HTMLTextAreaElement>(null)
  const optionRef0 = useRef<HTMLInputElement>(null)
  const optionRef1 = useRef<HTMLInputElement>(null)
  const optionRef2 = useRef<HTMLInputElement>(null)
  const optionRef3 = useRef<HTMLInputElement>(null)
  const optionRefs = [optionRef0, optionRef1, optionRef2, optionRef3]

  // ── Cursor tracking ─────────────────────────────────────────────────────────
  const [activeField, setActiveField] = useState<ActiveField>("text")
  const [savedSel, setSavedSel] = useState({ start: 0, end: 0 })

  const saveTA = (field: ActiveField) =>
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      setActiveField(field)
      setSavedSel({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })
    }

  const saveIN = (field: ActiveField) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      setActiveField(field)
      setSavedSel({ start: e.currentTarget.selectionStart ?? 0, end: e.currentTarget.selectionEnd ?? 0 })
    }

  const currentValue =
    activeField === "text" ? form.text
    : activeField === "explanation" ? form.explanation
    : form.options[parseInt(activeField.replace("option", ""))]

  const handleKeyboardInsert = ({ newText, newCursor }: { newText: string; newCursor: number }) => {
    if (activeField === "text") {
      setForm((f) => ({ ...f, text: newText }))
      requestAnimationFrame(() => {
        textRef.current?.focus()
        textRef.current?.setSelectionRange(newCursor, newCursor)
      })
    } else if (activeField === "explanation") {
      setForm((f) => ({ ...f, explanation: newText }))
      requestAnimationFrame(() => {
        explanationRef.current?.focus()
        explanationRef.current?.setSelectionRange(newCursor, newCursor)
      })
    } else {
      const idx = parseInt(activeField.replace("option", ""))
      setForm((f) => {
        const opts = [...f.options] as [string, string, string, string]
        opts[idx] = newText
        return { ...f, options: opts }
      })
      requestAnimationFrame(() => {
        optionRefs[idx].current?.focus()
        optionRefs[idx].current?.setSelectionRange(newCursor, newCursor)
      })
    }
    setSavedSel({ start: newCursor, end: newCursor })
  }

  // ── Add unit dialog ─────────────────────────────────────────────────────────
  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [newUnit, setNewUnit] = useState({ title: "", grade: "", level: "PRIMARY" as typeof LEVEL_OPTIONS[number] })
  const [addingUnit, setAddingUnit] = useState(false)
  const [addUnitError, setAddUnitError] = useState("")

  const loadUnits = () =>
    fetch("/api/admin/units")
      .then((r) => r.json())
      .then((d) => setUnits(d.units ?? []))

  useEffect(() => { loadUnits() }, [])

  const filteredUnits = levelFilter === "ALL" ? units : units.filter((u) => u.level === levelFilter)
  const selectedUnit = units.find((u) => u.id === form.unitId)

  const setOption = (index: number, value: string) => {
    const next = [...form.options] as [string, string, string, string]
    next[index] = value
    setForm({ ...form, options: next })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    const url = mode === "new" ? "/api/admin/questions" : `/api/admin/questions/${initial!.id}`
    const method = mode === "new" ? "POST" : "PUT"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(typeof d.error === "string" ? d.error : "Something went wrong")
      setSaving(false)
      return
    }
    router.push("/admin/questions")
    router.refresh()
  }

  const handleAddUnit = async () => {
    setAddUnitError("")
    if (!newUnit.title.trim() || !newUnit.grade.trim()) {
      setAddUnitError("Title and grade are required.")
      return
    }
    setAddingUnit(true)
    const res = await fetch("/api/admin/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUnit),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddUnitError(typeof data.error === "string" ? data.error : "Failed to create unit")
      setAddingUnit(false)
      return
    }
    await loadUnits()
    setForm({ ...form, unitId: data.unit.id })
    setLevelFilter(data.unit.level)
    setNewUnit({ title: "", grade: "", level: "PRIMARY" })
    setAddingUnit(false)
    setAddUnitOpen(false)
  }

  return (
    <>
      {/* Two-column: form left, keyboard right (sticky) */}
      <div className="flex gap-6 items-start max-w-4xl">

        {/* ── Left: form ── */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-5">

          {/* Level filter */}
          <div className="space-y-2">
            <Label>Class / Level</Label>
            <div className="flex flex-wrap gap-2">
              {["ALL", ...LEVEL_OPTIONS].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevelFilter(lvl)
                    if (lvl !== "ALL" && selectedUnit && selectedUnit.level !== lvl) {
                      setForm({ ...form, unitId: "" })
                    }
                  }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
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

          {/* Unit selection */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Unit *</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setAddUnitOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add unit
                </Button>
              </div>
              <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedUnit ? (
                      <span className="flex items-center gap-2">
                        {selectedUnit.title}
                        <Badge variant="secondary" className="text-xs">{selectedUnit.grade}</Badge>
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Search className="h-4 w-4" /> Search units...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search units..." />
                    <CommandList>
                      <CommandEmpty>
                        No units found.{" "}
                        <button type="button" className="underline text-primary" onClick={() => { setUnitOpen(false); setAddUnitOpen(true) }}>
                          Add one?
                        </button>
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredUnits.map((u) => (
                          <CommandItem key={u.id} value={`${u.title} ${u.grade}`} onSelect={() => { setForm({ ...form, unitId: u.id }); setUnitOpen(false) }}>
                            <Check className={cn("mr-2 h-4 w-4", form.unitId === u.id ? "opacity-100" : "opacity-0")} />
                            <span>{u.title}</span>
                            <Badge variant="outline" className="ml-auto text-xs">{u.grade}</Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Question + options card */}
          <Card>
            <CardContent className="pt-5 space-y-5">

              {/* Question text */}
              <div className="space-y-1.5">
                <Label htmlFor="text">Question *</Label>
                <MathPreview value={form.text} />
                <Textarea
                  id="text"
                  ref={textRef}
                  rows={3}
                  placeholder="e.g. What is 1/4 as a decimal?"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  onFocus={saveTA("text")}
                  onKeyUp={saveTA("text")}
                  onMouseUp={saveTA("text")}
                  onSelect={saveTA("text")}
                  onBlur={saveTA("text")}
                  className={cn(form.text.includes("$") && "font-mono text-xs text-muted-foreground")}
                  required
                />
              </div>

              {/* Answer options */}
              <div className="space-y-3">
                <Label>Answer Options *</Label>
                {OPTION_LABELS.map((label, i) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0 border-2 transition-colors",
                        activeField === `option${i}`
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {label}
                      </span>
                      <div className="flex-1 space-y-1">
                        <MathPreview value={form.options[i]} />
                        <Input
                          ref={optionRefs[i]}
                          placeholder={`Option ${label}...`}
                          value={form.options[i]}
                          onChange={(e) => setOption(i, e.target.value)}
                          onFocus={saveIN(`option${i}` as ActiveField)}
                          onKeyUp={saveIN(`option${i}` as ActiveField)}
                          onMouseUp={saveIN(`option${i}` as ActiveField)}
                          onSelect={saveIN(`option${i}` as ActiveField)}
                          onBlur={saveIN(`option${i}` as ActiveField)}
                          className={cn(form.options[i].includes("$") && "font-mono text-xs text-muted-foreground")}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Correct answer */}
              <div className="space-y-1.5">
                <Label>Correct Answer *</Label>
                <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v as "A" | "B" | "C" | "D" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTION_LABELS.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}{form.options[OPTION_LABELS.indexOf(label)] ? ` — ${form.options[OPTION_LABELS.indexOf(label)]}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <Label htmlFor="explanation">Explanation *</Label>
                <MathPreview value={form.explanation} />
                <Textarea
                  id="explanation"
                  ref={explanationRef}
                  rows={2}
                  placeholder="e.g. Divide 1 by 4 to get 0.25"
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  onFocus={saveTA("explanation")}
                  onKeyUp={saveTA("explanation")}
                  onMouseUp={saveTA("explanation")}
                  onSelect={saveTA("explanation")}
                  onBlur={saveTA("explanation")}
                  className={cn(form.explanation.includes("$") && "font-mono text-xs text-muted-foreground")}
                  required
                />
              </div>

            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "new" ? "Add Question" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>

        {/* ── Right: sticky math keyboard ── */}
        <div className="w-72 shrink-0 sticky top-6">
          <MathKeyboard
            onInsert={handleKeyboardInsert}
            currentValue={currentValue}
            savedSelection={savedSel}
            activeFieldLabel={ACTIVE_FIELD_LABELS[activeField]}
          />
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Click any field on the left, then tap a symbol to insert it.
          </p>
        </div>

      </div>

      {/* ── Add Unit Dialog ── */}
      <Dialog open={addUnitOpen} onOpenChange={setAddUnitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Unit Name *</Label>
              <Input placeholder="e.g. Quadratic Equations" value={newUnit.title} onChange={(e) => setNewUnit({ ...newUnit, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Grade / Form *</Label>
              <Input placeholder="e.g. Form 4, Grade 9" value={newUnit.grade} onChange={(e) => setNewUnit({ ...newUnit, grade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Level *</Label>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewUnit({ ...newUnit, level: lvl })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                      newUnit.level === lvl
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border text-muted-foreground"
                    )}
                  >
                    {LEVEL_LABELS[lvl]}
                  </button>
                ))}
              </div>
            </div>
            {addUnitError && <p className="text-sm text-destructive">{addUnitError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUnitOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUnit} disabled={addingUnit}>{addingUnit ? "Adding..." : "Add Unit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
