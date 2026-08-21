export interface SavedDiagram {
  id: string
  title: string
  code: string
  isMarkdown: boolean
  updatedAt: number
}

const STORAGE_KEY_CURRENT = "mermaidart_current_code"
const STORAGE_KEY_MODE = "mermaidart_is_markdown"
const STORAGE_KEY_HISTORY = "mermaidart_history"
const STORAGE_KEY_THEME = "mermaidart_mermaid_theme"

export function getStoredCurrentCode(defaultCode: string): string {
  try {
    const hash = window.location.hash.slice(1)
    if (hash && hash.startsWith("code=")) {
      const decoded = decodeURIComponent(atob(hash.replace("code=", "")))
      if (decoded) return decoded
    }
    return localStorage.getItem(STORAGE_KEY_CURRENT) || defaultCode
  } catch (e) {
    return defaultCode
  }
}

export function saveCurrentCode(code: string, isMarkdown: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT, code)
    localStorage.setItem(STORAGE_KEY_MODE, isMarkdown ? "true" : "false")
  } catch (e) {
    console.error("Failed to save to localStorage", e)
  }
}

export function getStoredIsMarkdown(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_MODE) === "true"
  } catch (e) {
    return false
  }
}

export function getStoredHistory(): SavedDiagram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function addToHistory(title: string, code: string, isMarkdown: boolean) {
  try {
    const history = getStoredHistory()
    const existingIndex = history.findIndex((h) => h.code.trim() === code.trim())
    
    const newEntry: SavedDiagram = {
      id: `diag-${Date.now()}`,
      title: title || "Untitled Diagram",
      code,
      isMarkdown,
      updatedAt: Date.now(),
    }

    let updatedHistory = history
    if (existingIndex >= 0) {
      updatedHistory.splice(existingIndex, 1)
    }

    updatedHistory.unshift(newEntry)
    // Keep max 25 entries
    updatedHistory = updatedHistory.slice(0, 25)
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory))
  } catch (e) {
    console.error("Failed to add to history", e)
  }
}

export function generateShareUrl(code: string): string {
  try {
    const encoded = btoa(encodeURIComponent(code))
    const url = new URL(window.location.href)
    url.hash = `code=${encoded}`
    return url.toString()
  } catch (e) {
    return window.location.href
  }
}