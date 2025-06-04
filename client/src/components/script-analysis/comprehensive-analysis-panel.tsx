import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  MapPin,
  Camera,
  DollarSign,
  Star,
  Zap,
  BarChart3,
  FileText,
  Wand2,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Film,
  Package
} from "lucide-react";

interface AnalysisTask {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  estimatedTime: string;
  results?: any;
}

interface ComprehensiveAnalysisPanelProps {
  projectId: number;
  scriptContent: string;
  onAnalysisComplete: (results: any) => void;
}

export default function ComprehensiveAnalysisPanel({
  projectId,
  scriptContent,
  onAnalysisComplete
}: ComprehensiveAnalysisPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const analysisTasks: AnalysisTask[] = [
    {
      id: 'scene_extraction',
      name: 'Scene Breakdown',
      description: 'Extract and analyze individual scenes, locations, and characters',
      icon: Film,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'character_analysis',
      name: 'Character Analysis',
      description: 'Analyze character relationships, importance, and screen time',
      icon: Users,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'casting_suggestions',
      name: 'AI Casting Director',
      description: 'Generate casting suggestions based on character profiles',
      icon: Star,
      status: 'pending',
      progress: 0,
      estimatedTime: '4-5 minutes'
    },
    {
      id: 'location_analysis',
      name: 'Location Intelligence',
      description: 'Suggest filming locations with tax incentives and logistics',
      icon: MapPin,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'vfx_analysis',
      name: 'VFX Requirements',
      description: 'Identify visual effects needs and complexity estimates',
      icon: Zap,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'product_placement',
      name: 'Brand Marketplace',
      description: 'Identify product placement opportunities for brands',
      icon: Package,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'financial_planning',
      name: 'Financial Projection',
      description: 'Generate budget breakdown and ROI projections',
      icon: DollarSign,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'project_summary',
      name: 'Executive Summary',
      description: 'Create comprehensive reader\'s report and pitch materials',
      icon: FileText,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-3 minutes'
    }
  ];

  const [tasks, setTasks] = useState<AnalysisTask[]>(analysisTasks);

  const runAnalysis = async () => {
    setIsRunning(true);
    
    try {
      // Run tasks sequentially with progress updates
      for (let i = 0; i < tasks.length; i++) {
        setCurrentStep(i);
        
        // Update task status to running
        setTasks(prev => prev.map((task, index) => 
          index === i ? { ...task, status: 'running' as const, progress: 0 } : task
        ));

        // Simulate progress for each task
        const response = await fetch(`/api/script-analysis/${tasks[i].id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            scriptContent,
            taskId: tasks[i].id
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to complete ${tasks[i].name}`);
        }

        const results = await response.json();

        // Update task status to completed
        setTasks(prev => prev.map((task, index) => 
          index === i ? { 
            ...task, 
            status: 'completed' as const, 
            progress: 100,
            results 
          } : task
        ));
      }

      // Notify completion
      const completedTasks = tasks.map(task => ({ ...task, status: 'completed' as const }));
      onAnalysisComplete(completedTasks);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Mark current task as error
      setTasks(prev => prev.map((task, index) => 
        index === currentStep ? { ...task, status: 'error' as const } : task
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getOverallProgress = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Script Analysis Suite
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis powered by advanced AI models
          </p>
        </div>
        
        {!isRunning && tasks.every(task => task.status === 'pending') && (
          <Button onClick={runAnalysis} size="lg" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Start Analysis
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Analysis Progress</CardTitle>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Running" : "Ready"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={getOverallProgress()} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{tasks.filter(t => t.status === 'completed').length} of {tasks.length} completed</span>
              <span>{getOverallProgress()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {tasks.map((task, index) => {
                const TaskIcon = task.icon;
                const isActive = index === currentStep && isRunning;
                
                return (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                          task.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          task.status === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          <TaskIcon className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {task.name}
                          </h4>
                          {getTaskStatusIcon(task.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Est. {task.estimatedTime}</span>
                          {task.status === 'running' && (
                            <span className="text-blue-600">Processing...</span>
                          )}
                        </div>
                        
                        {task.status === 'running' && (
                          <Progress value={task.progress} className="h-1 mt-2" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {tasks.some(task => task.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="casting">Casting</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tasks.filter(t => t.status === 'completed').map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Completed
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="casting" className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Casting suggestions will appear here once analysis is complete.
                </p>
              </TabsContent>
              
              <TabsContent value="locations" className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Location recommendations will appear here once analysis is complete.
                </p>
              </TabsContent>
              
              <TabsContent value="financial" className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Financial projections will appear here once analysis is complete.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}