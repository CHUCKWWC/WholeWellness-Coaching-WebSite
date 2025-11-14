/**
 * Route Access Policy Configuration
 * 
 * This file defines access control policies for all routes in the application.
 * It centralizes authentication and authorization logic to ensure consistent
 * route protection across the entire platform.
 */

export type UserRole = 'guest' | 'user' | 'coach' | 'admin' | 'super_admin';

/**
 * Interface defining access requirements for a route
 */
export interface RouteAccessPolicy {
  /** Whether authentication is required to access this route */
  authRequired: boolean;
  /** List of roles that are allowed to access this route */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users trying to access this route */
  guestRedirect?: string;
  /** Human-readable description of the route's purpose and access requirements */
  description?: string;
}

/**
 * Comprehensive route access policies for the application
 * 
 * Routes are organized by access level:
 * - Public routes: No authentication required
 * - Member routes: Require user authentication
 * - Coach routes: Require coach role
 * - Admin routes: Require admin or super_admin role
 */
export const ROUTE_ACCESS_POLICIES: Record<string, RouteAccessPolicy> = {
  // ============================================================================
  // PUBLIC ROUTES - No authentication required
  // ============================================================================
  '/': { 
    authRequired: false,
    description: 'Home page - public access'
  },
  '/about': { 
    authRequired: false,
    description: 'About page - public access'
  },
  '/services': { 
    authRequired: false,
    description: 'Services overview - public access'
  },
  '/contact': { 
    authRequired: false,
    description: 'Contact form - public access'
  },
  '/login': { 
    authRequired: false,
    description: 'Login page - public access'
  },
  '/register': { 
    authRequired: false,
    description: 'Registration page - public access'
  },
  '/ai-coaching': { 
    authRequired: false,
    description: 'AI coaching information - public access'
  },
  '/assessments': { 
    authRequired: false,
    description: 'Assessment catalog - public access'
  },
  '/coaches': { 
    authRequired: false,
    description: 'Coach directory - public access'
  },
  '/donate': { 
    authRequired: false,
    description: 'Donation page - public access'
  },
  '/resources': { 
    authRequired: false,
    description: 'Resources library - public access'
  },
  '/events': { 
    authRequired: false,
    description: 'Events listing - public access'
  },
  '/events/:eventId': { 
    authRequired: false,
    description: 'Event details - public access'
  },
  '/privacy': { 
    authRequired: false,
    description: 'Privacy policy - public access'
  },
  '/terms': { 
    authRequired: false,
    description: 'Terms of service - public access'
  },
  '/forgot-password': { 
    authRequired: false,
    description: 'Password recovery - public access'
  },
  '/reset-password': { 
    authRequired: false,
    description: 'Password reset - public access'
  },
  '/verify-email': { 
    authRequired: false,
    description: 'Email verification - public access'
  },
  '/programs': { 
    authRequired: false,
    description: 'Programs overview - public access'
  },
  '/impact': { 
    authRequired: false,
    description: 'Community impact page - public access'
  },
  '/coach-signup': { 
    authRequired: false,
    description: 'Coach signup page - public access'
  },

  // ============================================================================
  // MEMBER-ONLY ROUTES - Require authentication
  // ============================================================================
  '/member-dashboard': { 
    authRequired: true, 
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/login?redirect=/member-dashboard',
    description: 'Member dashboard - requires authentication'
  },
  '/wellness-journey': { 
    authRequired: true, 
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/login?redirect=/wellness-journey',
    description: 'Personalized wellness journey - requires authentication'
  },
  '/wellness-journey/:journeyId': { 
    authRequired: true, 
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/login?redirect=/wellness-journey',
    description: 'Specific wellness journey - requires authentication'
  },
  '/booking': { 
    authRequired: true, 
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/register?flow=booking',
    description: 'Session booking - requires authentication'
  },
  '/book': { 
    authRequired: true, 
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/register?flow=booking',
    description: 'Session booking - requires authentication'
  },
  '/user-profile': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'User profile management - requires authentication'
  },
  '/settings': { 
    authRequired: true, 
    guestRedirect: '/login',
    description: 'User settings - requires authentication'
  },
  '/onboarding': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'User onboarding flow - requires authentication'
  },
  '/onboarding-wizard': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Onboarding wizard - requires authentication'
  },
  '/enhanced-onboarding': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Enhanced onboarding experience - requires authentication'
  },
  '/digital-onboarding': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Digital onboarding - requires authentication'
  },
  '/custom-onboarding': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Custom onboarding flow - requires authentication'
  },
  '/member-portal': { 
    authRequired: true,
    allowedRoles: ['user', 'coach', 'admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Member portal - requires authentication'
  },
  '/assessments/take/:id': { 
    authRequired: true,
    guestRedirect: '/login?redirect=/assessments',
    description: 'Take assessment - requires authentication'
  },
  '/assessments/results/:id': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Assessment results - requires authentication'
  },
  '/checkout': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Payment checkout - requires authentication'
  },
  '/payment-success': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Payment confirmation - requires authentication'
  },
  '/subscribe': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Subscription management - requires authentication'
  },
  '/subscription-success': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Subscription confirmation - requires authentication'
  },
  '/session/:sessionId': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Video session - requires authentication'
  },
  '/session/:sessionId/join': { 
    authRequired: true,
    guestRedirect: '/login',
    description: 'Join video session - requires authentication'
  },

  // ============================================================================
  // COACH-ONLY ROUTES - Require coach, admin, or super_admin role
  // ============================================================================
  '/coach-dashboard': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/login?role=coach',
    description: 'Coach dashboard - requires coach role'
  },
  '/coach-profile': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach profile management - requires coach role'
  },
  '/coach/dashboard': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach dashboard - requires coach role'
  },
  '/coach/clients': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach client management - requires coach role'
  },
  '/coach/schedule': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach schedule management - requires coach role'
  },
  '/coach/assessments': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach assessment tools - requires coach role'
  },
  '/coach-portal': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach portal - requires coach role'
  },
  '/coach-availability': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach availability management - requires coach role'
  },
  '/coach-onboarding': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach onboarding - requires coach role'
  },
  '/coach-certifications': { 
    authRequired: true, 
    allowedRoles: ['coach', 'admin', 'super_admin'],
    guestRedirect: '/coach-signup',
    description: 'Coach certification management - requires coach role'
  },

  // ============================================================================
  // ADMIN-ONLY ROUTES - Require admin or super_admin role
  // ============================================================================
  '/admin-dashboard': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Admin dashboard - requires admin role'
  },
  '/admin-certifications': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Admin certification management - requires admin role'
  },
  '/admin-crisis-alerts': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Admin crisis alert management - requires admin role'
  },
  '/admin-coupons': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Admin coupon management - requires admin role'
  },
  '/admin': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Admin panel - requires admin role'
  },
  '/cms': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Content management system - requires admin role'
  },
  '/admin/test-payment': { 
    authRequired: true, 
    allowedRoles: ['admin', 'super_admin'],
    guestRedirect: '/login',
    description: 'Payment testing - requires admin role'
  },

  // ============================================================================
  // SUPER ADMIN-ONLY ROUTES - Require super_admin role
  // ============================================================================
  '/admin-security': { 
    authRequired: true, 
    allowedRoles: ['super_admin'],
    guestRedirect: '/login',
    description: 'Security settings - requires super admin role'
  },
};

/**
 * Result of route access check
 */
export interface RouteAccessResult {
  /** Whether access is allowed */
  allowed: boolean;
  /** Where to redirect if access is denied */
  redirectTo?: string;
  /** Reason for denial (for debugging/logging) */
  reason?: string;
}

/**
 * Helper function to match dynamic route patterns
 * Converts route patterns like /events/:eventId to match actual paths like /events/123
 * 
 * @param pattern - Route pattern with optional :param segments
 * @param path - Actual path to match against
 * @returns Whether the path matches the pattern
 */
function matchesRoutePattern(pattern: string, path: string): boolean {
  // Exact match is always valid
  if (pattern === path) return true;
  
  // Convert pattern to regex (e.g., /events/:eventId -> /events/[^/]+)
  const patternRegex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$'
  );
  
  return patternRegex.test(path);
}

/**
 * Find the access policy for a given path, handling dynamic route segments
 * 
 * @param path - The route path to find a policy for
 * @returns The matching RouteAccessPolicy or a default public policy
 */
function findPolicyForPath(path: string): RouteAccessPolicy {
  // Check for exact match first
  if (ROUTE_ACCESS_POLICIES[path]) {
    return ROUTE_ACCESS_POLICIES[path];
  }
  
  // Check for pattern matches (e.g., /events/:eventId)
  for (const [pattern, policy] of Object.entries(ROUTE_ACCESS_POLICIES)) {
    if (matchesRoutePattern(pattern, path)) {
      return policy;
    }
  }
  
  // Default: public route (no authentication required)
  return { authRequired: false };
}

/**
 * Check if a user can access a specific route
 * 
 * This is the main function used by ProtectedRoute and other components
 * to determine route access permissions.
 * 
 * @param path - The route path being accessed
 * @param isAuthenticated - Whether the user is authenticated
 * @param userRole - The user's role (defaults to 'guest' if not provided)
 * @returns RouteAccessResult indicating whether access is allowed and where to redirect if denied
 */
export function canAccessRoute(
  path: string, 
  isAuthenticated: boolean, 
  userRole?: UserRole
): RouteAccessResult {
  const effectiveRole: UserRole = userRole || 'guest';
  const policy = findPolicyForPath(path);
  
  // Check authentication requirement
  if (policy.authRequired && !isAuthenticated) {
    return { 
      allowed: false, 
      redirectTo: policy.guestRedirect || '/login',
      reason: 'Authentication required'
    };
  }
  
  // Check role requirement
  if (policy.allowedRoles && policy.allowedRoles.length > 0) {
    if (!policy.allowedRoles.includes(effectiveRole)) {
      // User doesn't have the required role
      return { 
        allowed: false, 
        redirectTo: '/',
        reason: `Role '${effectiveRole}' not in allowed roles: ${policy.allowedRoles.join(', ')}`
      };
    }
  }
  
  // Access granted
  return { allowed: true };
}

/**
 * Get the policy for a specific route (useful for debugging and documentation)
 * 
 * @param path - The route path
 * @returns The RouteAccessPolicy for the path
 */
export function getRoutePolicy(path: string): RouteAccessPolicy {
  return findPolicyForPath(path);
}
