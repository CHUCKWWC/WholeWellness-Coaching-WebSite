import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isMember: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPaidMember: user?.isMember || false,
    error
  };
}