import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: string;
  fallbackComponent?: React.ReactNode;
  requireAuth?: boolean;
}

export default function RoleBasedAccess({
  children,
  allowedRoles = [],
  requiredRole,
  fallbackComponent,
  requireAuth = true
}: RoleBasedAccessProps) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated when required
  if (requireAuth && !user) {
    return fallbackComponent || (
      <div className="max-w-md mx-auto mt-8">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You need to be signed in to access this content.
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-2">
          <Button 
            onClick={() => setLocation('/login')}
            className="w-full"
          >
            Sign In
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation('/register')}
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (user) {
    const userRole = user.role || 'client_free';
    const hasAccess = 
      !requiredRole && allowedRoles.length === 0 || // No restrictions
      (requiredRole && userRole === requiredRole) || // Exact role match
      (allowedRoles.length > 0 && allowedRoles.includes(userRole)); // Role in allowed list

    if (!hasAccess) {
      return fallbackComponent || (
        <div className="max-w-md mx-auto mt-8">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {getAccessDeniedMessage(userRole, requiredRole || allowedRoles[0])}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => setLocation(getUpgradeRoute(userRole))}
              className="w-full"
            >
              {getUpgradeButtonText(userRole)}
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

function getAccessDeniedMessage(userRole: string, requiredRole: string): string {
  if (userRole === 'client_free' && (requiredRole === 'client_paid' || requiredRole === 'premium')) {
    return "This content is available to premium members. Upgrade your account to access advanced features.";
  }
  
  if (userRole.startsWith('client') && requiredRole === 'coach') {
    return "This content is for certified coaches only. Apply to become a coach to access coaching tools.";
  }
  
  if (requiredRole === 'admin') {
    return "This content requires administrator privileges.";
  }
  
  return `This content requires ${requiredRole} access level.`;
}

function getUpgradeRoute(userRole: string): string {
  if (userRole === 'client_free') {
    return '/subscribe';
  }
  
  if (userRole.startsWith('client')) {
    return '/coach-signup';
  }
  
  return '/contact';
}

function getUpgradeButtonText(userRole: string): string {
  if (userRole === 'client_free') {
    return "Upgrade to Premium";
  }
  
  if (userRole.startsWith('client')) {
    return "Apply to Become a Coach";
  }
  
  return "Contact Support";
}

// Role-specific access components for common use cases
export function ClientOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['client_free', 'client_paid', 'coach', 'admin']}>
      {children}
    </RoleBasedAccess>
  );
}

export function PremiumOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['client_paid', 'coach', 'admin']}>
      {children}
    </RoleBasedAccess>
  );
}

export function CoachOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['coach', 'admin']}>
      {children}
    </RoleBasedAccess>
  );
}

export function AdminOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedAccess requiredRole="admin">
      {children}
    </RoleBasedAccess>
  );
}

// Role badge component
export function RoleBadge({ role }: { role: string }) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'client_free':
        return { label: 'Free Member', icon: Shield, className: 'bg-gray-100 text-gray-800' };
      case 'client_paid':
        return { label: 'Premium Member', icon: Crown, className: 'bg-yellow-100 text-yellow-800' };
      case 'coach':
        return { label: 'Certified Coach', icon: Crown, className: 'bg-blue-100 text-blue-800' };
      case 'admin':
        return { label: 'Administrator', icon: Shield, className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Member', icon: Shield, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}