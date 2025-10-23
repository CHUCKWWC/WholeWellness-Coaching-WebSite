// @ts-nocheck
import { useCallback } from 'react';

// Route preloader utility for performance optimization
interface RoutePreloader {
  preloadRoute: (routeName: string) => void;
  preloadOnHover: (routeName: string) => (event: MouseEvent) => void;
  preloadOnFocus: (routeName: string) => (event: FocusEvent) => void;
  preloadCriticalRoutes: () => void;
}

// Route import functions map
const routeImports: Record<string, () => Promise<any>> = {
  // High-priority routes (user frequently visits)
  'aicoaching': () => import('@/pages/AICoaching'),
  'members': () => import('@/pages/Members'),
  'memberportal': () => import('@/pages/MemberPortal'),
  'donate': () => import('@/pages/Donate'),
  
  // Medium-priority routes
  'programs': () => import('@/pages/Programs'),
  'resources': () => import('@/pages/Resources'),
  'booking': () => import('@/pages/Booking'),
  'assessments': () => import('@/pages/assessments'),
  
  // Admin routes (loaded on demand)
  'admin': () => import('@/pages/Admin'),
  'admindashboard': () => import('@/pages/AdminDashboard'),
  'adminlogin': () => import('@/pages/AdminLogin'),
  'adminsecurity': () => import('@/pages/AdminSecurity'),
  'admincoupons': () => import('@/pages/AdminCoupons'),
  'admincertifications': () => import('@/pages/AdminCertifications'),
  'admintestpayment': () => import('@/pages/AdminTestPayment'),
  
  // Coach routes
  'coachdashboard': () => import('@/pages/CoachDashboard'),
  'coachportal': () => import('@/pages/CoachPortal'),
  'coachlogin': () => import('@/pages/CoachLogin'),
  'coachsignup': () => import('@/pages/CoachSignup'),
  'coachprofile': () => import('@/pages/CoachProfile'),
  'coachonboarding': () => import('@/pages/CoachOnboarding'),
  'coachcertifications': () => import('@/pages/CoachCertifications'),
  
  // Onboarding and user flow
  'onboardingwizard': () => import('@/pages/OnboardingWizard'),
  'digitalOnboarding': () => import('@/pages/DigitalOnboarding'),
  'enhancedonboarding': () => import('@/pages/EnhancedOnboarding'),
  'userprofile': () => import('@/pages/UserProfile'),
  
  // Payment and subscription
  'checkout': () => import('@/pages/Checkout'),
  'subscribe': () => import('@/pages/Subscribe'),
  'paymentsuccess': () => import('@/pages/PaymentSuccess'),
  'subscriptionsuccess': () => import('@/pages/SubscriptionSuccess'),
  
  // Content and learning
  'certificationdashboard': () => import('@/pages/CertificationDashboard'),
  'modulelearning': () => import('@/pages/ModuleLearning'),
  'certificationguide': () => import('@/pages/CertificationGuide'),
  'wellnessjourneyrecommender': () => import('@/pages/WellnessJourneyRecommender'),
  
  // Other routes
  'impact': () => import('@/pages/Impact'),
  'cms': () => import('@/pages/CMS'),
  'weightlossintake': () => import('@/pages/WeightLossIntake'),
  'donationportal': () => import('@/pages/DonationPortal'),
  'privacy': () => import('@/pages/Privacy'),
  'terms': () => import('@/pages/Terms'),
  'passwordreset': () => import('@/pages/PasswordReset'),
  'emailverification': () => import('@/pages/EmailVerification'),
  'helpdemo': () => import('@/pages/HelpDemo'),
  'mentalwellnesshub': () => import('@/pages/MentalWellnessHub'),
  'personalizedrecommendations': () => import('@/pages/PersonalizedRecommendations'),
  'volunteerapplication': () => import('@/pages/VolunteerApplication'),
  'wixbooking': () => import('@/pages/WixBooking'),
};

// Critical routes that should be preloaded immediately
const criticalRoutes = ['aicoaching', 'members', 'memberportal', 'donate'];

// Routes to preload when user hovers over navigation
const navigationRoutes = ['programs', 'resources', 'booking', 'assessments'];

class RoutePreloaderService implements RoutePreloader {
  private preloadedRoutes = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  preloadRoute(routeName: string): void {
    const normalizedRoute = routeName.toLowerCase();
    
    if (this.preloadedRoutes.has(normalizedRoute)) {
      return; // Already preloaded
    }

    const importFunc = routeImports[normalizedRoute];
    if (!importFunc) {
      console.warn(`Route preloader: Unknown route "${routeName}"`);
      return;
    }

    // Create promise if it doesn't exist
    if (!this.preloadPromises.has(normalizedRoute)) {
      this.preloadPromises.set(normalizedRoute, importFunc());
    }

    // Mark as preloaded when promise resolves
    this.preloadPromises.get(normalizedRoute)!
      .then(() => {
        this.preloadedRoutes.add(normalizedRoute);
        console.debug(`Route preloaded: ${routeName}`);
      })
      .catch((error) => {
        console.error(`Failed to preload route ${routeName}:`, error);
        this.preloadPromises.delete(normalizedRoute);
      });
  }

  preloadOnHover(routeName: string) {
    return (event: MouseEvent) => {
      // Preload with a small delay to avoid unnecessary preloads on quick hovers
      setTimeout(() => {
        this.preloadRoute(routeName);
      }, 100);
    };
  }

  preloadOnFocus(routeName: string) {
    return (event: FocusEvent) => {
      this.preloadRoute(routeName);
    };
  }

  preloadCriticalRoutes(): void {
    // Preload critical routes with a delay to not block initial page load
    setTimeout(() => {
      criticalRoutes.forEach(route => {
        this.preloadRoute(route);
      });
    }, 1000); // Wait 1 second after initial load
  }

  // Preload routes based on user behavior patterns
  preloadBasedOnUserRole(userRole?: string): void {
    const roleBasedRoutes: Record<string, string[]> = {
      'admin': ['admindashboard', 'adminsecurity', 'admincoupons', 'admincertifications'],
      'coach': ['coachdashboard', 'coachportal', 'coachcertifications'],
      'member': ['memberportal', 'assessments', 'personalizedrecommendations'],
      'guest': ['onboardingwizard', 'digitalOnboarding', 'donate']
    };

    const routes = roleBasedRoutes[userRole || 'guest'] || roleBasedRoutes.guest;
    routes.forEach(route => {
      this.preloadRoute(route);
    });
  }

  // Preload routes based on current location
  preloadRelatedRoutes(currentPath: string): void {
    const relatedRoutes: Record<string, string[]> = {
      '/admin': ['admindashboard', 'adminsecurity', 'admincoupons'],
      '/coach': ['coachdashboard', 'coachportal', 'coachcertifications'],
      '/member': ['memberportal', 'assessments', 'userprofile'],
      '/onboarding': ['enhancedonboarding', 'digitalOnboarding', 'userprofile'],
      '/payment': ['checkout', 'subscribe', 'donate'],
    };

    for (const [pathPrefix, routes] of Object.entries(relatedRoutes)) {
      if (currentPath.startsWith(pathPrefix)) {
        routes.forEach(route => {
          this.preloadRoute(route);
        });
        break;
      }
    }
  }

  // Get preload statistics for debugging
  getPreloadStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      preloadedRoutes: Array.from(this.preloadedRoutes),
      pendingCount: this.preloadPromises.size - this.preloadedRoutes.size,
      availableRoutes: Object.keys(routeImports).length
    };
  }
}

// Export singleton instance
export const routePreloader = new RoutePreloaderService();

// Hook for using route preloader in components
export function useRoutePreloader() {
  // Create stable references to prevent useEffect re-runs
  const preloadRoute = useCallback((routeName: string) => {
    routePreloader.preloadRoute(routeName);
  }, []);

  const preloadOnHover = useCallback((routeName: string) => {
    return routePreloader.preloadOnHover(routeName);
  }, []);

  const preloadOnFocus = useCallback((routeName: string) => {
    return routePreloader.preloadOnFocus(routeName);
  }, []);

  const preloadCriticalRoutes = useCallback(() => {
    routePreloader.preloadCriticalRoutes();
  }, []);

  const preloadBasedOnUserRole = useCallback((userRole?: string) => {
    routePreloader.preloadBasedOnUserRole(userRole);
  }, []);

  const preloadRelatedRoutes = useCallback((currentPath: string) => {
    routePreloader.preloadRelatedRoutes(currentPath);
  }, []);

  const getStats = useCallback(() => {
    return routePreloader.getPreloadStats();
  }, []);

  return {
    preloadRoute,
    preloadOnHover,
    preloadOnFocus,
    preloadCriticalRoutes,
    preloadBasedOnUserRole,
    preloadRelatedRoutes,
    getStats
  };
}

export default routePreloader;