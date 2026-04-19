import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#13131a] rounded-2xl border border-red-500/20 m-4 h-64">
          <div className="h-10 w-10 animate-pulse rounded-full bg-red-500/20 border border-red-500/50 mb-4"></div>
          <h2 className="text-xl font-bold font-['Sora'] text-white mb-2">Sync Interrupted</h2>
          <p className="text-slate-400 text-center text-sm">There was an error pulling your local state. Retrying network cache...</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
