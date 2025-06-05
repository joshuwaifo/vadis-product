import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "./dashboard-layout";
import ProjectDashboard from "@/components/project-dashboard";
import ProjectWorkflowWizard from "@/components/workflow/project-workflow-wizard";
import { ArrowLeft, FileText, Workflow, Plus } from "lucide-react";

export default function ScriptAnalysisWorkflow() {
  const [, setLocation] = useLocation();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [projectId, setProjectId] = useState<number | undefined>();
  const [initialStep, setInitialStep] = useState<string | undefined>();

  useEffect(() => {
    // Parse URL parameters for project continuation
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId');
    const stepParam = urlParams.get('step');
    
    if (projectIdParam) {
      setProjectId(parseInt(projectIdParam));
      // If project has script content, go to dashboard, otherwise use wizard for setup
      if (stepParam === 'project_info') {
        setShowWizard(true);
      } else {
        setShowDashboard(true);
      }
    }
    
    if (stepParam) {
      setInitialStep(stepParam);
    }
  }, []);

  const handleStartWorkflow = () => {
    setShowWizard(true);
  };

  const handleStartAnalysis = () => {
    setShowDashboard(true);
  };

  const handleWorkflowComplete = (projectId: number) => {
    setLocation(`/dashboard/projects/${projectId}`);
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
  };

  const handleBackToOverview = () => {
    setShowDashboard(false);
    setShowWizard(false);
  };

  // Show project dashboard for analysis
  if (showDashboard && projectId) {
    return (
      <ProjectDashboard 
        projectId={projectId} 
        onBack={handleBackToOverview}
      />
    );
  }

  // Show wizard for project setup
  if (showWizard) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <Button
              variant="outline"
              onClick={handleBackToOverview}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
            
            <ProjectWorkflowWizard
              onComplete={handleWorkflowComplete}
              existingProjectId={projectId}
              initialStep={initialStep}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Workflow className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Script Analysis Workflow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your script into a comprehensive production package with our AI-powered analysis tools
          </p>
        </div>

        {/* New Workflow Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Simple 3-Step Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Project Setup</h4>
                  <p className="text-sm text-gray-600">
                    Enter project details and upload your script
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Interactive Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Choose any analysis tool and get instant AI-powered insights
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Export & Finalize</h4>
                  <p className="text-sm text-gray-600">
                    Export your analysis results and finalize your project
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Scene Breakdown", icon: "🎬" },
                { name: "Character Analysis", icon: "👥" },
                { name: "Casting Suggestions", icon: "🎭" },
                { name: "Location Scouting", icon: "📍" },
                { name: "VFX Analysis", icon: "✨" },
                { name: "Product Placement", icon: "💰" },
                { name: "Financial Planning", icon: "📊" },
                { name: "Complete Summary", icon: "📄" }
              ].map((feature, index) => (
                <div key={index} className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <p className="text-sm font-medium">{feature.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Use Our Workflow?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">Save Progress</h4>
                <p className="text-sm text-gray-600">
                  Save your work at any step and continue later
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Workflow className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">Guided Process</h4>
                <p className="text-sm text-gray-600">
                  Step-by-step guidance through the entire analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowLeft className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">Professional Results</h4>
                <p className="text-sm text-gray-600">
                  Industry-standard analysis ready for investors and partners
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={handleStartWorkflow}
            size="lg"
            className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
          
          <Button
            onClick={handleStartAnalysis}
            size="lg"
            variant="outline"
          >
            <Workflow className="w-4 h-4 mr-2" />
            Open Analysis Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}