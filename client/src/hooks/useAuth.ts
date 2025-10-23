import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  membershipLevel: string | null;
  rewardPoints: number | null;
  donationTotal: string | null;
  profileImageUrl: string | null;
  role: string;
  permissions: string[] | null;
  roleActivatedAt?: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Check if we have cached user data or if we've already attempted auth
  const cachedData = queryClient.getQueryData<AuthUser>(["/api/auth/user"]);
  const hasAuthSession = sessionStorage.getItem('hasAuthSession') === 'true';
  
  // Only enable query if:
  // 1. We have cached data (user is likely logged in)
  // 2. We haven't checked yet AND we have evidence of a session
  // 3. Or we're explicitly told to check
  const shouldCheck = !hasCheckedAuth || !!cachedData || hasAuthSession;

  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: shouldCheck,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch constantly
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    meta: {
      // Suppress error logging for 401s (expected for logged-out users)
      suppressErrorLogging: true,
    },
  });

  // Mark that we've attempted to check auth
  useEffect(() => {
    if (!isLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      // If we got a user, set session flag
      if (user?.id) {
        sessionStorage.setItem('hasAuthSession', 'true');
      } else {
        sessionStorage.removeItem('hasAuthSession');
      }
    }
  }, [isLoading, user, hasCheckedAuth]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.id,
    isPaidMember: user?.membershipLevel !== 'free' && user?.membershipLevel !== null,
    isCoach: user?.role === 'coach',
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isMember: user?.role === 'user' || !user?.role,
    role: user?.role || 'user',
    error,
  };
}