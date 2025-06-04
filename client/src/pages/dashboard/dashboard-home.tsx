import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "./dashboard-layout";

export default function DashboardHome() {
  const [location, setLocation] = useLocation();

  // Fetch current user data from session
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Authentication required');
      }
      return response.json();
    },
  });

  // Role-based redirection
  useEffect(() => {
    if (currentUser?.user?.role && location === '/dashboard') {
      const role = currentUser.user.role;
      
      switch (role) {
        case 'PRODUCTION':
          setLocation('/production/dashboard');
          break;
        case 'BRAND_AGENCY':
          setLocation('/brand/dashboard');
          break;
        case 'INVESTOR':
          setLocation('/investor/dashboard');
          break;
        case 'INDIVIDUAL_CREATOR':
          setLocation('/creator/dashboard');
          break;
        default:
          // Unknown role, redirect to login
          setLocation('/login');
      }
    }
  }, [currentUser, location, setLocation]);

  // Redirect to login if authentication fails
  if (userError) {
    setLocation('/login');
    return null;
  }

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <p className="text-gray-500">Redirecting to your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // This component now acts as a router - users should be redirected before reaching here
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}