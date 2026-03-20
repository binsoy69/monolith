import React from 'react'

interface ErrorBoundaryProps {
  moduleName: string
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[ErrorBoundary] ${this.props.moduleName}:`, error, info)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 'var(--space-4)',
            padding: 'var(--space-8)',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-body)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Something went wrong in {this.props.moduleName}. Other modules are unaffected.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-body)',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
