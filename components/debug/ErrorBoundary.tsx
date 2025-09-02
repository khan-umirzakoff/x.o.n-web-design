/**
 * Error Boundary for Three.js Components
 * Catches and displays errors in the interactive 3D logo
 */

import { Component, ErrorInfo, ReactNode } from 'react';

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

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 Three.js Error Boundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            this.logErrorToService(error, errorInfo);
        }
    }

    private logErrorToService(error: Error, errorInfo: ErrorInfo) {
        // In production, send to error tracking service like Sentry
        console.log('📊 Logging error to service:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex items-center justify-center min-h-screen bg-black text-white">
                    <div className="max-w-md p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="text-2xl mr-3">🚨</div>
                            <h2 className="text-xl font-bold">3D Logo Error</h2>
                        </div>
                        
                        <p className="text-gray-300 mb-4">
                            The interactive 3D logo encountered an error and couldn't load properly.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                                    Show Error Details
                                </summary>
                                <div className="mt-2 p-3 bg-black/50 rounded text-xs font-mono overflow-auto max-h-40">
                                    <div className="text-red-400 mb-2">
                                        {this.state.error.message}
                                    </div>
                                    <div className="text-gray-500">
                                        {this.state.error.stack}
                                    </div>
                                </div>
                            </details>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                                Try Again
                            </button>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">
                            If this problem persists, try refreshing the page or using a different browser.
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;