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

import DashboardHome from "@/pages/dashboard/dashboard-home";
import ProductionDashboard from "@/pages/dashboard/production-dashboard";
import BrandDashboard from "@/pages/dashboard/brand-dashboard";
import InvestorDashboard from "@/pages/dashboard/investor-dashboard";
import CreatorDashboard from "@/pages/dashboard/creator-dashboard";
import ProfilePage from "@/pages/dashboard/profile";
import ProjectCreation from "@/pages/dashboard/project-creation";
import ProjectsList from "@/pages/dashboard/projects-list";
import ScriptAnalysisNew from "@/pages/dashboard/script-analysis-new";
import ScriptGenerator from "@/pages/dashboard/script-generator";
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
      {/* Legacy unified dashboard - fallback */}
      <Route path="/dashboard" component={DashboardHome} />
      
      {/* Role-specific dashboards as per original requirements */}
      <Route path="/production/dashboard" component={ProductionDashboard} />
      <Route path="/brand/dashboard" component={BrandDashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/creator/dashboard" component={CreatorDashboard} />
      
      {/* Production company routes */}
      <Route path="/production/projects" component={ProjectsList} />
      <Route path="/production/projects/new" component={ProjectCreation} />
      <Route path="/production/projects/:id/script-writer" component={ScriptGenerator} />
      <Route path="/production/projects/:id/script-upload" component={ScriptAnalysisNew} />
      <Route path="/production/profile" component={ProfilePage} />
      
      {/* Brand/Agency routes */}
      <Route path="/brand/products" component={ProjectsList} />
      <Route path="/brand/marketplace" component={ProjectsList} />
      <Route path="/brand/profile" component={ProfilePage} />
      
      {/* Investor routes */}
      <Route path="/investor/marketplace" component={ProjectsList} />
      <Route path="/investor/profile" component={ProfilePage} />
      
      {/* Creator routes */}
      <Route path="/creator/projects" component={ProjectsList} />
      <Route path="/creator/script-generator" component={ScriptGenerator} />
      <Route path="/creator/profile" component={ProfilePage} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path="/dashboard/profile" component={ProfilePage} />
      <Route path="/dashboard/projects" component={ProjectsList} />
      <Route path="/dashboard/projects/new" component={ProjectCreation} />
      <Route path="/dashboard/projects/new/script_analysis" component={ScriptAnalysisNew} />
      <Route path="/dashboard/projects/new/script_generator" component={ScriptGenerator} />
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
