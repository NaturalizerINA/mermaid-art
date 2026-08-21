import { describe, it, expect } from 'vitest'
import { 
  sanitizeSvgForExport, 
  getBackgroundColor, 
  exportDiagram 
} from './export-engine'

describe('export-engine utility', () => {
  describe('getBackgroundColor', () => {
    it('should return null for transparent background', () => {
      expect(getBackgroundColor('transparent')).toBeNull()
    })

    it('should return #ffffff for white background', () => {
      expect(getBackgroundColor('white')).toBe('#ffffff')
    })

    it('should return #0f172a for dark background', () => {
      expect(getBackgroundColor('dark')).toBe('#0f172a')
    })

    it('should return custom color for custom background', () => {
      expect(getBackgroundColor('custom', '#ff0000')).toBe('#ff0000')
    })

    it('should fallback to default #0f172a if custom color is not provided', () => {
      expect(getBackgroundColor('custom')).toBe('#0f172a')
    })
  })

  describe('sanitizeSvgForExport', () => {
    it('should ensure xmlns attribute is present on root svg element', () => {
      const rawSvg = '<svg viewBox="0 0 500 300"><circle cx="50" cy="50" r="40" /></svg>'
      const { cleanSvg, width, height } = sanitizeSvgForExport(rawSvg)

      expect(cleanSvg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(width).toBe(500)
      expect(height).toBe(300)
    })

    it('should parse width and height from explicit attributes if viewBox is missing', () => {
      const rawSvg = '<svg width="640" height="480"><rect width="100" height="100" /></svg>'
      const { width, height } = sanitizeSvgForExport(rawSvg)

      expect(width).toBe(640)
      expect(height).toBe(480)
    })

    it('should throw error when invalid SVG string is provided', () => {
      expect(() => sanitizeSvgForExport('<div>not an svg</div>')).toThrowError('Invalid SVG content')
    })
  })

  describe('exportDiagram for SVG', () => {
    it('should return a valid SVG Blob when format is svg', async () => {
      const rawSvg = '<svg viewBox="0 0 100 100"><rect width="100" height="100" /></svg>'
      const blob = await exportDiagram(rawSvg, {
        format: 'svg',
        scale: 2,
        backgroundType: 'transparent',
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/svg+xml;charset=utf-8')
    })
  })
})