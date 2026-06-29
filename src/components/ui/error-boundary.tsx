'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props { fallback?: React.ReactNode; children: React.ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Alert variant="destructive">
            <AlertTitle>Ops!</AlertTitle>
            <AlertDescription>
              Algo deu errado ao carregar esta seção. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        )
      )
    }
    return this.props.children
  }
}
