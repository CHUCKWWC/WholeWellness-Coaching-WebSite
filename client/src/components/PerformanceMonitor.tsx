import { useEffect, useState } from 'react';
import { useRoutePreloader } from '@/utils/routePreloader';

interface PerformanceMetrics {
  loadTime: number;
  routeChangeTime: number;
  memoryUsage: number;
  preloadedRoutes: string[];
  connectionType: string;
}

// Performance monitoring component for development
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getStats } = useRoutePreloader();

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      const connection = (navigator as any).connection;
      const routeStats = getStats();

      setMetrics({
        loadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
        routeChangeTime: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        memoryUsage: memory?.usedJSHeapSize || 0,
        preloadedRoutes: routeStats.preloadedRoutes,
        connectionType: connection?.effectiveType || 'unknown'
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [getStats]);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Keyboard shortcut to toggle visibility - separate useEffect to avoid dependency issues
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array since we use a function to update state

  if (process.env.NODE_ENV !== 'development' || !isVisible || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono max-w-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Performance</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Load: {(metrics.loadTime / 1000).toFixed(2)}s</div>
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        <div>Connection: {metrics.connectionType}</div>
        <div>Preloaded: {metrics.preloadedRoutes.length} routes</div>
        <div className="text-gray-400 text-xs mt-2">
          Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
}

// Hook for measuring component performance
export function usePerformanceMetrics(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

// Web Vitals monitoring
export function useWebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Log metrics after 5 seconds
    setTimeout(() => {
      console.log('Web Vitals:', {
        CLS: clsValue,
        entries: clsEntries.length
      });
    }, 5000);

    return () => observer.disconnect();
  }, []);
}

export default PerformanceMonitor;