import { useCallback } from 'react';
import { useRoutePreloader } from '@/utils/routePreloader';

// Hook to preload routes on hover for enhanced navigation experience
export function usePreloadHover() {
  const { preloadOnHover, preloadOnFocus } = useRoutePreloader();

  const createHoverHandler = useCallback((routeName: string) => {
    return {
      onMouseEnter: preloadOnHover(routeName),
      onFocus: preloadOnFocus(routeName)
    };
  }, [preloadOnHover, preloadOnFocus]);

  return createHoverHandler;
}

export default usePreloadHover;