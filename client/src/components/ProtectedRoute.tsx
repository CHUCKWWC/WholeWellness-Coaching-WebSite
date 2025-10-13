import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'coach' | 'admin' | 'super_admin';
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    // Check role if specified
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
      }
    }
  }, [isAuthenticated, isLoading, role, requiredRole, requireAuth, setLocation]);

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show nothing if role doesn't match (will redirect)
  if (requiredRole && role !== requiredRole && role !== 'admin' && role !== 'super_admin') {
    return null;
  }

  return <>{children}</>;
}
