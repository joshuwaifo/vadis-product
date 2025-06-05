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

  const analysisInProgress = tasks.some(task => task.status === 'in_progress');

  // Create mutation for running individual analysis
  const runAnalysisMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!workflow?.projectId) throw new Error('Project ID is required');
      
      // Update task status to in_progress
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'in_progress' as const } : task
      ));

      const response = await apiRequest(`/api/script-analysis/${taskId}`, 'POST', {
        projectId: workflow.projectId
      });
      
      return response.json();
    },
    onSuccess: (data, { taskId }) => {
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
      // Update task status to error
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'error' as const } : task
      ));
      
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: `Failed to complete ${tasks.find(t => t.id === taskId)?.title}. Please try again.`,
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
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Play className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select an Analysis Tool</h3>
          <p className="text-muted-foreground">
            Choose an analysis tool from above to run AI-powered analysis on your script.
          </p>
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
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{results.totalScenes || 0}</div>
                <div className="text-sm text-muted-foreground">Total Scenes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{results.estimatedDuration || 0}</div>
                <div className="text-sm text-muted-foreground">Est. Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{results.scenes?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Extracted</div>
              </div>
            </div>
            {results.scenes && results.scenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Scene Breakdown</h4>
                {results.scenes.slice(0, 5).map((scene: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">Scene {scene.sceneNumber}</Badge>
                      <span className="text-sm text-muted-foreground">{scene.duration}min</span>
                    </div>
                    <h5 className="font-medium">{scene.location} - {scene.timeOfDay}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{scene.description}</p>
                    {scene.characters && scene.characters.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Characters: </span>
                        <span className="text-xs">{scene.characters.join(', ')}</span>
                      </div>
                    )}
                  </Card>
                ))}
                {results.scenes.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    And {results.scenes.length - 5} more scenes...
                  </p>
                )}
              </div>
            )}
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
    <div className="space-y-6">
      {/* Analysis Tools at Top */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Analysis Tools
              </CardTitle>
              <CardDescription>
                Select analysis tasks to run on your script
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-lg font-semibold">{completedTasks}/{totalTasks}</div>
              <Progress value={progressPercentage} className="w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                  selectedTask === task.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-background rounded-lg border">
                    <task.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.estimatedTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Button
                      size="sm"
                      variant={task.status === 'completed' ? 'secondary' : 'default'}
                      disabled={task.status === 'in_progress' || analysisInProgress}
                      onClick={(e) => {
                        e.stopPropagation();
                        runAnalysis(task.id);
                      }}
                    >
                      {task.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      {task.status === 'completed' ? 'View' : 'Run'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Display - Increased Height */}
      <Card className="h-[700px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Results</span>
            {selectedTask && (
              <Badge variant="outline">
                {tasks.find(t => t.id === selectedTask)?.title}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[620px]">
            {renderAnalysisContent()}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Project Info
        </Button>
        <Button onClick={onNext} disabled={completedTasks === 0}>
          Next: Finalize Project
          {completedTasks > 0 && (
            <Badge variant="secondary" className="ml-2">
              {completedTasks} Complete
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}