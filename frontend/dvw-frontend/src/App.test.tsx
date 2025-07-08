import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the React Flow components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">
      {children}
    </div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Panel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="panel">{children}</div>
  ),
  addEdge: vi.fn(),
}))

describe('App', () => {
  it('renders the Data Vault Modeler', () => {
    render(<App />)
    expect(screen.getByText('Data Vault Modeler')).toBeInTheDocument()
  })

  it('renders the node creation buttons', () => {
    render(<App />)
    expect(screen.getByText('Add Hub')).toBeInTheDocument()
    expect(screen.getByText('Add Link')).toBeInTheDocument()
    expect(screen.getByText('Add Satellite')).toBeInTheDocument()
    expect(screen.getByText('Save Model')).toBeInTheDocument()
  })

  it('renders React Flow components', () => {
    render(<App />)
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    expect(screen.getByTestId('background')).toBeInTheDocument()
    expect(screen.getByTestId('controls')).toBeInTheDocument()
    expect(screen.getByTestId('minimap')).toBeInTheDocument()
    expect(screen.getByTestId('panel')).toBeInTheDocument()
  })
}) 