import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge Component', () => {
  it('should render badge with children text', () => {
    render(<Badge>Active Status</Badge>)
    expect(screen.getByText('Active Status')).toBeInTheDocument()
  })

  it('should apply success variant styling', () => {
    const { container } = render(<Badge variant="success">Success Badge</Badge>)
    expect(container.firstChild).toHaveClass('text-emerald-600')
  })

  it('should apply warning variant styling', () => {
    const { container } = render(<Badge variant="warning">Warning Badge</Badge>)
    expect(container.firstChild).toHaveClass('text-amber-600')
  })
})