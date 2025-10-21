import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";
import { getDefaultLandingPage, type UserRole } from "@/config/navigationConfig";

interface DashboardRouterProps {
  fallbackRoute?: string;
}

/**
 * DashboardRouter automatically redirects users to their role-appropriate dashboard
 * 
 * Usage:
 * - Place on /dashboard route for automatic routing
 * - Use as a component to redirect from any page
 * - Respects onboarding status
 */
export default function DashboardRouter({ fallbackRoute = "/" }: DashboardRouterProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdminAuthenticated, adminUser, isLoading: adminLoading } = useAdminAuth();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading || adminLoading) {
      return;
    }

    // Normalize "member" role to "user" for navigation config
    const normalizeRole = (role: string | undefined): UserRole => {
      if (!role) return 'guest';
      if (role === 'member') return 'user';
      return role as UserRole;
    };

    // Determine user role
    const userRole: UserRole = isAdminAuthenticated 
      ? (adminUser?.role === 'super_admin' ? 'super_admin' : 'admin')
      : isAuthenticated 
        ? normalizeRole(user?.role)
        : 'guest';

    // Check if onboarding is complete
    const hasCompletedOnboarding = user?.hasCompletedOnboarding !== false;

    // Get the appropriate landing page
    const targetRoute = getDefaultLandingPage(userRole, hasCompletedOnboarding);

    // Redirect to the appropriate dashboard
    setLocation(targetRoute);
  }, [user, isAuthenticated, isAdminAuthenticated, adminUser, authLoading, adminLoading, setLocation, fallbackRoute]);

  // Show loading state while determining destination
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Loading your dashboard...</h2>
        <p className="text-gray-600">Taking you to the right place</p>
      </div>
    </div>
  );
}

/**
 * Helper component for conditional dashboard routing
 * Renders children if user is already on their correct dashboard,
 * otherwise redirects them
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminUser } = useAdminAuth();

  // Normalize "member" role to "user" for navigation config
  const normalizeRole = (role: string | undefined): UserRole => {
    if (!role) return 'guest';
    if (role === 'member') return 'user';
    return role as UserRole;
  };

  // Determine user role
  const userRole: UserRole = isAdminAuthenticated 
    ? (adminUser?.role === 'super_admin' ? 'super_admin' : 'admin')
    : isAuthenticated 
      ? normalizeRole(user?.role)
      : 'guest';

  const hasCompletedOnboarding = user?.hasCompletedOnboarding !== false;
  const expectedRoute = getDefaultLandingPage(userRole, hasCompletedOnboarding);

  // If user is on the correct dashboard, show children
  if (location === expectedRoute) {
    return <>{children}</>;
  }

  // Otherwise, redirect them
  return <DashboardRouter />;
}
