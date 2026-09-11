import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in AgroSense AI:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f17',
          color: '#f8fafc',
          padding: '2rem',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: '#131c2a',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Application Error</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#059669',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              Reset Cache & Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)

