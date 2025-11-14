import ProtectedRoute from '@/components/ProtectedRoute';
import { LazyLoadWrapper } from '@/components/LazyLoadWrapper';
import { getRoutePolicy } from '@/config/routeAccessPolicy';

/**
 * RouteHelpers - Utilities for standardized route rendering and protection
 * 
 * This module provides helper functions to systematically apply route protection,
 * lazy loading, and layout wrapping to routes without manual per-route configuration.
 * 
 * Key Benefits:
 * - Consistent route protection across the application
 * - Automatic policy application from centralized routeAccessPolicy
 * - Simplified route definitions with declarative configuration
 * - Built-in lazy loading support
 * - Layout composition without manual wrapping
 * 
 * Usage:
 * Define routes declaratively and use renderRoute() to automatically apply
 * protection, lazy loading, and layouts based on the route definition.
 */

/**
 * RouteDefinition - Declarative configuration for a single route
 * 
 * This interface defines all the properties needed to render a route with
 * automatic protection, lazy loading, and layout application.
 * 
 * @example
 * const dashboardRoute: RouteDefinition = {
 *   path: '/member-dashboard',
 *   component: MemberDashboard,
 *   layout: MemberLayout,
 *   isLazy: true,
 *   loadingText: 'Loading your dashboard...'
 * };
 * 
 * // In your router
 * <Route path={dashboardRoute.path}>
 *   {renderRoute(dashboardRoute)}
 * </Route>
 */
export interface RouteDefinition {
  /** The URL path for this route (e.g., '/member-dashboard', '/coach/clients') */
  path: string;
  
  /** The React component to render for this route */
  component: React.ComponentType<any>;
  
  /** Optional layout component to wrap around the route component */
  layout?: React.ComponentType<{ children: React.ReactNode }>;
  
  /** Loading message to display while lazy loading (only used if isLazy is true) */
  loadingText?: string;
  
  /** Whether to wrap the component in LazyLoadWrapper for code splitting */
  isLazy?: boolean;
}

/**
 * renderRoute - Automatically render a route with protection, lazy loading, and layouts
 * 
 * This is the main helper function that takes a RouteDefinition and returns a fully
 * configured React element with all the necessary wrappers applied in the correct order:
 * 
 * 1. Base component (optionally wrapped in LazyLoadWrapper)
 * 2. Layout wrapper (if specified)
 * 3. ProtectedRoute wrapper (if route policy requires authentication)
 * 
 * The function automatically looks up the route's access policy and applies protection
 * if needed, eliminating the need to manually wrap each route in ProtectedRoute.
 * 
 * @param def - RouteDefinition object describing the route configuration
 * @returns JSX.Element with all appropriate wrappers applied
 * 
 * @example
 * // Simple public route
 * const homeRoute: RouteDefinition = {
 *   path: '/',
 *   component: Home
 * };
 * <Route path={homeRoute.path}>{renderRoute(homeRoute)}</Route>
 * 
 * @example
 * // Protected route with lazy loading and layout
 * const coachDashboardRoute: RouteDefinition = {
 *   path: '/coach/dashboard',
 *   component: CoachDashboard,
 *   layout: CoachLayout,
 *   isLazy: true,
 *   loadingText: 'Loading coach dashboard...'
 * };
 * <Route path={coachDashboardRoute.path}>{renderRoute(coachDashboardRoute)}</Route>
 * 
 * @example
 * // Admin route with automatic role-based protection
 * const adminRoute: RouteDefinition = {
 *   path: '/admin-dashboard',
 *   component: AdminDashboard,
 *   isLazy: true
 * };
 * // Automatically applies admin-only protection based on routeAccessPolicy
 * <Route path={adminRoute.path}>{renderRoute(adminRoute)}</Route>
 */
export function renderRoute(def: RouteDefinition): JSX.Element {
  // Look up the access policy for this route path
  // This determines if authentication/authorization is required
  const policy = getRoutePolicy(def.path);
  const Component = def.component;
  
  // Step 1: Create base component, optionally wrapped in lazy loading
  // If isLazy is true, wrap in LazyLoadWrapper for code splitting and loading UI
  let element: JSX.Element = def.isLazy ? (
    <LazyLoadWrapper loadingText={def.loadingText}>
      <Component />
    </LazyLoadWrapper>
  ) : (
    <Component />
  );
  
  // Step 2: Wrap in layout if specified
  // Layouts provide consistent chrome (navigation, sidebars) around route content
  if (def.layout) {
    const Layout = def.layout;
    element = <Layout>{element}</Layout>;
  }
  
  // Step 3: Apply route protection if the policy requires authentication
  // This automatically wraps protected routes in ProtectedRoute based on policy
  if (policy?.authRequired) {
    element = (
      <ProtectedRoute 
        requireAuth={true}
        requiredRole={policy.allowedRoles?.[0] as 'user' | 'coach' | 'admin' | 'super_admin'}
      >
        {element}
      </ProtectedRoute>
    );
  }
  
  return element;
}

/**
 * createRouteDefinition - Factory function for creating RouteDefinition objects
 * 
 * This helper provides a type-safe way to create route definitions with
 * sensible defaults and validation.
 * 
 * @param config - Partial RouteDefinition with required path and component
 * @returns Complete RouteDefinition with defaults applied
 * 
 * @example
 * const routes = [
 *   createRouteDefinition({
 *     path: '/dashboard',
 *     component: Dashboard,
 *     layout: MemberLayout,
 *     isLazy: true,
 *     loadingText: 'Loading dashboard...'
 *   }),
 *   createRouteDefinition({
 *     path: '/about',
 *     component: About
 *   })
 * ];
 */
export function createRouteDefinition(
  config: Pick<RouteDefinition, 'path' | 'component'> & Partial<Omit<RouteDefinition, 'path' | 'component'>>
): RouteDefinition {
  return {
    path: config.path,
    component: config.component,
    layout: config.layout,
    loadingText: config.loadingText,
    isLazy: config.isLazy ?? false
  };
}

/**
 * batchRenderRoutes - Render multiple routes with consistent configuration
 * 
 * This utility function allows you to render multiple routes with the same
 * layout or lazy loading configuration, reducing boilerplate code.
 * 
 * @param routes - Array of route definitions
 * @param commonConfig - Common configuration to apply to all routes
 * @returns Array of rendered route elements
 * 
 * @example
 * const memberRoutes = batchRenderRoutes(
 *   [
 *     { path: '/dashboard', component: Dashboard },
 *     { path: '/profile', component: Profile },
 *     { path: '/settings', component: Settings }
 *   ],
 *   { layout: MemberLayout, isLazy: true }
 * );
 * 
 * // In router
 * {memberRoutes.map(({ path, element }) => (
 *   <Route key={path} path={path}>{element}</Route>
 * ))}
 */
export function batchRenderRoutes(
  routes: Array<Pick<RouteDefinition, 'path' | 'component'>>,
  commonConfig?: Partial<Omit<RouteDefinition, 'path' | 'component'>>
): Array<{ path: string; element: JSX.Element }> {
  return routes.map(route => ({
    path: route.path,
    element: renderRoute({
      ...route,
      ...commonConfig
    })
  }));
}
