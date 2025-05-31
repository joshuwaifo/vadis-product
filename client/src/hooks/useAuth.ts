import { useQuery } from "@tanstack/react-query";
import type { User, UserRole } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const needsBusinessEmail = user?.role && 
    ['production', 'brand', 'financier'].includes(user.role) && 
    !user.businessEmail && 
    !user.isIndividualFinancier;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole: !!user?.role,
    needsBusinessEmail,
    role: user?.role as UserRole | null,
  };
}