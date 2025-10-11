import { useQuery } from "@tanstack/react-query";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isSuperAdmin: boolean;
}

export interface AdminAuthResponse {
  user: AdminUser;
  permissions: string[];
  sessionToken: string;
}

export function useAdminAuth(options?: { enabled?: boolean }) {
  // Check if we should attempt admin auth
  // Only enabled if: explicitly requested OR session flag indicates admin login
  const hasAdminSession = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
  const shouldCheck = options?.enabled ?? hasAdminSession;

  const { data: adminAuth, isLoading, error } = useQuery<AdminAuthResponse>({
    queryKey: ["/api/admin/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include", // Ensure cookies are sent
      });
      if (!response.ok) {
        // Return null instead of throwing for graceful 401 handling
        return null;
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: shouldCheck, // Only fetch when explicitly enabled
  });

  return {
    adminUser: adminAuth?.user,
    permissions: adminAuth?.permissions || [],
    isLoading,
    isAdminAuthenticated: !!adminAuth?.user?.id,
    isSuperAdmin: adminAuth?.user?.isSuperAdmin || false,
    isAdmin: adminAuth?.user?.role === 'admin' || adminAuth?.user?.role === 'super_admin',
    error,
  };
}