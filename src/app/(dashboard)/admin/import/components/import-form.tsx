"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Upload, FileJson } from "lucide-react"

type Result = {
  imported: number
  failed: { index: number; reason: string }[]
}

const EXAMPLE = `[
  {
    "unit": "Fractions",
    "grade": "Grade 6",
    "text": "What is $\\\\frac{1}{2} + \\\\frac{1}{4}$?",
    "options": ["$\\\\frac{1}{4}$", "$\\\\frac{3}{4}$", "$\\\\frac{1}{6}$", "$1$"],
    "correctAnswer": "B",
    "explanation": "Convert to a common denominator: $\\\\frac{2}{4} + \\\\frac{1}{4} = \\\\frac{3}{4}$"
  }
]`

export function ImportForm() {
  const [json, setJson] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [parseError, setParseError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setJson((ev.target?.result as string) ?? "")
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    setParseError("")
    setResult(null)

    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      setParseError("Invalid JSON — check your syntax and try again.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/admin/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })
    const data: Result = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Format reference */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-2">Expected JSON format:</p>
          <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap">{EXAMPLE}</pre>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p><span className="font-semibold text-foreground">unit</span> — must match an existing unit name exactly (e.g. "Fractions", "Algebra")</p>
            <p><span className="font-semibold text-foreground">grade</span> — must match exactly (e.g. "Grade 6", "Form 3")</p>
            <p><span className="font-semibold text-foreground">options</span> — array of exactly 4 strings</p>
            <p><span className="font-semibold text-foreground">correctAnswer</span> — one of "A", "B", "C", "D"</p>
            <p><span className="font-semibold text-foreground">LaTeX</span> — wrap with <code>$...$</code> for inline math, <code>$$...$$</code> for block</p>
          </div>
        </CardContent>
      </Card>

      {/* File upload */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload .json file
        </Button>
        <span className="text-sm text-muted-foreground">or paste JSON below</span>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
      </div>

      {/* Textarea */}
      <Textarea
        rows={16}
        placeholder="Paste your JSON array here..."
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="font-mono text-xs"
      />

      {parseError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <XCircle className="h-4 w-4" /> {parseError}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={loading || !json.trim()}>
        <FileJson className="h-4 w-4 mr-2" />
        {loading ? "Importing..." : "Import Questions"}
      </Button>

      {/* Results */}
      {result && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">{result.imported} question{result.imported !== 1 ? "s" : ""} imported successfully</span>
            </div>

            {result.failed.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> {result.failed.length} failed
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-5 list-disc">
                  {result.failed.map((f) => (
                    <li key={f.index}>
                      Item #{f.index + 1}: {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
