import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
// Demo pages removed during cleanup

import DashboardHome from "@/pages/dashboard/dashboard-home";
import ProfilePage from "@/pages/dashboard/profile";
import ScriptAnalysisNew from "@/pages/dashboard/script-analysis-new";
import ScriptAnalysisWorkflow from "@/pages/dashboard/script-analysis-workflow";
import ScriptAnalysisDashboard from "@/pages/script-analysis/script-analysis-dashboard";
import CannesDemoDashboard from "@/pages/script-analysis/cannes-demo-dashboard";
import ScriptGenerator from "@/pages/dashboard/script-generator";
// Role-specific dashboards removed during cleanup
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      {/* Demo routes removed during cleanup */}
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/profile" component={ProfilePage} />
      <Route path="/dashboard/script-analysis-workflow" component={ScriptAnalysisWorkflow} />
      <Route path="/dashboard/script-analysis" component={CannesDemoDashboard} />
      <Route path="/dashboard/script-generator" component={ScriptGenerator} />
      {/* Role-specific dashboard routes removed during cleanup */}
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