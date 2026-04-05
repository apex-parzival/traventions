"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black mb-4 italic tracking-tight text-white">Something went wrong</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this section. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg"
            >
              <RotateCcw size={18} />
              Reload Application
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-6 p-4 bg-black/50 rounded-lg text-left text-xs text-red-400 overflow-auto max-h-40 font-mono">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
