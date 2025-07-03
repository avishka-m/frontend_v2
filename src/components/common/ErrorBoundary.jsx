import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4 mt-10">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-900">Something went wrong</h3>
            <p className="text-gray-500 mt-2">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.props.showDetails && this.state.error && (
              <details className="mt-4 text-left bg-gray-50 p-4 rounded text-sm">
                <summary className="cursor-pointer text-red-600 font-medium">Error Details</summary>
                <p className="mt-2">{this.state.error.toString()}</p>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;