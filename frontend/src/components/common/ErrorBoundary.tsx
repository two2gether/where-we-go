import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send error to monitoring service if enabled
    if (import.meta.env.VITE_ENABLE_SENTRY === 'true') {
      // Sentry error reporting would go here
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              앗! 뭔가 잘못됐어요
            </h1>
            <p className="text-gray-600 mb-6">
              페이지를 로드하는 중 오류가 발생했습니다.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-base btn-primary btn-md mr-3"
              >
                페이지 새로고침
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-base btn-secondary btn-md"
              >
                다시 시도
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  오류 세부정보 (개발 모드)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}