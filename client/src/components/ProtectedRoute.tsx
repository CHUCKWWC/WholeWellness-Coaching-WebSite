import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRouteGuard } from "@/contexts/RouteGuardContext";
import { canAccessRoute, UserRole } from "@/config/routeAccessPolicy";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'coach' | 'admin' | 'super_admin';
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that enforces route access policies
 * 
 * This component uses the centralized RouteGuardContext to access shared
 * authentication state instead of calling useAuth() directly. This eliminates
 * duplicate auth checks across the application and improves performance.
 * 
 * The component uses the centralized route access policy configuration
 * to determine whether a user can access a specific route. It handles:
 * - Authentication checks via shared RouteGuardContext
 * - Role-based authorization
 * - Automatic redirects for unauthorized access
 * - Loading states during authentication
 * - Permission denied UI for role mismatches
 * 
 * Note: This component must be used within a RouteGuardProvider to access
 * the shared authentication state.
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useRouteGuard();
  const [location, setLocation] = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Get user's effective role (default to 'guest' if not authenticated)
  const userRole: UserRole = role as UserRole || 'guest';

  // CRITICAL: All useEffect hooks MUST be at top level (React Rules of Hooks)
  // Handle redirects in a single useEffect based on authorization status
  // NOTE: location is NOT in dependency array to prevent redirect loops
  useEffect(() => {
    // Don't redirect while auth is loading
    if (isLoading) return;
    
    // Don't redirect if we already triggered a redirect
    if (hasRedirected) return;

    // Priority 1: Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      setHasRedirected(true);
      setLocation('/login');
      return;
    }

    // Priority 2: Check if specific role is required
    if (requiredRole && isAuthenticated) {
      const isAdmin = role === 'admin' || role === 'super_admin';
      
      if (!isAdmin && role !== requiredRole) {
        // Redirect to appropriate dashboard
        setHasRedirected(true);
        if (role === 'coach') {
          setLocation('/coach-dashboard');
        } else {
          setLocation('/member-dashboard');
        }
        return;
      }
    }

    // Priority 3: Check centralized route policy
    // Compute policy inside effect to avoid recalculation on every render
    const accessResult = canAccessRoute(location, isAuthenticated, userRole);
    if (!accessResult.allowed && accessResult.redirectTo) {
      setHasRedirected(true);
      setLocation(accessResult.redirectTo);
      return;
    }
  }, [isLoading, isAuthenticated, requireAuth, requiredRole, role, setLocation, hasRedirected, userRole]);

  // CRITICAL: Show loading state while auth is being checked
  // This prevents content flash before redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Block rendering if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Block rendering if specific role is required but user doesn't have it
  if (requiredRole && isAuthenticated) {
    const isAdmin = role === 'admin' || role === 'super_admin';
    
    if (!isAdmin && role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // Block rendering if route policy denies access
  // Compute policy before rendering to prevent unauthorized content flash
  const accessResult = canAccessRoute(location, isAuthenticated, userRole);
  
  if (!accessResult.allowed) {
    if (accessResult.redirectTo) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    } else {
      // Show permission denied message (no redirect specified)
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <ShieldX className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // All checks passed - render protected content
  return <>{children}</>;
}
