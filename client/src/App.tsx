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

// Role-specific dashboards
import ProductionDashboard from "@/pages/dashboard/production-dashboard";
import BrandDashboard from "@/pages/dashboard/brand-dashboard";
import InvestorDashboard from "@/pages/dashboard/investor-dashboard";
import CreatorDashboard from "@/pages/dashboard/creator-dashboard";

// Production company flow
import ProjectDetailsForm from "@/pages/dashboard/project-details-form";
import ProjectCreation from "@/pages/dashboard/project-creation";
import ScriptAnalysisNew from "@/pages/dashboard/script-analysis-new";
import ScriptGenerator from "@/pages/dashboard/script-generator";

// Shared components
import ProfilePage from "@/pages/dashboard/profile";
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
      
      {/* Redirect legacy dashboard route to login */}
      <Route path="/dashboard">
        {() => {
          window.location.href = "/login";
          return null;
        }}
      </Route>
      
      {/* Role-specific dashboards */}
      <Route path="/production/dashboard" component={ProductionDashboard} />
      <Route path="/brand/dashboard" component={BrandDashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/creator/dashboard" component={CreatorDashboard} />
      
      {/* Production company project flow */}
      <Route path="/production/projects/new-details" component={ProjectDetailsForm} />
      <Route path="/production/projects/:id/script-options" component={ProjectCreation} />
      <Route path="/production/projects/:id/script-writer" component={ScriptGenerator} />
      <Route path="/production/projects/:id/script-upload" component={ScriptAnalysisNew} />
      
      {/* Shared routes */}
      <Route path="/profile" component={ProfilePage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;