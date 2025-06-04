import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import ProductionDashboard from "@/pages/dashboard/production";
import BrandDashboard from "@/pages/dashboard/brand";
import FinancierDashboard from "@/pages/dashboard/financier";
import CreatorDashboard from "@/pages/dashboard/creator";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/login" component={Login} />
      <Route path="/dashboard/production" component={ProductionDashboard} />
      <Route path="/dashboard/brand" component={BrandDashboard} />
      <Route path="/dashboard/financier" component={FinancierDashboard} />
      <Route path="/dashboard/creator" component={CreatorDashboard} />
      <Route component={Landing} />
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