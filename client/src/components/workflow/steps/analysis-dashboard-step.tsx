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
  Play, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
// Define types directly in this file since the server types are not accessible from client
interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'error';
  icon: string;
  estimatedTime: string;
  completedAt?: Date;
}

const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: 'scene_extraction',
    title: 'Scene Extraction & Breakdown',
    description: 'Extract and analyze individual scenes from the script',
    status: 'not_started',
    icon: 'Film',
    estimatedTime: '2-3 min'
  },
  {
    id: 'character_analysis',
    title: 'Character Analysis',
    description: 'Analyze characters and their relationships',
    status: 'not_started',
    icon: 'Users',
    estimatedTime: '3-4 min'
  },
  {
    id: 'casting_suggestions',
    title: 'Casting Suggestions',
    description: 'AI-powered actor recommendations for each character',
    status: 'not_started',
    icon: 'Star',
    estimatedTime: '4-5 min'
  },
  {
    id: 'location_analysis',
    title: 'Location Analysis',
    description: 'Identify filming locations and logistics',
    status: 'not_started',
    icon: 'MapPin',
    estimatedTime: '3-4 min'
  },
  {
    id: 'vfx_analysis',
    title: 'VFX Requirements',
    description: 'Analyze visual effects needs and complexity',
    status: 'not_started',
    icon: 'Zap',
    estimatedTime: '3-4 min'
  },
  {
    id: 'product_placement',
    title: 'Product Placement',
    description: 'Identify brand integration opportunities',
    status: 'not_started',
    icon: 'Package',
    estimatedTime: '2-3 min'
  },
  {
    id: 'financial_planning',
    title: 'Financial Planning',
    description: 'Budget estimation and revenue projections',
    status: 'not_started',
    icon: 'DollarSign',
    estimatedTime: '4-5 min'
  },
  {
    id: 'project_summary',
    title: 'Project Summary',
    description: 'Comprehensive reader\'s report and summary',
    status: 'not_started',
    icon: 'FileText',
    estimatedTime: '3-4 min'
  }
];

interface AnalysisDashboardStepProps {
  projectId: number;
  onNext: () => void;
  onPrevious: () => void;
}

const iconMap = {
  Film,
  Users,
  Star,
  MapPin,
  Zap,
  Package,
  DollarSign,
  FileText
};

export default function AnalysisDashboardStep({ 
  projectId, 
  onNext, 
  onPrevious 
}: AnalysisDashboardStepProps) {
  const [selectedTask, setSelectedTask] = useState<string>('scene_extraction');
  const [taskStatuses, setTaskStatuses] = useState<Record<string, AnalysisTask['status']>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load project data
  const { data: project } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  });

  // Load existing analysis results
  const { data: existingResults } = useQuery({
    queryKey: ['/api/projects', projectId, 'analysis-results'],
    enabled: !!projectId
  });

  useEffect(() => {
    if (existingResults) {
      setAnalysisResults(existingResults);
      // Update task statuses based on existing results
      const newStatuses: Record<string, AnalysisTask['status']> = {};
      ANALYSIS_TASKS.forEach(task => {
        newStatuses[task.id] = existingResults[task.id] ? 'completed' : 'not_started';
      });
      setTaskStatuses(newStatuses);
    }
  }, [existingResults]);

  // Run analysis mutation
  const runAnalysis = useMutation({
    mutationFn: async ({ taskId, projectId }: { taskId: string; projectId: number }) => {
      const endpoint = getAnalysisEndpoint(taskId);
      return apiRequest(endpoint, 'POST', { projectId });
    },
    onMutate: ({ taskId }) => {
      setTaskStatuses(prev => ({ ...prev, [taskId]: 'in_progress' }));
    },
    onSuccess: (data, { taskId }) => {
      setTaskStatuses(prev => ({ ...prev, [taskId]: 'completed' }));
      setAnalysisResults(prev => ({ ...prev, [taskId]: data }));
      toast({
        title: "Analysis Complete",
        description: `${ANALYSIS_TASKS.find(t => t.id === taskId)?.title} has been completed successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'analysis-results'] });
    },
    onError: (error, { taskId }) => {
      setTaskStatuses(prev => ({ ...prev, [taskId]: 'error' }));
      toast({
        title: "Analysis Failed",
        description: `Failed to complete ${ANALYSIS_TASKS.find(t => t.id === taskId)?.title}. Please try again.`,
        variant: "destructive"
      });
    }
  });

  const getAnalysisEndpoint = (taskId: string): string => {
    const endpointMap: Record<string, string> = {
      scene_extraction: '/api/script-analysis/scene_extraction',
      character_analysis: '/api/script-analysis/character_analysis',
      casting_suggestions: '/api/script-analysis/casting_suggestions',
      location_analysis: '/api/script-analysis/location_analysis',
      vfx_analysis: '/api/script-analysis/vfx_analysis',
      product_placement: '/api/script-analysis/product_placement',
      financial_planning: '/api/script-analysis/financial_planning',
      project_summary: '/api/script-analysis/project_summary'
    };
    return endpointMap[taskId] || '/api/script-analysis/scene_extraction';
  };

  const handleRunAnalysis = (taskId: string) => {
    if (!project?.scriptContent) {
      toast({
        title: "No Script Content",
        description: "Please upload a script in the previous step before running analysis.",
        variant: "destructive"
      });
      return;
    }
    runAnalysis.mutate({ taskId, projectId });
  };

  const getStatusIcon = (status: AnalysisTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: AnalysisTask['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const completedTasks = Object.values(taskStatuses).filter(status => status === 'completed').length;
  const totalTasks = ANALYSIS_TASKS.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  const selectedTaskData = ANALYSIS_TASKS.find(task => task.id === selectedTask);
  const selectedTaskStatus = taskStatuses[selectedTask] || 'not_started';
  const selectedTaskResult = analysisResults[selectedTask];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Progress</span>
            <Badge variant="secondary">{completedTasks}/{totalTasks} Complete</Badge>
          </CardTitle>
          <CardDescription>
            Complete the analysis tasks below to generate comprehensive insights for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            {progressPercentage === 100 ? 'All analyses complete!' : `${Math.round(progressPercentage)}% complete`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Analysis Tasks */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Tools</CardTitle>
              <CardDescription>Select an analysis to run or view results</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4">
                  {ANALYSIS_TASKS.map((task) => {
                    const IconComponent = iconMap[task.icon as keyof typeof iconMap];
                    const status = taskStatuses[task.id] || 'not_started';
                    
                    return (
                      <Button
                        key={task.id}
                        variant={selectedTask === task.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <IconComponent className="w-4 h-4" />
                            {getStatusIcon(status)}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{task.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{task.estimatedTime}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedTaskData && (
                    <>
                      {React.createElement(iconMap[selectedTaskData.icon as keyof typeof iconMap], { className: "w-5 h-5" })}
                      <div>
                        <CardTitle>{selectedTaskData.title}</CardTitle>
                        <CardDescription>{selectedTaskData.description}</CardDescription>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeVariant(selectedTaskStatus)}>
                    {selectedTaskStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {selectedTaskStatus === 'not_started' && (
                    <Button 
                      onClick={() => handleRunAnalysis(selectedTask)}
                      disabled={runAnalysis.isPending}
                      size="sm"
                    >
                      {runAnalysis.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Run Analysis
                    </Button>
                  )}
                  {selectedTaskStatus === 'completed' && (
                    <Button 
                      onClick={() => handleRunAnalysis(selectedTask)}
                      disabled={runAnalysis.isPending}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  )}
                  {selectedTaskStatus === 'error' && (
                    <Button 
                      onClick={() => handleRunAnalysis(selectedTask)}
                      disabled={runAnalysis.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedTaskStatus === 'not_started' && (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    {selectedTaskData && React.createElement(iconMap[selectedTaskData.icon as keyof typeof iconMap], { className: "w-6 h-6 text-muted-foreground" })}
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ready to Start Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Run Analysis" to begin {selectedTaskData?.title.toLowerCase()}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated time: {selectedTaskData?.estimatedTime}
                  </p>
                </div>
              )}

              {selectedTaskStatus === 'in_progress' && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-medium mb-2">Analysis in Progress</h3>
                  <p className="text-muted-foreground">
                    Running {selectedTaskData?.title.toLowerCase()}...
                  </p>
                </div>
              )}

              {selectedTaskStatus === 'error' && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-medium mb-2">Analysis Failed</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error running {selectedTaskData?.title.toLowerCase()}.
                  </p>
                  <Button onClick={() => handleRunAnalysis(selectedTask)} variant="destructive">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {selectedTaskStatus === 'completed' && selectedTaskResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Analysis Results</h3>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                  
                  {/* Render results based on task type */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                      {JSON.stringify(selectedTaskResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Complete analyses as needed, then proceed to finalize your project
          </span>
          <Button onClick={onNext}>
            Next: Finalize Project
          </Button>
        </div>
      </div>
    </div>
  );
}