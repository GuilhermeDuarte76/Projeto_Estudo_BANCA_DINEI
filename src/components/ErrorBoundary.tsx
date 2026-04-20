import { Component, type ReactNode } from 'react'
import { CrownIcon } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-dark-warm flex flex-col items-center justify-center gap-6 px-4">
        <CrownIcon size={48} className="text-gold-primary/30" />
        <h1 className="font-display text-cream text-2xl text-center">Algo deu errado</h1>
        <p className="text-cream/50 text-center max-w-sm text-sm">
          Recarregue a página ou volte ao início.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full transition-all duration-300 hover:shadow-gold"
          >
            Recarregar
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-gold-primary/40 text-gold-primary hover:border-gold-primary transition-colors"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    )
  }
}
