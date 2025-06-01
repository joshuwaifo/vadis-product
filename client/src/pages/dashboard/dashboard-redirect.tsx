import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DashboardRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // In a real implementation, this would check the user's role from authentication context
    // For now, redirect to login where role-based redirect should happen after authentication
    setLocation("/login");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}