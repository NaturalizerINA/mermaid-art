import mermaid from "mermaid"

export type MermaidTheme = "default" | "dark" | "forest" | "neutral" | "base"

let initialized = false

export function initMermaid(theme: MermaidTheme = "dark") {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: theme,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    themeVariables: theme === "dark" ? {
      darkMode: true,
      background: "#0f172a",
      primaryColor: "#3b82f6",
      primaryTextColor: "#f8fafc",
      primaryBorderColor: "#60a5fa",
      lineColor: "#94a3b8",
      secondaryColor: "#1e293b",
      tertiaryColor: "#334155",
    } : {
      darkMode: false,
      primaryColor: "#3b82f6",
      primaryTextColor: "#0f172a",
      primaryBorderColor: "#2563eb",
      lineColor: "#64748b",
      secondaryColor: "#f1f5f9",
      tertiaryColor: "#e2e8f0",
    }
  })
  initialized = true
}

export interface RenderResult {
  svg: string
  error: string | null
}

export async function renderMermaid(
  code: string,
  theme: MermaidTheme = "dark"
): Promise<RenderResult> {
  const trimmed = code.trim()
  if (!trimmed) {
    return { svg: "", error: "Code is empty" }
  }

  const id = `mermaid-render-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  try {
    initMermaid(theme)
    const { svg } = await mermaid.render(id, trimmed)
    return { svg, error: null }
  } catch (err: any) {
    // Cleanup any temporary element Mermaid may have left behind in DOM
    const el = document.getElementById(id)
    if (el) {
      el.remove()
    }
    const errorMsg = err?.message || String(err) || "Syntax error in Mermaid diagram"
    return { svg: "", error: errorMsg }
  }
}

export interface ExtractedBlock {
  index: number
  code: string
  title?: string
}

export function extractMermaidBlocksFromMarkdown(markdown: string): ExtractedBlock[] {
  const regex = /```(?:mermaid)\r?\n([\s\S]*?)```/gi
  const blocks: ExtractedBlock[] = []
  let match: RegExpExecArray | null
  let index = 0

  while ((match = regex.exec(markdown)) !== null) {
    if (match[1] && match[1].trim()) {
      blocks.push({
        index,
        code: match[1].trim(),
        title: `Diagram #${index + 1}`
      })
      index++
    }
  }

  return blocks
}