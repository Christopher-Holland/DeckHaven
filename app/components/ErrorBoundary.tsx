"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/app/lib/logger";

type Props = {
    children: ReactNode;
    /** Optional custom fallback UI. Receives error, resetError. */
    fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = {
    error: Error | null;
};

/**
 * React Error Boundary. Catches JavaScript errors in the child tree and
 * renders a fallback UI so a single component crash does not take down the app.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    reset = (): void => {
        this.setState({ error: null });
    };

    render(): ReactNode {
        const { error } = this.state;
        const { children, fallback } = this.props;

        if (error) {
            if (typeof fallback === "function") {
                return fallback(error, this.reset);
            }
            return <DefaultErrorFallback error={error} onRetry={this.reset} />;
        }

        return children;
    }
}

function DefaultErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
    return (
        <div
            className="min-h-[40vh] flex flex-col items-center justify-center px-6 py-12 text-center"
            style={{
                backgroundColor: "var(--theme-bg)",
                color: "var(--theme-fg)",
            }}
        >
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm opacity-80 max-w-md mb-6">
                An error occurred while rendering this page. You can try again or go back.
            </p>
            {process.env.NODE_ENV === "development" && (
                <pre className="text-left text-xs opacity-60 bg-black/10 dark:bg-white/10 p-4 rounded mb-6 max-w-2xl overflow-auto">
                    {error.message}
                </pre>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
                <button
                    type="button"
                    onClick={onRetry}
                    className="px-4 py-2 rounded-md text-sm font-medium border border-[var(--theme-border)] bg-[var(--theme-accent)] text-white hover:opacity-90 transition-opacity"
                >
                    Try again
                </button>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 rounded-md text-sm font-medium border border-[var(--theme-border)] bg-[var(--theme-sidebar)] hover:opacity-90 transition-opacity"
                >
                    Go back
                </button>
            </div>
        </div>
    );
}
