import { describe, it, expect } from 'vitest'
import { TEMPLATES } from './templates'

describe('diagram templates data', () => {
  it('should have a collection of predefined templates', () => {
    expect(TEMPLATES.length).toBeGreaterThan(5)
  })

  it('should ensure all templates have valid required fields', () => {
    TEMPLATES.forEach((template) => {
      expect(template.id).toBeTruthy()
      expect(template.title).toBeTruthy()
      expect(template.category).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.code.trim().length).toBeGreaterThan(0)
    })
  })

  it('should include key diagram categories', () => {
    const categories = TEMPLATES.map((t) => t.category)
    expect(categories).toContain('architecture')
    expect(categories).toContain('sequence')
    expect(categories).toContain('database')
    expect(categories).toContain('project')
    expect(categories).toContain('markdown')
  })
})