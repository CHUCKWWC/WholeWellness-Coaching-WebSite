import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 *
 * Features:
 * - Catches React component errors
 * - Provides user-friendly error UI
 * - Logs errors for debugging
 * - Offers recovery actions
 * - Supports custom fallback UI
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something Went Wrong
              </CardTitle>
              <CardDescription className="mt-2">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">What can you do?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Try refreshing the page to see if that fixes the issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Go back to the homepage and try again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Contact our support team if the problem persists</span>
                  </li>
                </ul>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Error Message:</p>
                      <pre className="mt-1 text-xs text-red-600 bg-white p-2 rounded border border-red-200 overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Component Stack:</p>
                        <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-reload-page"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-go-home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <a
                    href="mailto:support@wholewellnesscoaching.org"
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <EnhancedErrorBoundary fallback={fallback}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
}

export default EnhancedErrorBoundary;
