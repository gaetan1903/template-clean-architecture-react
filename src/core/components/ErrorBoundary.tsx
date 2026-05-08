import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@heroui/react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
                    <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm mb-6 max-w-md w-full">
                        {this.state.error?.message || 'Erreur inattendue'}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="primary" onPress={this.handleReset}>
                            Reessayer
                        </Button>
                        <Button variant="outline" onPress={() => { window.location.href = '/'; }}>
                            Retour a l'accueil
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
