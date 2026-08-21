import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getStoredCurrentCode, 
  saveCurrentCode, 
  getStoredIsMarkdown, 
  addToHistory, 
  getStoredHistory,
  generateShareUrl
} from './storage'

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = ''
  })

  it('should return default code when localStorage is empty and no url hash', () => {
    const defaultCode = 'flowchart TD\n    A-->B'
    expect(getStoredCurrentCode(defaultCode)).toBe(defaultCode)
  })

  it('should save and retrieve current code from localStorage', () => {
    const code = 'sequenceDiagram\n    Alice->>Bob: Hi'
    saveCurrentCode(code, false)
    expect(getStoredCurrentCode('default')).toBe(code)
    expect(getStoredIsMarkdown()).toBe(false)
  })

  it('should save and retrieve markdown mode state', () => {
    saveCurrentCode('# Doc', true)
    expect(getStoredIsMarkdown()).toBe(true)
  })

  it('should add items to history and maintain recent ordering', () => {
    addToHistory('Diagram 1', 'flowchart TD\n    A-->B', false)
    addToHistory('Diagram 2', 'sequenceDiagram\n    A->>B: Hi', false)

    const history = getStoredHistory()
    expect(history).toHaveLength(2)
    expect(history[0].title).toBe('Diagram 2')
    expect(history[1].title).toBe('Diagram 1')
  })

  it('should avoid duplicates when saving the exact same code to history', () => {
    const code = 'flowchart TD\n    A-->B'
    addToHistory('First Version', code, false)
    addToHistory('Updated Title', code, false)

    const history = getStoredHistory()
    expect(history).toHaveLength(1)
    expect(history[0].title).toBe('Updated Title')
  })

  it('should generate a valid shareable URL with encoded hash', () => {
    const code = 'flowchart LR\n    Start --> Finish'
    const shareUrl = generateShareUrl(code)
    expect(shareUrl).toContain('#code=')
  })
})