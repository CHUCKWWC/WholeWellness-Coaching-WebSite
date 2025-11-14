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
  const [showDeniedMessage, setShowDeniedMessage] = useState(false);

  useEffect(() => {
    // Don't check access while auth is loading
    if (isLoading) return;

    // Get user's effective role (default to 'guest' if not authenticated)
    const userRole: UserRole = role as UserRole || 'guest';
    
    // Check access using centralized policy
    const accessResult = canAccessRoute(location, isAuthenticated, userRole);

    // If access is denied, handle redirect or show error
    if (!accessResult.allowed) {
      if (accessResult.redirectTo) {
        // Redirect to login or appropriate page
        setLocation(accessResult.redirectTo);
      } else {
        // Show permission denied message (no redirect specified)
        setShowDeniedMessage(true);
      }
      return;
    }

    // Legacy compatibility: Handle requiredRole prop
    // This provides backward compatibility with existing code
    if (requiredRole && isAuthenticated) {
      // Admin and super_admin can access everything
      if (role === 'admin' || role === 'super_admin') {
        return;
      }

      // Check specific role match
      if (role !== requiredRole) {
        // Redirect to appropriate dashboard based on current role
        if (role === 'coach') {
          setLocation('/coach/dashboard');
        } else {
          setLocation('/member/dashboard');
        }
        return;
      }
    }

    // Legacy compatibility: Handle requireAuth prop
    if (requireAuth && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    // Clear any previously shown denied message
    setShowDeniedMessage(false);
  }, [isAuthenticated, isLoading, role, requiredRole, requireAuth, location, setLocation]);

  // Show loading skeleton while checking authentication
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

  // Show permission denied message if user lacks required role
  if (showDeniedMessage) {
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

  // Show loading skeleton during redirect (instead of null)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading skeleton if role doesn't match (will redirect)
  if (requiredRole && role !== requiredRole && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
