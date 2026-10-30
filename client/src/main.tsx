/**
 * Standalone entry. The hosted build is wrapped by the Miaoda AppContainer
 * (identity, tenant, observability); here only the two things the UI needs are
 * provided: a react-query client and a router basename.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import RoutesComponent from './app';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

interface BoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the message in the console; there is no platform logger here.
    console.error('Render error', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] px-6">
        <div className="w-full max-w-[560px] rounded-xl border border-[#eaecf0] bg-white px-6 py-6">
          <h1 className="text-[16px] font-bold text-[#101828]">The page could not be rendered</h1>
          <p className="mt-2 break-words text-[12.5px] leading-relaxed text-[#667085]">
            {error.message || 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#3b7bfa] px-3.5 py-2 text-[12.5px] font-semibold text-white"
          >
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}

const BASE_PATH = import.meta.env.BASE_URL || '/';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASE_PATH}>
        <RoutesComponent />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>,
);
