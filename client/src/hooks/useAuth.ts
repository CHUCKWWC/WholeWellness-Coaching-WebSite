import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  membershipLevel: string | null;
  rewardPoints: number | null;
  donationTotal: string | null;
  profileImageUrl: string | null;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.id,
    isPaidMember: user?.membershipLevel !== 'free' && user?.membershipLevel !== null,
    error,
  };
}