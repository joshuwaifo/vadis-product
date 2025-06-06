import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Film, Users, Star, MapPin, Zap, Package, DollarSign, FileText,
  Play, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Maximize2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';


// Define types directly in this file since the server types are not accessible from client
interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'error';
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
  completedAt?: Date;
}

const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: 'scene_extraction',
    title: 'Scene Extraction',
    description: 'Extract and analyze individual scenes from the script',
    status: 'not_started',
    icon: Film,
    estimatedTime: '2-3 min'
  },

  {
    id: 'character_analysis',
    title: 'Character Analysis',
    description: 'Analyze characters and their relationships',
    status: 'not_started',
    icon: Users,
    estimatedTime: '3-4 min'
  },
  {
    id: 'casting_suggestions',
    title: 'Casting Suggestions',
    description: 'AI-powered actor recommendations for each character',
    status: 'not_started',
    icon: Star,
    estimatedTime: '4-5 min'
  },
  {
    id: 'location_analysis',
    title: 'Location Analysis',
    description: 'Identify and suggest filming locations',
    status: 'not_started',
    icon: MapPin,
    estimatedTime: '3-4 min'
  },
  {
    id: 'vfx_analysis',
    title: 'VFX Analysis',
    description: 'Identify visual effects requirements and complexity',
    status: 'not_started',
    icon: Zap,
    estimatedTime: '4-5 min'
  },
  {
    id: 'product_placement',
    title: 'Product Placement',
    description: 'Identify opportunities for brand partnerships',
    status: 'not_started',
    icon: Package,
    estimatedTime: '2-3 min'
  },
  {
    id: 'financial_planning',
    title: 'Financial Planning',
    description: 'Generate budget estimates and financial projections',
    status: 'not_started',
    icon: DollarSign,
    estimatedTime: '5-6 min'
  },
  {
    id: 'project_summary',
    title: 'Project Summary',
    description: 'Generate comprehensive project overview and reader\'s report',
    status: 'not_started',
    icon: FileText,
    estimatedTime: '3-4 min'
  }
];

interface AnalysisDashboardStepProps {
  workflow?: {
    projectId: number;
    currentStep: string;
    steps: any[];
  };
  onNext: () => void;
  onPrevious: () => void;
}

export default function AnalysisDashboardStep({ workflow, onNext, onPrevious }: AnalysisDashboardStepProps) {
  const [tasks, setTasks] = useState<AnalysisTask[]>([...ANALYSIS_TASKS]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${workflow?.projectId}`],
    enabled: !!workflow?.projectId
  });

  // Debug workflow data
  console.log('Workflow data:', workflow);
  console.log('Project ID from workflow:', workflow?.projectId);

  const analysisInProgress = tasks.some(task => task.status === 'in_progress');

  // Create mutation for running individual analysis
  const runAnalysisMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      // Use project ID from either workflow or project data
      const projectId = workflow?.projectId || project?.id;
      
      console.log('Starting analysis for task:', taskId, 'Project ID:', projectId, 'Sources:', { 
        workflowProjectId: workflow?.projectId, 
        projectId: project?.id 
      });
      
      // Update task status to in_progress
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'in_progress' as const } : task
      ));

      try {
        const response = await apiRequest(`/api/script-analysis/${taskId}`, 'POST', {
          projectId: projectId
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Analysis response data:', data);
        return data;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data, { taskId }) => {
      console.log('Analysis successful for task:', taskId, 'Data:', data);
      
      // Update task status to completed
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' as const, completedAt: new Date() } : task
      ));
      
      // Store results
      setAnalysisResults(prev => ({ ...prev, [taskId]: data }));
      
      // Auto-select the completed task to show results
      setSelectedTask(taskId);
      
      toast({
        title: "Analysis Complete",
        description: `${tasks.find(t => t.id === taskId)?.title} has been completed successfully.`
      });
    },
    onError: (error, { taskId }) => {
      console.error('Full analysis error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });
      
      // Update task status to error
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'error' as const } : task
      ));
      
      // Parse error message
      let errorMessage = 'An unexpected error occurred during analysis.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Analysis Failed",
        description: `${tasks.find(t => t.id === taskId)?.title}: ${errorMessage}`,
        variant: "destructive"
      });
    }
  });

  const runAnalysis = (taskId: string) => {
    runAnalysisMutation.mutate({ taskId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderAnalysisContent = () => {
    if (!selectedTask) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-3xl opacity-50"></div>
            <div className="relative p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
              <Play className="h-20 w-20 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready for AI Analysis</h3>
            <p className="text-muted-foreground text-lg">
              Select any analysis tool above to unlock powerful insights about your screenplay
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      );
    }

    const task = tasks.find(t => t.id === selectedTask);
    const results = analysisResults[selectedTask];

    if (!task) return null;

    if (task.status === 'in_progress') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Running {task.title}</h3>
          <p className="text-muted-foreground mb-4">
            AI is analyzing your script. This may take {task.estimatedTime}.
          </p>
          <Progress value={50} className="w-64" />
        </div>
      );
    }

    if (task.status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
          <p className="text-muted-foreground mb-4">
            There was an error running {task.title}. Please try again.
          </p>
          <Button onClick={() => runAnalysis(selectedTask)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </div>
      );
    }

    if (task.status === 'completed' && results) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{task.title} Results</h3>
              <p className="text-sm text-muted-foreground">
                Completed {task.completedAt?.toLocaleString()}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            {renderTaskResults(selectedTask, results)}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <task.icon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <p className="text-muted-foreground mb-4">{task.description}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Estimated time: {task.estimatedTime}
        </p>
        <Button onClick={() => runAnalysis(selectedTask)}>
          <Play className="h-4 w-4 mr-2" />
          Run Analysis
        </Button>
      </div>
    );
  };

  const renderTaskResults = (taskId: string, results: any) => {
    switch (taskId) {
      case 'scene_extraction':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-3 gap-6 text-center flex-1">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.totalScenes || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Scenes</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{results.estimatedDuration || 0}</div>
                  <div className="text-sm text-muted-foreground">Est. Minutes</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{results.scenes?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Extracted</div>
                </div>
              </div>
              

            </div>

            {results.scenes && results.scenes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Scenes</h4>
                  <Badge variant="outline" className="text-xs">
                    {results.scenes.length} total
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {results.scenes.map((scene: any, index: number) => (
                    <Card key={index} className="h-32 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {scene.sceneNumber}
                          </Badge>
                        </div>
                        
                        <h4 className="text-sm font-medium mb-2 line-clamp-1">
                          {scene.description || `Scene ${scene.sceneNumber}`}
                        </h4>
                        
                        <div className="flex-1 overflow-hidden">
                          <ScrollArea className="h-16">
                            <p className="text-xs text-muted-foreground leading-relaxed pr-2">
                              {scene.plotSummary || 'Plot summary not available'}
                            </p>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'storyboard_view':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Storyboard View</h3>
              <p className="text-muted-foreground mb-6">
                Visual representation of all scenes in your script
              </p>
              
              {/* Storyboard grid would go here */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 rounded-xl p-8 border-2 border-dashed border-blue-200 dark:border-blue-800">
                <Maximize2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Storyboard Feature Coming Soon
                </h4>
                <p className="text-blue-600 dark:text-blue-400">
                  Visual storyboard representation will be available here
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;



  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Analysis Tools - Compact Cards */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Film className="h-5 w-5 text-blue-600" />
                  Analysis Tools
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Extract insights from your script
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{completedTasks}/{totalTasks}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              {/* Analysis Tools List */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedTask === task.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <task.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                    
                    <Button
                      size="sm"
                      variant={task.status === 'completed' ? 'default' : 'outline'}
                      className="w-full text-xs"
                      disabled={task.status === 'in_progress' || analysisInProgress}
                      onClick={(e) => {
                        e.stopPropagation();
                        runAnalysis(task.id);
                      }}
                    >
                      {task.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      {task.status === 'completed' ? 'View Results' : 
                       task.status === 'in_progress' ? 'Processing...' : 'Start Analysis'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel - Takes remaining space */}
          <div className="xl:col-span-3">
            <Card className="h-[calc(100vh-12rem)] border border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg font-semibold">Analysis Results</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTask ? tasks.find(t => t.id === selectedTask)?.title || 'Select a tool to view results' : 'Select a tool to view results'}
                      </p>
                    </div>
                  </div>
                  {selectedTask && tasks.find(t => t.id === selectedTask)?.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {renderAnalysisContent()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation - Full Width */}
        <div className="w-full mt-6">
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              className="flex items-center gap-2 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: Project Info
            </Button>
            
            <div className="flex items-center gap-4">
              {completedTasks > 0 && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Analysis Progress</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {completedTasks} of {totalTasks} Complete
                  </div>
                </div>
              )}
              
              <Button 
                onClick={onNext} 
                disabled={completedTasks === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Finalize Project
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {completedTasks > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white border-white/30">
                    {completedTasks} Complete
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}