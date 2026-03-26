"use client"

import katex from "katex"
import "katex/dist/katex.min.css"

type Part =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string }

function parseParts(text: string): Part[] {
  const parts: Part[] = []
  // Split on $$...$$ first (block), then $...$ (inline)
  const blockRe = /\$\$([\s\S]+?)\$\$/g
  const inlineRe = /\$((?:[^$\\]|\\.)+?)\$/g

  let remaining = text
  let result: RegExpExecArray | null

  // Process block math first
  const segments: { start: number; end: number; value: string; type: "block" | "inline" }[] = []

  blockRe.lastIndex = 0
  while ((result = blockRe.exec(text)) !== null) {
    segments.push({ start: result.index, end: result.index + result[0].length, value: result[1], type: "block" })
  }

  inlineRe.lastIndex = 0
  while ((result = inlineRe.exec(text)) !== null) {
    // Skip if inside a block segment
    const inside = segments.some((s) => s.type === "block" && result!.index >= s.start && result!.index < s.end)
    if (!inside) {
      segments.push({ start: result.index, end: result.index + result[0].length, value: result[1], type: "inline" })
    }
  }

  segments.sort((a, b) => a.start - b.start)

  let cursor = 0
  for (const seg of segments) {
    if (seg.start > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, seg.start) })
    }
    parts.push({ type: seg.type, value: seg.value })
    cursor = seg.end
  }
  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) })
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }]
}

function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, output: "html" })
  } catch {
    return latex
  }
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = parseParts(text)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>
        if (part.type === "block") {
          return (
            <span
              key={i}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderMath(part.value, true) }}
            />
          )
        }
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: renderMath(part.value, false) }}
          />
        )
      })}
    </span>
  )
}
