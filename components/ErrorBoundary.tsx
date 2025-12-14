import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 text-center">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-red-900/50 max-w-md w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="bg-red-900/20 p-4 rounded-full">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6 text-sm">
              The application encountered an unexpected error. This might be due to a connection issue or data overload.
            </p>
            <div className="bg-black/40 p-3 rounded text-left mb-6 overflow-hidden">
               <code className="text-xs text-red-400 block truncate">
                 {this.state.error?.message}
               </code>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={18} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}