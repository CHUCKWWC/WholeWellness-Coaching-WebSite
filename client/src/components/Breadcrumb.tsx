import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn("flex items-center space-x-2 text-sm text-gray-600 mb-6", className)}
      aria-label="Breadcrumb"
      data-testid="breadcrumb"
    >
      <Link href="/">
        <button className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </button>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href}>
              <button className="hover:text-blue-600 transition-colors">
                {item.label}
              </button>
            </Link>
          ) : (
            <span 
              className={cn(
                "font-medium",
                index === items.length - 1 ? "text-gray-900" : "text-gray-600"
              )}
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper hook to generate breadcrumbs based on current route
export function useBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Route-specific breadcrumb configurations
  const routeMap: Record<string, BreadcrumbItem[]> = {
    '/member-dashboard': [{ label: 'Dashboard' }],
    '/coach-dashboard': [{ label: 'Coach Dashboard' }],
    '/admin-dashboard': [{ label: 'Admin Dashboard' }],
    '/ai-coaching': [{ label: 'AI Coaching' }],
    '/wellness-journey': [{ label: 'Wellness Journey' }],
    '/assessments': [{ label: 'Assessments' }],
    '/events': [{ label: 'Events' }],
    '/resources': [{ label: 'Resources' }],
    '/donate': [{ label: 'Support Us' }],
    '/coach-certifications': [{ label: 'Certification Courses' }],
    '/user-profile': [{ label: 'Profile' }],
    '/settings': [{ label: 'Settings' }],
    '/wix-booking': [{ label: 'Book Appointment' }],
    '/mental-wellness': [{ label: 'Mental Wellness Hub' }],
    '/personalized-recommendations': [{ label: 'Personal Recommendations' }],
  };
  
  // Check for exact matches first
  if (routeMap[currentPath]) {
    return routeMap[currentPath];
  }
  
  // Handle dynamic routes
  if (currentPath.startsWith('/assessments/take/')) {
    return [
      { label: 'Assessments', href: '/assessments' },
      { label: 'Take Assessment' }
    ];
  }
  
  if (currentPath.startsWith('/assessments/results/')) {
    return [
      { label: 'Assessments', href: '/assessments' },
      { label: 'Results' }
    ];
  }
  
  if (currentPath.startsWith('/events/')) {
    return [
      { label: 'Events', href: '/events' },
      { label: 'Event Details' }
    ];
  }
  
  if (currentPath.startsWith('/coach/')) {
    const section = pathSegments[1];
    return [
      { label: 'Coach Dashboard', href: '/coach-dashboard' },
      { label: formatLabel(section) }
    ];
  }
  
  if (currentPath.startsWith('/session/')) {
    return [{ label: 'Video Session' }];
  }
  
  if (currentPath.startsWith('/user/')) {
    return [{ label: 'User Profile' }];
  }
  
  // Default: generate from path segments
  return pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    return {
      label: formatLabel(segment),
      href: isLast ? undefined : href
    };
  });
}

function formatLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
