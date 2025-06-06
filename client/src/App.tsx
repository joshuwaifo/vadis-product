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
import ProfilePage from "@/pages/dashboard/profile";
import ScriptAnalysisNew from "@/pages/dashboard/script-analysis-new";
import ScriptAnalysisWorkflow from "@/pages/dashboard/script-analysis-workflow";
import ScriptGenerationWorkflow from "@/pages/dashboard/script-generation-workflow";
import ScriptGenerator from "@/pages/dashboard/script-generator";
import ProductionDashboard from "@/pages/dashboards/production-dashboard-new";
import BrandDashboard from "@/pages/dashboards/brand-dashboard";
import InvestorDashboard from "@/pages/dashboards/investor-dashboard";
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
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/profile" component={ProfilePage} />
      <Route path="/dashboard/script-analysis-workflow" component={ScriptAnalysisWorkflow} />
      <Route path="/dashboard/script-generation-workflow" component={ScriptGenerationWorkflow} />
      <Route path="/dashboard/script-generator" component={ScriptGenerator} />
      <Route path="/dashboard/production/script-generation-workflow" component={ScriptGenerationWorkflow} />
      <Route path="/production/dashboard" component={ProductionDashboard} />
      <Route path="/brand/dashboard" component={BrandDashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/creator/dashboard" component={CreatorDashboard} />
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