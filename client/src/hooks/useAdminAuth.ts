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

export function useAdminAuth() {
  const { data: adminAuth, isLoading, error } = useQuery<AdminAuthResponse>({
    queryKey: ["/api/admin/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
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