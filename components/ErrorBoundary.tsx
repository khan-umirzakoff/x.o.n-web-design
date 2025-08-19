import { Component, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  language?: Language;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch() {
    // Xato boshqaruvi endi markazlashtirilgan loggingService orqali amalga oshiriladi
    // console.error('Uncaught error:', error, errorInfo);
  }

  private getTranslation(key: string): string {
    const lang = this.props.language || 'UZB';
    // Use type assertion to safely index translations
    const translationForLang = translations[lang] as Record<string, string>;
    const translationForEng = translations['ENG'] as Record<string, string>;
    return translationForLang[key] || translationForEng[key] || key;
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0A0A10] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {this.getTranslation('errorTitle')}
            </h1>
            <p className="text-gray-400 mb-6">
              {this.getTranslation('errorMessage')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-theme-gradient text-white font-medium py-2 px-6 rounded-lg hover-glow transition-all"
            >
              {this.getTranslation('refreshPage')}
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-gray-400 cursor-pointer">
                  {this.getTranslation('errorDetails')}
                </summary>
                <pre className="mt-2 p-2 bg-gray-900 rounded text-red-400 text-xs overflow-auto">
                  {this.state.error.toString()}
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

export default ErrorBoundary;
