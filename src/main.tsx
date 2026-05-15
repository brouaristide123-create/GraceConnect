import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null; resetKey: number }
> {
  state = { error: null, resetKey: 0 };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    const isDom = error instanceof TypeError && (
      error.message.includes('removeChild') || error.message.includes('insertBefore')
    );
    if (isDom) setTimeout(() => this.setState(s => ({ error: null, resetKey: s.resetKey + 1 })), 100);
  }
  handleReset = () => this.setState(s => ({ error: null, resetKey: s.resetKey + 1 }));
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, fontFamily: 'sans-serif', background: '#f8fafc' }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Une erreur s'est produite</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{err.message}</p>
          <button onClick={this.handleReset} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}>🔄 Réessayer</button>
        </div>
      );
    }
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
