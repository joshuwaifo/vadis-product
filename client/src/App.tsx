import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import DemoRequest from "@/pages/demo-request";
import DemoProduction from "@/pages/demo-production";
import DemoBrand from "@/pages/demo-brand";
import DemoFinancier from "@/pages/demo-financier";
import DemoCreator from "@/pages/demo-creator";
import RoleSelection from "@/pages/role-selection";
import BusinessEmailVerification from "@/pages/business-email-verification";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, hasRole, needsBusinessEmail, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Automatic redirects based on authentication state
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && !hasRole && location !== '/role-selection') {
      setLocation('/role-selection');
    } else if (isAuthenticated && hasRole && needsBusinessEmail && location !== '/business-email-verification') {
      setLocation('/business-email-verification');
    }
  }, [isAuthenticated, hasRole, needsBusinessEmail, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/demo-request" component={DemoRequest} />
      <Route path="/demo/production" component={DemoProduction} />
      <Route path="/demo/brand" component={DemoBrand} />
      <Route path="/demo/financier" component={DemoFinancier} />
      <Route path="/demo/creator" component={DemoCreator} />
      
      {/* Role selection for authenticated users without roles */}
      {isAuthenticated && !hasRole && (
        <Route path="/role-selection" component={RoleSelection} />
      )}
      
      {/* Business email verification for users who need it */}
      {isAuthenticated && hasRole && needsBusinessEmail && (
        <Route path="/business-email-verification" component={BusinessEmailVerification} />
      )}
      
      {/* Protected routes will be added in Phase 4 */}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
