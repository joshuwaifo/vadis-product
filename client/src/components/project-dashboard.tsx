import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, MapPin, Sparkles, DollarSign, 
  Film, User, BarChart3, FileText,
  Play, CheckCircle, Clock, Save, Download,
  ArrowLeft, Settings, Share2
} from "lucide-react";

interface AnalysisTask {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  status: 'not_started' | 'running' | 'completed' | 'error';
  results?: any;
}

interface ProjectDashboardProps {
  projectId: number;
  onBack?: () => void;
}

const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: 'scene_extraction',
    name: 'Scene Extraction',
    description: 'Extract and analyze individual scenes, locations, and timing',
    icon: Film,
    estimatedTime: '2-3 min',
    status: 'not_started'
  },
  {
    id: 'character_analysis',
    name: 'Character Analysis',
    description: 'Identify characters, relationships, and character arcs',
    icon: Users,
    estimatedTime: '3-4 min',
    status: 'not_started'
  },
  {
    id: 'casting_suggestions',
    name: 'Casting Suggestions',
    description: 'AI-powered actor recommendations for each character',
    icon: User,
    estimatedTime: '4-5 min',
    status: 'not_started'
  },
  {
    id: 'location_analysis',
    name: 'Location Analysis',
    description: 'Filming location suggestions with tax incentives',
    icon: MapPin,
    estimatedTime: '3-4 min',
    status: 'not_started'
  },
  {
    id: 'vfx_analysis',
    name: 'VFX Analysis',
    description: 'Visual effects needs and cost estimation',
    icon: Sparkles,
    estimatedTime: '2-3 min',
    status: 'not_started'
  },
  {
    id: 'product_placement',
    name: 'Product Placement',
    description: 'Brand integration opportunities and revenue potential',
    icon: DollarSign,
    estimatedTime: '3-4 min',
    status: 'not_started'
  },
  {
    id: 'financial_planning',
    name: 'Financial Planning',
    description: 'Budget breakdown and revenue projections',
    icon: BarChart3,
    estimatedTime: '5-6 min',
    status: 'not_started'
  },
  {
    id: 'project_summary',
    name: 'Project Summary',
    description: 'Comprehensive project report and analysis',
    icon: FileText,
    estimatedTime: '2-3 min',
    status: 'not_started'
  }
];

export default function ProjectDashboard({ projectId, onBack }: ProjectDashboardProps) {
  const [selectedTask, setSelectedTask] = useState<string>('scene_extraction');
  const [tasks, setTasks] = useState<AnalysisTask[]>(ANALYSIS_TASKS);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await apiRequest(`/api/projects/${projectId}`, "GET");
      return response.json();
    }
  });

  // Fetch existing analysis results
  const { data: existingResults } = useQuery({
    queryKey: ['analysis-results', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/projects/${projectId}/analysis-results`, "GET");
        return response.json();
      } catch (error) {
        return {};
      }
    },
    enabled: !!projectId
  });

  // Update tasks status based on existing results
  useEffect(() => {
    if (existingResults) {
      setAnalysisResults(existingResults);
      setTasks(prevTasks => 
        prevTasks.map(task => ({
          ...task,
          status: existingResults[task.id] ? 'completed' : 'not_started',
          results: existingResults[task.id]
        }))
      );
    }
  }, [existingResults]);

  // Run analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const response = await apiRequest(`/api/script-analysis/${taskId}`, "POST", {
        projectId,
        scriptContent: project?.scriptContent
      });
      return response.json();
    },
    onMutate: ({ taskId }) => {
      // Update task status to running
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'running' } : task
        )
      );
    },
    onSuccess: (data, { taskId }) => {
      // Update task status to completed and store results
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'completed', results: data } : task
        )
      );
      setAnalysisResults(prev => ({ ...prev, [taskId]: data }));
      toast({
        title: "Analysis Complete",
        description: `${tasks.find(t => t.id === taskId)?.name} analysis finished successfully.`
      });
    },
    onError: (error, { taskId }) => {
      // Update task status to error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'error' } : task
        )
      );
      toast({
        title: "Analysis Failed",
        description: "There was an error running the analysis. Please try again.",
        variant: "destructive"
      });
    }
  });

  const selectedTaskData = tasks.find(task => task.id === selectedTask);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 hover:bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-50 hover:bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-50 hover:bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50 hover:bg-gray-100';
    }
  };

  const renderResultsDisplay = (results: any, taskId: string) => {
    if (!results) return null;

    switch (taskId) {
      case 'scene_extraction':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Extracted Scenes</h4>
            {results.scenes?.map((scene: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">Scene {scene.sceneNumber}</h5>
                  <Badge variant="outline">{scene.duration} min</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{scene.location} - {scene.timeOfDay}</p>
                <p className="text-sm">{scene.description}</p>
                {scene.characters?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-500">Characters: </span>
                    <span className="text-xs">{scene.characters.join(', ')}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        );

      case 'character_analysis':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Character Analysis</h4>
            {results.characters?.map((character: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{character.name}</h5>
                  <Badge variant="outline">{character.importance}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Age:</span> {character.age}</div>
                  <div><span className="font-medium">Gender:</span> {character.gender}</div>
                  <div><span className="font-medium">Screen Time:</span> {character.screenTime} min</div>
                </div>
                {character.personality?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-500">Personality: </span>
                    <span className="text-xs">{character.personality.join(', ')}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        );

      default:
        return (
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold mb-4">Analysis Results</h4>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (projectLoading) {
    return <div className="flex items-center justify-center h-96">Loading project...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project?.title}</h1>
                <p className="text-sm text-gray-600">Script Analysis Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline">
                {completedTasks} of {totalTasks} completed
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Analysis Tasks */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {tasks.map((task) => {
                    const IconComponent = task.icon;
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task.id)}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          selectedTask === task.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : getStatusColor(task.status)
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4" />
                              <h3 className="font-medium text-sm">{task.name}</h3>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {task.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedTaskData && (
                      <>
                        <selectedTaskData.icon className="w-6 h-6 text-blue-600" />
                        <div>
                          <CardTitle>{selectedTaskData.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedTaskData.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTaskData?.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    )}
                    {selectedTaskData?.status !== 'completed' && selectedTaskData?.status !== 'running' && (
                      <Button
                        onClick={() => runAnalysisMutation.mutate({ taskId: selectedTask })}
                        disabled={runAnalysisMutation.isPending}
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {runAnalysisMutation.isPending ? 'Running...' : 'Run Analysis'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {selectedTaskData?.status === 'not_started' && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <selectedTaskData.icon className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to analyze {selectedTaskData.name.toLowerCase()}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      {selectedTaskData.description}. This analysis will take approximately {selectedTaskData.estimatedTime}.
                    </p>
                    <Button
                      onClick={() => runAnalysisMutation.mutate({ taskId: selectedTask })}
                      disabled={runAnalysisMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                  </div>
                )}

                {selectedTaskData?.status === 'running' && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analyzing {selectedTaskData.name.toLowerCase()}...
                    </h3>
                    <p className="text-gray-600">
                      This may take {selectedTaskData.estimatedTime}. Please wait while we process your script.
                    </p>
                  </div>
                )}

                {selectedTaskData?.status === 'completed' && selectedTaskData.results && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Analysis Complete</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        {selectedTaskData.name} analysis finished successfully.
                      </p>
                    </div>
                    
                    {/* Results Display */}
                    {renderResultsDisplay(selectedTaskData.results, selectedTask)}
                  </div>
                )}

                {selectedTaskData?.status === 'error' && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <div className="w-8 h-8 bg-red-600 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-gray-600 mb-6">
                      There was an error running the {selectedTaskData.name.toLowerCase()} analysis. Please try again.
                    </p>
                    <Button
                      onClick={() => runAnalysisMutation.mutate({ taskId: selectedTask })}
                      disabled={runAnalysisMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Retry Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}