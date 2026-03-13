import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
          }
        }
      } catch (e) {
        // Not a JSON error message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-[32px] p-8 text-center backdrop-blur-xl shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight">SYSTEM GLITCH</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {isFirestoreError ? "We encountered a permission or data issue." : "Something went wrong in Questoria."}
              <br />
              <span className="text-xs text-slate-600 mt-2 block font-mono break-all">{errorMessage}</span>
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all hover:scale-105"
            >
              <RefreshCw size={20} /> REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
