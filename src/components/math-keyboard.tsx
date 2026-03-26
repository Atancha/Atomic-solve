"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type KeyDef = {
  label: string      // what the button shows
  latex: string      // what gets inserted (raw LaTeX, no $ wrapping)
  wide?: boolean     // wider button
}

// ── Symbol categories ─────────────────────────────────────────────────────────

const CATEGORIES: { id: string; label: string; keys: KeyDef[] }[] = [
  {
    id: "basic",
    label: "Basic",
    keys: [
      { label: "+",  latex: "+" },
      { label: "−",  latex: "-" },
      { label: "×",  latex: "\\times" },
      { label: "÷",  latex: "\\div" },
      { label: "=",  latex: "=" },
      { label: "≠",  latex: "\\neq" },
      { label: "<",  latex: "<" },
      { label: ">",  latex: ">" },
      { label: "≤",  latex: "\\leq" },
      { label: "≥",  latex: "\\geq" },
      { label: "±",  latex: "\\pm" },
      { label: "∞",  latex: "\\infty" },
      { label: "( )", latex: "\\left( \\right)", wide: true },
      { label: "| |", latex: "\\left| \\right|", wide: true },
    ],
  },
  {
    id: "fractions",
    label: "Fractions & Powers",
    keys: [
      { label: "a/b",  latex: "\\frac{}{}", wide: true },
      { label: "x²",   latex: "^{2}" },
      { label: "x³",   latex: "^{3}" },
      { label: "xⁿ",   latex: "^{}" },
      { label: "xₙ",   latex: "_{}" },
      { label: "√x",   latex: "\\sqrt{}" },
      { label: "∛x",   latex: "\\sqrt[3]{}" },
      { label: "ⁿ√x",  latex: "\\sqrt[]{}", wide: true },
    ],
  },
  {
    id: "trig",
    label: "Trigonometry",
    keys: [
      { label: "sin",     latex: "\\sin" },
      { label: "cos",     latex: "\\cos" },
      { label: "tan",     latex: "\\tan" },
      { label: "cosec",   latex: "\\csc" },
      { label: "sec",     latex: "\\sec" },
      { label: "cot",     latex: "\\cot" },
      { label: "sin⁻¹",  latex: "\\sin^{-1}", wide: true },
      { label: "cos⁻¹",  latex: "\\cos^{-1}", wide: true },
      { label: "tan⁻¹",  latex: "\\tan^{-1}", wide: true },
      { label: "sin(θ)",  latex: "\\sin(\\theta)", wide: true },
      { label: "cos(θ)",  latex: "\\cos(\\theta)", wide: true },
      { label: "tan(θ)",  latex: "\\tan(\\theta)", wide: true },
    ],
  },
  {
    id: "greek",
    label: "Greek",
    keys: [
      { label: "π",  latex: "\\pi" },
      { label: "θ",  latex: "\\theta" },
      { label: "α",  latex: "\\alpha" },
      { label: "β",  latex: "\\beta" },
      { label: "γ",  latex: "\\gamma" },
      { label: "δ",  latex: "\\delta" },
      { label: "λ",  latex: "\\lambda" },
      { label: "μ",  latex: "\\mu" },
      { label: "σ",  latex: "\\sigma" },
      { label: "φ",  latex: "\\phi" },
      { label: "ω",  latex: "\\omega" },
      { label: "Δ",  latex: "\\Delta" },
      { label: "Σ",  latex: "\\Sigma" },
      { label: "Ω",  latex: "\\Omega" },
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    keys: [
      { label: "d/dx",    latex: "\\frac{d}{dx}", wide: true },
      { label: "∂/∂x",   latex: "\\frac{\\partial}{\\partial x}", wide: true },
      { label: "∫",       latex: "\\int" },
      { label: "∫ₐᵇ",    latex: "\\int_{}^{}", wide: true },
      { label: "∑",       latex: "\\sum_{}^{}", wide: true },
      { label: "lim",     latex: "\\lim_{x \\to }", wide: true },
      { label: "→",       latex: "\\to" },
      { label: "∈",       latex: "\\in" },
      { label: "∉",       latex: "\\notin" },
      { label: "≈",       latex: "\\approx" },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the cursor at `pos` is inside a $...$ math block */
function isInsideMath(text: string, pos: number): boolean {
  let count = 0
  for (let i = 0; i < pos; i++) {
    if (text[i] === "$" && (i === 0 || text[i - 1] !== "\\")) count++
  }
  return count % 2 === 1
}

/**
 * Builds the string to insert and where to place the cursor afterwards.
 * If cursor is already inside $...$, inserts raw latex.
 * Otherwise wraps in $...$
 * Cursor lands inside the first {} template slot if one exists.
 */
function buildInsert(
  text: string,
  selStart: number,
  selEnd: number,
  latex: string
): { newText: string; newCursor: number } {
  const inside = isInsideMath(text, selStart)
  const wrapped = inside ? latex : `$${latex}$`

  const newText = text.slice(0, selStart) + wrapped + text.slice(selEnd)

  // Place cursor inside first empty {} if present
  const braceIdx = wrapped.indexOf("{}")
  const newCursor =
    braceIdx !== -1
      ? selStart + braceIdx + 1   // land inside {}
      : selStart + wrapped.length  // land at end

  return { newText, newCursor }
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  /** Called with the resolved string to insert and cursor position */
  onInsert: (result: { newText: string; newCursor: number }) => void
  /** The current value of the active textarea (needed for context detection) */
  currentValue: string
  /** Saved cursor selection at the point the textarea lost focus */
  savedSelection: { start: number; end: number }
  /** Label of the field currently targeted (e.g. "Question", "Option A") */
  activeFieldLabel?: string
  className?: string
}

export function MathKeyboard({ onInsert, currentValue, savedSelection, activeFieldLabel, className }: Props) {
  const [open, setOpen] = useState(true)

  const handleKey = (latex: string) => {
    const result = buildInsert(
      currentValue,
      savedSelection.start,
      savedSelection.end,
      latex
    )
    onInsert(result)
  }

  return (
    <div className={cn("rounded-lg border bg-muted/30", className)}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          Math Keyboard
          {activeFieldLabel && (
            <span className="text-xs font-normal text-muted-foreground/70">
              → {activeFieldLabel}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t px-3 pb-3 pt-2">
          <Tabs defaultValue="basic">
            <TabsList className="h-8 mb-3 flex-wrap gap-1 w-full justify-start bg-transparent p-0">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="h-7 text-xs px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-0">
                <div className="flex flex-wrap gap-1.5">
                  {cat.keys.map((key) => (
                    <Button
                      key={key.latex}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleKey(key.latex)}
                      className={cn(
                        "h-8 text-sm font-mono",
                        key.wide ? "px-3" : "w-10 px-0"
                      )}
                    >
                      {key.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}
