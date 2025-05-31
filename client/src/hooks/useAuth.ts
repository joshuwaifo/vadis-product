import { useQuery } from "@tanstack/react-query";
import type { User, UserRole } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole: !!user?.role,
    role: user?.role as UserRole | null,
  };
}