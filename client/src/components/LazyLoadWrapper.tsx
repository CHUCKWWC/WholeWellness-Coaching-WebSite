import { Suspense, ComponentType, lazy, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  onError?: (error: Error) => void;
  loadingText?: string;
}

// Enhanced loading component with better UX
const EnhancedLoadingSpinner = ({ loadingText = "Loading..." }: { loadingText?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <LoadingSpinner />
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {loadingText}
    </div>
    <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 p-6">
    <div className="text-red-500 text-xl">⚠️</div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Something went wrong
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
      We encountered an error while loading this section. Please try again.
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Main lazy load wrapper component
export const LazyLoadWrapper = ({ 
  children, 
  fallback: CustomFallback, 
  onError, 
  loadingText 
}: LazyLoadWrapperProps) => {
  const Fallback = CustomFallback || (() => <EnhancedLoadingSpinner loadingText={loadingText} />);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={onError}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingText?: string,
  preload?: boolean
) {
  const LazyComponent = lazy(importFunc);
  
  // Preload component if needed
  if (preload) {
    importFunc();
  }

  return function LazyLoadedComponent(props: any) {
    return (
      <LazyLoadWrapper loadingText={loadingText}>
        <LazyComponent {...props} />
      </LazyLoadWrapper>
    );
  };
}

// Hook for preloading components on user interaction
export function usePreloadComponent(importFunc: () => Promise<any>) {
  const [preloaded, setPreloaded] = useState(false);

  const preload = () => {
    if (!preloaded) {
      importFunc();
      setPreloaded(true);
    }
  };

  return { preload, preloaded };
}

// Component for intersection-based lazy loading
export function IntersectionLazyLoad({ 
  children, 
  rootMargin = "100px",
  threshold = 0.1 
}: {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return (
    <div ref={setRef}>
      {isVisible ? children : (
        <div className="h-32 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
}

export default LazyLoadWrapper;