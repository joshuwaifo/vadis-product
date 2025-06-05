import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Circle, Clock, ArrowRight, ArrowLeft, Save } from "lucide-react";

import ProjectInfoStep from "./steps/project-info-step";
import AnalysisDashboardStep from "./steps/analysis-dashboard-step";
import FinalizeProjectStep from "./steps/finalize-project-step";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
}

interface ProjectWorkflow {
  projectId: number;
  currentStep: string;
  steps: WorkflowStep[];
}

interface ProjectWorkflowWizardProps {
  projectId?: number;
  existingProjectId?: number;
  initialStep?: string;
  onComplete?: (projectId: number) => void;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'project_info',
    title: 'Project Information',
    description: 'Enter project details and upload script',
    status: 'pending'
  },
  {
    id: 'analysis_dashboard',
    title: 'Analysis Dashboard',
    description: 'Run and manage script analysis tools',
    status: 'pending'
  },
  {
    id: 'finalize_project',
    title: 'Finalize Project',
    description: 'Complete project and publish to marketplace',
    status: 'pending'
  }
];

export default function ProjectWorkflowWizard({ 
  projectId, 
  existingProjectId, 
  initialStep, 
  onComplete 
}: ProjectWorkflowWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use existingProjectId if provided, otherwise use projectId
  const activeProjectId = existingProjectId || projectId;

  // Fetch existing workflow if activeProjectId is provided
  const { data: existingWorkflow } = useQuery({
    queryKey: ['workflow', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const response = await apiRequest(`/api/projects/${activeProjectId}/workflow`, "GET");
      return response.json();
    },
    enabled: !!activeProjectId
  });

  // Initialize workflow state
  useEffect(() => {
    if (existingWorkflow) {
      setWorkflow(existingWorkflow);
      const currentStepIdx = WORKFLOW_STEPS.findIndex(step => step.id === existingWorkflow.currentStep);
      setCurrentStepIndex(currentStepIdx >= 0 ? currentStepIdx : 0);
    } else if (initialStep) {
      // Set step based on initialStep parameter
      const initialStepIdx = WORKFLOW_STEPS.findIndex(step => step.id === initialStep);
      setCurrentStepIndex(initialStepIdx >= 0 ? initialStepIdx : 0);
      setWorkflow({
        projectId: activeProjectId || 0,
        currentStep: initialStep,
        steps: [...WORKFLOW_STEPS]
      });
    } else {
      setWorkflow({
        projectId: activeProjectId || 0,
        currentStep: 'project_info',
        steps: [...WORKFLOW_STEPS]
      });
    }
  }, [existingWorkflow, activeProjectId, initialStep]);

  // Save workflow progress
  const saveWorkflowMutation = useMutation({
    mutationFn: async (data: { currentStep: string; stepData?: any }) => {
      const response = await apiRequest(
        activeProjectId ? `/api/projects/${activeProjectId}/workflow` : '/api/projects/workflow',
        activeProjectId ? "PUT" : "POST",
        {
          currentStep: data.currentStep,
          stepData: data.stepData,
          projectId: workflow?.projectId || activeProjectId
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setWorkflow(data.workflow);
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      toast({
        title: "Progress saved",
        description: "Your work has been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  const currentStep = WORKFLOW_STEPS[currentStepIndex];
  const totalSteps = WORKFLOW_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleNext = async (stepData?: any) => {
    setIsLoading(true);
    
    try {
      // Save current step data
      await saveWorkflowMutation.mutateAsync({
        currentStep: currentStep.id,
        stepData
      });

      // Move to next step
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // Workflow complete
        onComplete?.(workflow?.projectId || 0);
      }
    } catch (error) {
      console.error('Failed to save and continue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSave = async (stepData?: any) => {
    await saveWorkflowMutation.mutateAsync({
      currentStep: currentStep.id,
      stepData
    });
  };

  const getStepStatus = (stepIndex: number): WorkflowStep['status'] => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'in_progress';
    return 'pending';
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'project_info':
        return (
          <ProjectInfoStep
            projectId={workflow?.projectId}
            onNext={handleNext}
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      case 'analysis_dashboard':
        return (
          <AnalysisDashboardStep
            projectId={workflow?.projectId || 0}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'finalize_project':
        return (
          <FinalizeProjectStep
            projectId={workflow?.projectId || 0}
            onComplete={() => onComplete?.(workflow?.projectId || 0)}
            isLoading={isLoading}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  if (!workflow) {
    return <div>Loading workflow...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Script Analysis Workflow</CardTitle>
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              const isActive = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${isActive ? 'text-blue-600' : ''}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2">
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : status === 'in_progress' ? (
                        <Clock className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-4 mt-[-2rem]" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <p className="text-gray-600">{currentStep.description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={saveWorkflowMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveWorkflowMutation.isPending ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}