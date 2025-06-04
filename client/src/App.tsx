import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import DemoRequest from "@/pages/demos/demo-request";
import DemoProduction from "@/pages/demos/demo-production";
import DemoBrand from "@/pages/demos/demo-brand";
import DemoFinancier from "@/pages/demos/demo-financier";
import DemoCreator from "@/pages/demos/demo-creator";

// New role-specific dashboards
import ProductionDashboard from "@/pages/dashboards/production-dashboard";
import BrandDashboard from "@/pages/dashboards/brand-dashboard";
import FinancierDashboard from "@/pages/dashboards/financier-dashboard";
import CreatorDashboard from "@/pages/dashboards/creator-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/demo-request" component={DemoRequest} />
      <Route path="/demo/production" component={DemoProduction} />
      <Route path="/demo/brand" component={DemoBrand} />
      <Route path="/demo/financier" component={DemoFinancier} />
      <Route path="/demo/creator" component={DemoCreator} />
      
      {/* Role-specific dashboards */}
      <Route path="/dashboard/production" component={ProductionDashboard} />
      <Route path="/dashboard/brand" component={BrandDashboard} />
      <Route path="/dashboard/financier" component={FinancierDashboard} />
      <Route path="/dashboard/creator" component={CreatorDashboard} />
      
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