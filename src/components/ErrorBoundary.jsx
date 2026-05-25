import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto p-6 md:p-10 mt-10 bg-surface border rounded-2xl md:rounded-[2rem] text-center shadow-lg">
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 rounded-2xl md:rounded-3xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠</span>
          </div>
          <h3 className="text-text font-black text-xl md:text-2xl tracking-tighter mb-3">Something went wrong</h3>
          <p className="text-text-muted text-sm mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl bg-primary hover:bg-primary-hover px-5 md:px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
