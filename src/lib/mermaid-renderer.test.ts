import { describe, it, expect } from 'vitest'
import { extractMermaidBlocksFromMarkdown } from './mermaid-renderer'

describe('mermaid-renderer utility', () => {
  describe('extractMermaidBlocksFromMarkdown', () => {
    it('should return empty array when markdown contains no mermaid blocks', () => {
      const markdown = '# Hello World\nThis is standard text without diagrams.'
      const blocks = extractMermaidBlocksFromMarkdown(markdown)
      expect(blocks).toEqual([])
    })

    it('should extract a single mermaid block correctly', () => {
      const markdown = `
# Title

Here is a diagram:

\`\`\`mermaid
flowchart TD
    A[Start] --> B[End]
\`\`\`

End of doc.
      `
      const blocks = extractMermaidBlocksFromMarkdown(markdown)
      expect(blocks).toHaveLength(1)
      expect(blocks[0].code).toContain('flowchart TD')
      expect(blocks[0].code).toContain('A[Start] --> B[End]')
      expect(blocks[0].index).toBe(0)
    })

    it('should extract multiple mermaid blocks from markdown', () => {
      const markdown = `
## Section 1
\`\`\`mermaid
graph LR
    User --> App
\`\`\`

## Section 2
\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello
\`\`\`
      `
      const blocks = extractMermaidBlocksFromMarkdown(markdown)
      expect(blocks).toHaveLength(2)
      expect(blocks[0].code).toContain('graph LR')
      expect(blocks[1].code).toContain('sequenceDiagram')
      expect(blocks[0].index).toBe(0)
      expect(blocks[1].index).toBe(1)
    })

    it('should handle empty or whitespace-only code blocks gracefully', () => {
      const markdown = `
\`\`\`mermaid
\`\`\`
      `
      const blocks = extractMermaidBlocksFromMarkdown(markdown)
      expect(blocks).toHaveLength(0)
    })
  })
})