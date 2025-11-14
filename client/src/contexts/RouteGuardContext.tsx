import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * RouteGuardContext - Centralized authentication state management for route protection
 * 
 * This context eliminates the need for multiple useAuth() calls across the application
 * by providing a single source of truth for authentication state. Instead of each
 * ProtectedRoute component calling useAuth() independently (which would result in
 * 60+ duplicate auth checks), we call it ONCE at the top level and share the state.
 * 
 * Benefits:
 * - Performance: Single auth check instead of 60+ duplicate calls
 * - Consistency: All components receive the same auth state simultaneously
 * - Maintainability: Centralized auth logic easier to debug and update
 * - Memory: Reduced memory footprint from duplicate query subscriptions
 * 
 * Usage:
 * 1. Wrap your app or router with <RouteGuardProvider>
 * 2. Use useRouteGuard() in ProtectedRoute or any component needing auth state
 * 3. Access isLoading, isAuthenticated, and role from the context
 * 
 * @example
 * // In App.tsx or main router component
 * <RouteGuardProvider>
 *   <Router />
 * </RouteGuardProvider>
 * 
 * // In ProtectedRoute or other components
 * const { isLoading, isAuthenticated, role } = useRouteGuard();
 */

/**
 * Interface defining the shape of authentication state provided by RouteGuardContext
 */
export interface RouteGuardContextValue {
  /** Whether the authentication check is still in progress */
  isLoading: boolean;
  
  /** Whether the user is authenticated (has a valid session) */
  isAuthenticated: boolean;
  
  /** The user's role - determines route access permissions */
  role: 'guest' | 'user' | 'coach' | 'admin' | 'super_admin';
}

/**
 * React context for sharing authentication state across the application
 * Initialized as undefined to enable proper error handling when used outside provider
 */
const RouteGuardContext = createContext<RouteGuardContextValue | undefined>(undefined);

/**
 * RouteGuardProvider - Top-level provider component for route authentication
 * 
 * This component calls useAuth() ONCE and distributes the auth state to all
 * child components through React Context. This eliminates the performance
 * overhead of multiple auth queries running simultaneously.
 * 
 * The provider should wrap your entire routing system to ensure all
 * ProtectedRoute components have access to the shared auth state.
 * 
 * @param children - The application component tree that needs access to auth state
 * 
 * @example
 * <QueryClientProvider client={queryClient}>
 *   <RouteGuardProvider>
 *     <App />
 *   </RouteGuardProvider>
 * </QueryClientProvider>
 */
export function RouteGuardProvider({ children }: { children: React.ReactNode }) {
  // Single useAuth() call for the entire application
  // This replaces 60+ duplicate calls across ProtectedRoute components
  const { isLoading, isAuthenticated, role } = useAuth();
  
  // Provide a normalized role value, defaulting to 'guest' for unauthenticated users
  // This ensures consumers always receive a valid role type
  const normalizedRole: RouteGuardContextValue['role'] = 
    (role as RouteGuardContextValue['role']) || 'guest';
  
  return (
    <RouteGuardContext.Provider 
      value={{ 
        isLoading, 
        isAuthenticated, 
        role: normalizedRole 
      }}
    >
      {children}
    </RouteGuardContext.Provider>
  );
}

/**
 * useRouteGuard - Hook to access centralized authentication state
 * 
 * This hook provides access to the shared authentication state from RouteGuardContext.
 * It replaces individual useAuth() calls in ProtectedRoute components, eliminating
 * duplicate auth checks and improving performance.
 * 
 * The hook includes error handling to ensure it's only used within a RouteGuardProvider,
 * preventing runtime errors from accessing undefined context.
 * 
 * @returns RouteGuardContextValue containing isLoading, isAuthenticated, and role
 * @throws Error if used outside of RouteGuardProvider
 * 
 * @example
 * function ProtectedRoute({ children }) {
 *   const { isLoading, isAuthenticated, role } = useRouteGuard();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *   
 *   return <>{children}</>;
 * }
 */
export function useRouteGuard(): RouteGuardContextValue {
  const context = useContext(RouteGuardContext);
  
  if (!context) {
    throw new Error(
      'useRouteGuard must be used within RouteGuardProvider. ' +
      'Wrap your application with <RouteGuardProvider> to enable route protection.'
    );
  }
  
  return context;
}
