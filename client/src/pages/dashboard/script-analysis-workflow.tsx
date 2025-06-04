import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "./dashboard-layout";
import ProjectWorkflowWizard from "@/components/workflow/project-workflow-wizard";
import { ArrowLeft, FileText, Workflow } from "lucide-react";

export default function ScriptAnalysisWorkflow() {
  const [, setLocation] = useLocation();
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
      setShowWizard(true);
    }
    
    if (stepParam) {
      setInitialStep(stepParam);
    }
  }, []);

  const handleStartWorkflow = () => {
    setShowWizard(true);
  };

  const handleWorkflowComplete = (projectId: number) => {
    setLocation(`/dashboard/projects/${projectId}`);
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
  };

  if (showWizard) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <Button
              variant="outline"
              onClick={() => setShowWizard(false)}
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

        {/* Workflow Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Step-by-Step Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Project Information</h4>
                    <p className="text-sm text-gray-600">
                      Enter project details and upload your script for analysis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Script Analysis Tools</h4>
                    <p className="text-sm text-gray-600">
                      Choose from 8 powerful analysis features including casting, VFX, and financial planning
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Review Results</h4>
                    <p className="text-sm text-gray-600">
                      Review and edit AI-generated analysis results
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Finalize Project</h4>
                    <p className="text-sm text-gray-600">
                      Complete your project and optionally publish to the marketplace
                    </p>
                  </div>
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
            Start New Analysis
            <Workflow className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}