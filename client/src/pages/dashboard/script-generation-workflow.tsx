import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "./dashboard-layout";
import ScriptGenerationWizard from "@/components/workflow/script-generation-wizard";
import { ArrowLeft, Wand2, FileText, Sparkles } from "lucide-react";

export default function ScriptGenerationWorkflow() {
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
            
            <ScriptGenerationWizard
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-600 rounded-full flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Script Generation Workflow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional screenplays with our AI-powered script generation tools. From concept to final draft.
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
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Project Setup</h4>
                    <p className="text-sm text-gray-600">
                      Define your story concept, genre, and key creative parameters
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Script Generation</h4>
                    <p className="text-sm text-gray-600">
                      Watch as AI crafts your screenplay with professional formatting and structure
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Edit</h4>
                    <p className="text-sm text-gray-600">
                      Review the generated script and make edits in real-time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Export & Save</h4>
                    <p className="text-sm text-gray-600">
                      Export your completed script as PDF or save for further development
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
            <CardTitle>Generation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Story Structure", icon: "📚" },
                { name: "Character Development", icon: "🎭" },
                { name: "Dialogue Creation", icon: "💬" },
                { name: "Scene Description", icon: "🎬" },
                { name: "Format Compliance", icon: "📏" },
                { name: "Genre Adaptation", icon: "🎪" },
                { name: "Real-time Preview", icon: "👀" },
                { name: "PDF Export", icon: "📄" }
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
            <CardTitle>Why Use Our AI Script Generator?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">AI-Powered Creation</h4>
                <p className="text-sm text-gray-600">
                  Advanced AI models trained on industry-standard screenplays
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">Professional Format</h4>
                <p className="text-sm text-gray-600">
                  Industry-standard formatting ready for production
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h4 className="font-medium mb-2">Real-time Generation</h4>
                <p className="text-sm text-gray-600">
                  Watch your script come to life as it's being generated
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
            className="bg-gradient-to-r from-purple-500 via-pink-600 to-orange-600 hover:from-purple-600 hover:via-pink-700 hover:to-orange-700"
          >
            Start Script Generation
            <Wand2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}