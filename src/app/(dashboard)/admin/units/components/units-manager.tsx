"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { PlusCircle, Pencil, Trash2, BookOpen, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Unit = {
  id: string
  title: string
  grade: string
  level: string
  _count: { questions: number }
}

const LEVELS = ["PRIMARY", "HIGH_SCHOOL", "INTERNATIONAL"] as const
const LEVEL_LABELS: Record<string, string> = {
  PRIMARY: "Primary",
  HIGH_SCHOOL: "High School",
  INTERNATIONAL: "International",
}
const LEVEL_COLORS: Record<string, string> = {
  PRIMARY: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  HIGH_SCHOOL: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  INTERNATIONAL: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
}

type UnitForm = { title: string; grade: string; level: typeof LEVELS[number] }

function UnitForm({
  form,
  setForm,
  error,
}: {
  form: UnitForm
  setForm: (f: UnitForm) => void
  error: string
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label>Unit Name *</Label>
        <Input
          placeholder="e.g. Quadratic Equations"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Grade / Form *</Label>
        <Input
          placeholder="e.g. Form 4, Grade 9"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Class Level *</Label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setForm({ ...form, level: lvl })}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                form.level === lvl
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border text-muted-foreground"
              )}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  )
}

export function UnitsManager() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  // Add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<UnitForm>({ title: "", grade: "", level: "PRIMARY" })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  // Edit dialog
  const [editUnit, setEditUnit] = useState<Unit | null>(null)
  const [editForm, setEditForm] = useState<UnitForm>({ title: "", grade: "", level: "PRIMARY" })
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState("")

  // Delete
  const [deleteError, setDeleteError] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadUnits = () =>
    fetch("/api/admin/units")
      .then((r) => r.json())
      .then((d) => { setUnits(d.units ?? []); setLoading(false) })

  useEffect(() => { loadUnits() }, [])

  const grouped = LEVELS.reduce<Record<string, Unit[]>>((acc, lvl) => {
    acc[lvl] = units.filter((u) => u.level === lvl)
    return acc
  }, {} as Record<string, Unit[]>)

  // ── Add ──
  const handleAdd = async () => {
    setAddError("")
    if (!addForm.title.trim() || !addForm.grade.trim()) {
      setAddError("Unit name and grade are required.")
      return
    }
    setAdding(true)
    const res = await fetch("/api/admin/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    if (!res.ok) { setAddError(data.error ?? "Failed to create unit"); setAdding(false); return }
    await loadUnits()
    setAddForm({ title: "", grade: "", level: "PRIMARY" })
    setAdding(false)
    setAddOpen(false)
  }

  // ── Edit ──
  const openEdit = (unit: Unit) => {
    setEditUnit(unit)
    setEditForm({ title: unit.title, grade: unit.grade, level: unit.level as typeof LEVELS[number] })
    setEditError("")
  }

  const handleEdit = async () => {
    if (!editUnit) return
    setEditError("")
    if (!editForm.title.trim() || !editForm.grade.trim()) {
      setEditError("Unit name and grade are required.")
      return
    }
    setEditing(true)
    const res = await fetch(`/api/admin/units/${editUnit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    if (!res.ok) { setEditError(data.error ?? "Failed to update unit"); setEditing(false); return }
    await loadUnits()
    setEditing(false)
    setEditUnit(null)
  }

  // ── Delete ──
  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Delete "${unit.title}"? This cannot be undone.`)) return
    setDeleting(unit.id)
    setDeleteError((prev) => ({ ...prev, [unit.id]: "" }))
    const res = await fetch(`/api/admin/units/${unit.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      setDeleteError((prev) => ({ ...prev, [unit.id]: data.error ?? "Failed to delete" }))
    } else {
      setUnits((prev) => prev.filter((u) => u.id !== unit.id))
    }
    setDeleting(null)
  }

  return (
    <>
      <div className="space-y-6 max-w-3xl">
        {/* Add button */}
        <div className="flex justify-end">
          <Button onClick={() => { setAddError(""); setAddOpen(true) }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          LEVELS.map((lvl) => (
            <Card key={lvl}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", LEVEL_COLORS[lvl])}>
                      {LEVEL_LABELS[lvl]}
                    </span>
                    <span className="text-muted-foreground font-normal text-sm">
                      {grouped[lvl].length} unit{grouped[lvl].length !== 1 ? "s" : ""}
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => { setAddForm({ title: "", grade: "", level: lvl }); setAddError(""); setAddOpen(true) }}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add to {LEVEL_LABELS[lvl]}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[lvl].length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No units yet.{" "}
                    <button
                      className="underline text-primary"
                      onClick={() => { setAddForm({ title: "", grade: "", level: lvl }); setAddError(""); setAddOpen(true) }}
                    >
                      Add one
                    </button>
                  </p>
                ) : (
                  grouped[lvl].map((unit) => (
                    <div key={unit.id}>
                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{unit.title}</p>
                            <p className="text-xs text-muted-foreground">{unit.grade}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <BookOpen className="h-3.5 w-3.5" />
                            {unit._count.questions} Q
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(unit)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(unit)}
                            disabled={deleting === unit.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {deleteError[unit.id] && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1 px-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {deleteError[unit.id]}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Add Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
          </DialogHeader>
          <UnitForm form={addForm} setForm={setAddForm} error={addError} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editUnit} onOpenChange={(o) => { if (!o) setEditUnit(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
          </DialogHeader>
          <UnitForm form={editForm} setForm={setEditForm} error={editError} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUnit(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
