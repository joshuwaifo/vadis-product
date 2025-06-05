// import React, { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Separator } from '@/components/ui/separator';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { 
//   Film, Users, Star, MapPin, Zap, Package, DollarSign, FileText,
//   Play, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Maximize2
// } from 'lucide-react';
// import { apiRequest } from '@/lib/queryClient';
// import { useToast } from '@/hooks/use-toast';
// import StoryboardSceneView from '@/components/script/StoryboardSceneView';

// // Define types directly in this file since the server types are not accessible from client
// interface AnalysisTask {
//   id: string;
//   title: string;
//   description: string;
//   status: 'not_started' | 'in_progress' | 'completed' | 'error';
//   icon: React.ComponentType<{ className?: string }>;
//   estimatedTime: string;
//   completedAt?: Date;
// }

// const ANALYSIS_TASKS: AnalysisTask[] = [
//   {
//     id: 'scene_extraction',
//     title: 'Scene Extraction',
//     description: 'Extract and analyze individual scenes from the script',
//     status: 'not_started',
//     icon: Film,
//     estimatedTime: '2-3 min'
//   },
//   {
//     id: 'storyboard_view',
//     title: 'Storyboard View',
//     description: 'Visual storyboard representation of all scenes',
//     status: 'not_started',
//     icon: Maximize2,
//     estimatedTime: '1-2 min'
//   },
//   {
//     id: 'character_analysis',
//     title: 'Character Analysis',
//     description: 'Analyze characters and their relationships',
//     status: 'not_started',
//     icon: Users,
//     estimatedTime: '3-4 min'
//   },
//   {
//     id: 'casting_suggestions',
//     title: 'Casting Suggestions',
//     description: 'AI-powered actor recommendations for each character',
//     status: 'not_started',
//     icon: Star,
//     estimatedTime: '4-5 min'
//   },
//   {
//     id: 'location_analysis',
//     title: 'Location Analysis',
//     description: 'Identify and suggest filming locations',
//     status: 'not_started',
//     icon: MapPin,
//     estimatedTime: '3-4 min'
//   },
//   {
//     id: 'vfx_analysis',
//     title: 'VFX Analysis',
//     description: 'Identify visual effects requirements and complexity',
//     status: 'not_started',
//     icon: Zap,
//     estimatedTime: '4-5 min'
//   },
//   {
//     id: 'product_placement',
//     title: 'Product Placement',
//     description: 'Identify opportunities for brand partnerships',
//     status: 'not_started',
//     icon: Package,
//     estimatedTime: '2-3 min'
//   },
//   {
//     id: 'financial_planning',
//     title: 'Financial Planning',
//     description: 'Generate budget estimates and financial projections',
//     status: 'not_started',
//     icon: DollarSign,
//     estimatedTime: '5-6 min'
//   },
//   {
//     id: 'project_summary',
//     title: 'Project Summary',
//     description: 'Generate comprehensive project overview and reader\'s report',
//     status: 'not_started',
//     icon: FileText,
//     estimatedTime: '3-4 min'
//   }
// ];

// interface AnalysisDashboardStepProps {
//   workflow?: {
//     projectId: number;
//     currentStep: string;
//     steps: any[];
//   };
//   onNext: () => void;
//   onPrevious: () => void;
// }

// export default function AnalysisDashboardStep({ workflow, onNext, onPrevious }: AnalysisDashboardStepProps) {
//   const [tasks, setTasks] = useState<AnalysisTask[]>([...ANALYSIS_TASKS]);
//   const [selectedTask, setSelectedTask] = useState<string | null>(null);
//   const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
//   const [showStoryboard, setShowStoryboard] = useState(false);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // Fetch project data
//   const { data: project } = useQuery({
//     queryKey: [`/api/projects/${workflow?.projectId}`],
//     enabled: !!workflow?.projectId
//   });

//   // Debug workflow data
//   console.log('Workflow data:', workflow);
//   console.log('Project ID from workflow:', workflow?.projectId);

//   const analysisInProgress = tasks.some(task => task.status === 'in_progress');

//   // Create mutation for running individual analysis
//   const runAnalysisMutation = useMutation({
//     mutationFn: async ({ taskId }: { taskId: string }) => {
//       // Use project ID from either workflow or project data
//       const projectId = workflow?.projectId || project?.id;
      
//       console.log('Starting analysis for task:', taskId, 'Project ID:', projectId, 'Sources:', { 
//         workflowProjectId: workflow?.projectId, 
//         projectId: project?.id 
//       });
      
//       // Update task status to in_progress
//       setTasks(prev => prev.map(task => 
//         task.id === taskId ? { ...task, status: 'in_progress' as const } : task
//       ));

//       try {
//         const response = await apiRequest(`/api/script-analysis/${taskId}`, 'POST', {
//           projectId: projectId
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//         }
        
//         const data = await response.json();
//         console.log('Analysis response data:', data);
//         return data;
//       } catch (error) {
//         console.error('API request failed:', error);
//         throw error;
//       }
//     },
//     onSuccess: (data, { taskId }) => {
//       console.log('Analysis successful for task:', taskId, 'Data:', data);
      
//       // Update task status to completed
//       setTasks(prev => prev.map(task => 
//         task.id === taskId ? { ...task, status: 'completed' as const, completedAt: new Date() } : task
//       ));
      
//       // Store results
//       setAnalysisResults(prev => ({ ...prev, [taskId]: data }));
      
//       // Auto-select the completed task to show results
//       setSelectedTask(taskId);
      
//       toast({
//         title: "Analysis Complete",
//         description: `${tasks.find(t => t.id === taskId)?.title} has been completed successfully.`
//       });
//     },
//     onError: (error, { taskId }) => {
//       console.error('Full analysis error:', error);
//       console.error('Error details:', {
//         message: error?.message,
//         stack: error?.stack,
//         response: error?.response
//       });
      
//       // Update task status to error
//       setTasks(prev => prev.map(task => 
//         task.id === taskId ? { ...task, status: 'error' as const } : task
//       ));
      
//       // Parse error message
//       let errorMessage = 'An unexpected error occurred during analysis.';
      
//       if (error?.message) {
//         errorMessage = error.message;
//       } else if (typeof error === 'string') {
//         errorMessage = error;
//       }
      
//       toast({
//         title: "Analysis Failed",
//         description: `${tasks.find(t => t.id === taskId)?.title}: ${errorMessage}`,
//         variant: "destructive"
//       });
//     }
//   });

//   const runAnalysis = (taskId: string) => {
//     runAnalysisMutation.mutate({ taskId });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case 'in_progress':
//         return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
//       case 'error':
//         return <AlertCircle className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-400" />;
//     }
//   };

//   const renderAnalysisContent = () => {
//     if (!selectedTask) {
//       return (
//         <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
//           <div className="relative">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-3xl opacity-50"></div>
//             <div className="relative p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
//               <Play className="h-20 w-20 text-blue-600 dark:text-blue-400" />
//             </div>
//           </div>
//           <div className="space-y-3 max-w-md">
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready for AI Analysis</h3>
//             <p className="text-muted-foreground text-lg">
//               Select any analysis tool above to unlock powerful insights about your screenplay
//             </p>
//             <div className="flex items-center justify-center gap-2 mt-4">
//               <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
//               <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
//               <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     const task = tasks.find(t => t.id === selectedTask);
//     const results = analysisResults[selectedTask];

//     if (!task) return null;

//     if (task.status === 'in_progress') {
//       return (
//         <div className="flex flex-col items-center justify-center h-full text-center">
//           <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
//           <h3 className="text-lg font-semibold mb-2">Running {task.title}</h3>
//           <p className="text-muted-foreground mb-4">
//             AI is analyzing your script. This may take {task.estimatedTime}.
//           </p>
//           <Progress value={50} className="w-64" />
//         </div>
//       );
//     }

//     if (task.status === 'error') {
//       return (
//         <div className="flex flex-col items-center justify-center h-full text-center">
//           <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
//           <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
//           <p className="text-muted-foreground mb-4">
//             There was an error running {task.title}. Please try again.
//           </p>
//           <Button onClick={() => runAnalysis(selectedTask)} variant="outline">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Retry Analysis
//           </Button>
//         </div>
//       );
//     }

//     if (task.status === 'completed' && results) {
//       return (
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">{task.title} Results</h3>
//               <p className="text-sm text-muted-foreground">
//                 Completed {task.completedAt?.toLocaleString()}
//               </p>
//             </div>
//             <Badge variant="secondary" className="bg-green-100 text-green-800">
//               <CheckCircle className="h-3 w-3 mr-1" />
//               Completed
//             </Badge>
//           </div>
          
//           <Separator />
          
//           <div className="space-y-4">
//             {renderTaskResults(selectedTask, results)}
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <task.icon className="h-16 w-16 text-muted-foreground mb-4" />
//         <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
//         <p className="text-muted-foreground mb-4">{task.description}</p>
//         <p className="text-sm text-muted-foreground mb-4">
//           Estimated time: {task.estimatedTime}
//         </p>
//         <Button onClick={() => runAnalysis(selectedTask)}>
//           <Play className="h-4 w-4 mr-2" />
//           Run Analysis
//         </Button>
//       </div>
//     );
//   };

//   const renderTaskResults = (taskId: string, results: any) => {
//     switch (taskId) {
//       case 'scene_extraction':
//         return (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="grid grid-cols-3 gap-6 text-center flex-1">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-4">
//                   <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.totalScenes || 0}</div>
//                   <div className="text-sm text-muted-foreground">Total Scenes</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-4">
//                   <div className="text-3xl font-bold text-green-600 dark:text-green-400">{results.estimatedDuration || 0}</div>
//                   <div className="text-sm text-muted-foreground">Est. Minutes</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-4">
//                   <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{results.scenes?.length || 0}</div>
//                   <div className="text-sm text-muted-foreground">Extracted</div>
//                 </div>
//               </div>
              
//               {results.scenes && results.scenes.length > 0 && (
//                 <Button 
//                   onClick={() => setShowStoryboard(true)}
//                   className="ml-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3"
//                 >
//                   <Maximize2 className="h-4 w-4 mr-2" />
//                   Storyboard View
//                 </Button>
//               )}
//             </div>

//             {results.scenes && results.scenes.length > 0 && (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h4 className="text-lg font-semibold">All Scenes</h4>
//                   <Badge variant="outline" className="text-xs">
//                     {results.scenes.length} scenes extracted
//                   </Badge>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {results.scenes.map((scene: any, index: number) => (
//                     <Card key={index} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
//                       <CardContent className="p-4">
//                         <div className="flex justify-between items-start mb-3">
//                           <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
//                             Scene {scene.sceneNumber}
//                           </Badge>
//                           <div className="text-right">
//                             <div className="text-sm font-medium">{scene.duration}min</div>
//                             <div className="text-xs text-muted-foreground">Pages {scene.pageStart}-{scene.pageEnd}</div>
//                           </div>
//                         </div>
                        
//                         <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
//                           {scene.location} - {scene.timeOfDay}
//                         </h5>
                        
//                         <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
//                           {scene.description}
//                         </p>
                        
//                         {scene.characters && scene.characters.length > 0 && (
//                           <div className="flex flex-wrap gap-1 mb-2">
//                             {scene.characters.slice(0, 3).map((character: string, idx: number) => (
//                               <Badge key={idx} variant="outline" className="text-xs">
//                                 {character}
//                               </Badge>
//                             ))}
//                             {scene.characters.length > 3 && (
//                               <Badge variant="outline" className="text-xs">
//                                 +{scene.characters.length - 3} more
//                               </Badge>
//                             )}
//                           </div>
//                         )}
                        

//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>

//               </div>
//             )}
//           </div>
//         );

//       case 'storyboard_view':
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h3 className="text-xl font-semibold mb-4">Storyboard View</h3>
//               <p className="text-muted-foreground mb-6">
//                 Visual representation of all scenes in your script
//               </p>
              
//               {/* Storyboard grid would go here */}
//               <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 rounded-xl p-8 border-2 border-dashed border-blue-200 dark:border-blue-800">
//                 <Maximize2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
//                 <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
//                   Storyboard Feature Coming Soon
//                 </h4>
//                 <p className="text-blue-600 dark:text-blue-400">
//                   Visual storyboard representation will be available here
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
      
//       default:
//         return (
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <pre className="text-sm overflow-auto max-h-96">
//               {JSON.stringify(results, null, 2)}
//             </pre>
//           </div>
//         );
//     }
//   };

//   const completedTasks = tasks.filter(task => task.status === 'completed').length;
//   const totalTasks = tasks.length;
//   const progressPercentage = (completedTasks / totalTasks) * 100;

//   // Show storyboard view if enabled
//   if (showStoryboard && selectedTask === 'scene_extraction' && analysisResults.scene_extraction?.scenes) {
//     return (
//       <StoryboardSceneView
//         scenes={analysisResults.scene_extraction.scenes}
//         onClose={() => setShowStoryboard(false)}
//         projectTitle={project?.title || 'Script Analysis'}
//       />
//     );
//   }

//   return (
//     <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
//         {/* Modern Grid Layout */}
//         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
//           {/* Analysis Tools - Compact Cards */}
//           <div className="xl:col-span-1 space-y-4">
//             <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
//               <div className="mb-4">
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
//                   <Film className="h-5 w-5 text-blue-600" />
//                   Analysis Tools
//                 </h2>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                   Extract insights from your script
//                 </p>
//               </div>
              
//               {/* Progress Bar */}
//               <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium">Progress</span>
//                   <span className="text-sm text-gray-600">{completedTasks}/{totalTasks}</span>
//                 </div>
//                 <Progress value={progressPercentage} className="h-2" />
//               </div>
              
//               {/* Analysis Tools List */}
//               <div className="space-y-2">
//                 {tasks.map((task) => (
//                   <div
//                     key={task.id}
//                     className={`p-3 rounded-lg border transition-all cursor-pointer ${
//                       selectedTask === task.id 
//                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
//                     }`}
//                     onClick={() => setSelectedTask(task.id)}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center gap-2">
//                         <task.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//                         <span className="text-sm font-medium">{task.title}</span>
//                       </div>
//                       {getStatusIcon(task.status)}
//                     </div>
                    
//                     <Button
//                       size="sm"
//                       variant={task.status === 'completed' ? 'default' : 'outline'}
//                       className="w-full text-xs"
//                       disabled={task.status === 'in_progress' || analysisInProgress}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         runAnalysis(task.id);
//                       }}
//                     >
//                       {task.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
//                       {task.status === 'completed' ? 'View Results' : 
//                        task.status === 'in_progress' ? 'Processing...' : 'Start Analysis'}
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Results Panel - Takes remaining space */}
//           <div className="xl:col-span-3">
//             <Card className="h-[calc(100vh-12rem)] border border-gray-200 dark:border-gray-700">
//               <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <FileText className="h-5 w-5 text-blue-600" />
//                     <div>
//                       <CardTitle className="text-lg font-semibold">Analysis Results</CardTitle>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         {selectedTask ? tasks.find(t => t.id === selectedTask)?.title || 'Select a tool to view results' : 'Select a tool to view results'}
//                       </p>
//                     </div>
//                   </div>
//                   {selectedTask && tasks.find(t => t.id === selectedTask)?.status === 'completed' && (
//                     <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
//                       <CheckCircle className="h-3 w-3 mr-1" />
//                       Complete
//                     </Badge>
//                   )}
//                 </div>
//               </CardHeader>
//               <CardContent className="p-0 h-[calc(100%-5rem)]">
//                 <ScrollArea className="h-full">
//                   <div className="p-6">
//                     {renderAnalysisContent()}
//                   </div>
//                 </ScrollArea>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Navigation - Full Width */}
//         <div className="w-full mt-6">
//           <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
//             <Button 
//               variant="outline" 
//               onClick={onPrevious}
//               className="flex items-center gap-2 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//               Previous: Project Info
//             </Button>
            
//             <div className="flex items-center gap-4">
//               {completedTasks > 0 && (
//                 <div className="text-center">
//                   <div className="text-sm text-muted-foreground">Analysis Progress</div>
//                   <div className="text-lg font-semibold text-green-600 dark:text-green-400">
//                     {completedTasks} of {totalTasks} Complete
//                   </div>
//                 </div>
//               )}
              
//               <Button 
//                 onClick={onNext} 
//                 disabled={completedTasks === 0}
//                 className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Next: Finalize Project
//                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//                 {completedTasks > 0 && (
//                   <Badge className="ml-2 bg-white/20 text-white border-white/30">
//                     {completedTasks} Complete
//                   </Badge>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  Play, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Maximize2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import StoryboardSceneView from '@/components/script/StoryboardSceneView';

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

// Ensure Scene type matches the backend response for scenes
interface SceneFromAPI {
  id: number; // Assuming DB id is number
  sceneNumber: number;
  location: string;
  timeOfDay: string | null;
  description: string | null;
  characters: string[] | null;
  content: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  duration: number | null;
  vfxNeeds: string[] | null;
  productPlacementOpportunities: string[] | null;
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
  // ... other tasks remain the same
  {
    id: 'storyboard_view', // This might be less of a task and more of a view based on scene_extraction
    title: 'Storyboard View',
    description: 'Visual storyboard representation of all scenes',
    status: 'not_started', 
    icon: Maximize2,
    estimatedTime: 'N/A' // Depends on scene extraction
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
    steps: any[]; // Define more specific step type if available
  };
  onNext: () => void;
  onPrevious: () => void;
}

export default function AnalysisDashboardStep({ workflow, onNext, onPrevious }: AnalysisDashboardStepProps) {
  const [tasks, setTasks] = useState<AnalysisTask[]>([...ANALYSIS_TASKS]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [showStoryboard, setShowStoryboard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activeProjectId = workflow?.projectId;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const response = await apiRequest(`/api/projects/${activeProjectId}`, "GET");
      return response.json();
    },
    enabled: !!activeProjectId,
  });


  useEffect(() => {
    // Pre-select scene extraction if it's the default or first task
    if (!selectedTask && tasks.length > 0) {
        // Optionally, if we want to show scene extraction by default if already completed.
        // const sceneExtractionTask = tasks.find(t => t.id === 'scene_extraction');
        // if (sceneExtractionTask?.status === 'completed') {
        //     setSelectedTask('scene_extraction');
        //     // Potentially fetch existing results here if not passed via props or global state
        // }
    }
  }, [tasks, selectedTask]);


  const runAnalysisMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!activeProjectId) {
        throw new Error("Project ID is missing.");
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'in_progress' as const } : task
      ));

      const response = await apiRequest(`/api/script-analysis/${taskId}`, 'POST', {
        projectId: activeProjectId
      });

      return { data: await response.json(), taskId }; // Pass taskId along
    },
    onSuccess: ({ data, taskId }) => { // Destructure data and taskId here
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' as const, completedAt: new Date() } : task
      ));

      setAnalysisResults(prev => ({ ...prev, [taskId]: data }));
      setSelectedTask(taskId); 

      toast({
        title: "Analysis Complete",
        description: `${tasks.find(t => t.id === taskId)?.title} has been completed successfully.`
      });
    },
    onError: (error: any, { taskId }) => { // Destructure taskId here
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'error' as const } : task
      ));

      toast({
        title: "Analysis Failed",
        description: `${tasks.find(t => t.id === taskId)?.title}: ${error.message || 'An unexpected error occurred.'}`,
        variant: "destructive"
      });
    }
  });

  const runAnalysis = (taskId: string) => {
    if (taskId === 'storyboard_view') {
        const sceneExtractionResults = analysisResults['scene_extraction'];
        if (sceneExtractionResults && sceneExtractionResults.scenes && sceneExtractionResults.scenes.length > 0) {
            setShowStoryboard(true);
        } else {
            toast({
                title: "Scene Extraction Required",
                description: "Please run Scene Extraction first to view the storyboard.",
                variant: "destructive",
            });
        }
        return;
    }
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

  const renderTaskResults = (taskId: string, results: any) => {
    switch (taskId) {
      case 'scene_extraction':
        const scenesData = results?.scenes as SceneFromAPI[] | undefined;
        if (!scenesData || scenesData.length === 0) {
          return (
            <div className="text-center py-8">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No scenes were extracted, or analysis is pending.</p>
              <Button onClick={() => runAnalysis('scene_extraction')} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Scene Extraction
              </Button>
            </div>
          );
        }
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
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{scenesData.length}</div>
                  <div className="text-sm text-muted-foreground">Extracted</div>
                </div>
              </div>

              {scenesData && scenesData.length > 0 && (
                <Button 
                  onClick={() => setShowStoryboard(true)}
                  className="ml-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Storyboard View
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">All Scenes</h4>
                <Badge variant="outline" className="text-xs">
                  {scenesData.length} scenes extracted
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenesData.map((scene, index) => (
                  <Card key={scene.id || index} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                       <div className="flex justify-between items-start mb-1">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Scene {scene.sceneNumber}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{scene.duration || 'N/A'} min</div>
                            <div className="text-xs text-muted-foreground">
                              Pages {scene.pageStart || 'N/A'}-{scene.pageEnd || 'N/A'}
                            </div>
                          </div>
                        </div>
                         <CardTitle className="text-base truncate">{scene.location}</CardTitle>
                         {scene.timeOfDay && <CardDescription className="text-xs">{scene.timeOfDay}</CardDescription>}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                        {scene.description || scene.content?.substring(0,150) + (scene.content && scene.content.length > 150 ? "..." : "")}
                      </p>
                      {scene.characters && scene.characters.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {scene.characters.slice(0, 3).map((character: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {character}
                            </Badge>
                          ))}
                          {scene.characters.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{scene.characters.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'storyboard_view': // This case might not receive direct 'results'
        return (
            <div className="text-center py-8">
              <Maximize2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Storyboard view opens in a modal.</p>
              <p className="text-sm text-muted-foreground">Ensure Scene Extraction is complete first.</p>
            </div>
          );

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96">
              {results ? JSON.stringify(results, null, 2) : `No results available for ${taskId} yet, or analysis pending.`}
            </pre>
          </div>
        );
    }
  };

  const renderAnalysisContent = () => {
    const task = tasks.find(t => t.id === selectedTask);

    if (!selectedTask || !task) {
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
              Select any analysis tool to unlock powerful insights about your screenplay.
            </p>
          </div>
        </div>
      );
    }


    if (task.status === 'in_progress') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Running {task.title}</h3>
          <p className="text-muted-foreground mb-4">
            AI is analyzing your script. This may take {task.estimatedTime}.
          </p>
          <Progress value={50} className="w-64" /> {/* Indeterminate or estimated progress */}
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

    // For 'completed' or 'not_started' tasks, show their specific content or trigger
    if (task.status === 'completed' && analysisResults[selectedTask]) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{task.title} Results</h3>
              <p className="text-sm text-muted-foreground">
                Completed {task.completedAt?.toLocaleString()}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
          <Separator />
          <div className="space-y-4">
            {renderTaskResults(selectedTask, analysisResults[selectedTask])}
          </div>
        </div>
      );
    }

    // Default for 'not_started' or if results somehow missing for 'completed'
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <task.icon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <p className="text-muted-foreground mb-4">{task.description}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Estimated time: {task.estimatedTime}
        </p>
        <Button 
          onClick={() => runAnalysis(selectedTask)} 
          disabled={runAnalysisMutation.isPending && runAnalysisMutation.variables?.taskId === selectedTask}
        >
          {runAnalysisMutation.isPending && runAnalysisMutation.variables?.taskId === selectedTask ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    );
  };


  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasksCount = tasks.filter(t => t.id !== 'storyboard_view').length; // Exclude storyboard view as a "task" for progress
  const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  // Show storyboard view if enabled
  if (showStoryboard && analysisResults.scene_extraction?.scenes) {
    // Ensure scenes passed to StoryboardSceneView match its expected prop type
    const storyboardScenes = analysisResults.scene_extraction.scenes.map((s: SceneFromAPI) => ({
        id: String(s.id), // StoryboardSceneView expects id as string
        sceneNumber: s.sceneNumber,
        location: s.location || 'Unknown',
        timeOfDay: s.timeOfDay || 'N/A',
        description: s.description || 'No description',
        characters: s.characters || [],
        content: s.content || '',
        pageStart: s.pageStart || 0,
        pageEnd: s.pageEnd || 0,
        duration: s.duration || 0,
        vfxNeeds: s.vfxNeeds || [],
        productPlacementOpportunities: s.productPlacementOpportunities || [],
    }));

    return (
      <StoryboardSceneView
        scenes={storyboardScenes}
        onClose={() => setShowStoryboard(false)}
        projectTitle={project?.title || 'Script Analysis'}
      />
    );
  }

  const analysisInProgress = tasks.some(task => task.status === 'in_progress');

  if (projectLoading) {
    return (
        <div className="p-6">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
        </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-var(--header-height,0px))] bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-4">
            <Card className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Film className="h-5 w-5 text-blue-600" />
                  Analysis Tools
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Extract insights from: <span className="font-medium text-blue-700 dark:text-blue-300">{project?.title || "your script"}</span>
                </p>
              </div>

              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{completedTasksCount} of {totalTasksCount} tasks complete</p>
              </div>

              <ScrollArea className="h-[calc(100vh-26rem)] pr-3 -mr-3"> {/* Adjusted height and padding for scrollbar */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                        selectedTask === task.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-md' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      }`}
                      onClick={() => {
                        if (task.id === 'storyboard_view') {
                            runAnalysis(task.id); // Special handling for storyboard view
                        } else {
                            setSelectedTask(task.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <task.icon className={`h-4 w-4 ${selectedTask === task.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'}`} />
                          <span className={`text-sm font-medium ${selectedTask === task.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{task.title}</span>
                        </div>
                        {getStatusIcon(task.status)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mb-2">{task.description}</p>

                      {task.id !== 'storyboard_view' && ( // Don't show button for storyboard view itself here
                        <Button
                          size="xs" // Smaller button
                          variant={task.status === 'completed' ? 'ghost' : 'outline'}
                          className="w-full text-xs"
                          disabled={(task.status === 'in_progress' || analysisInProgress) && runAnalysisMutation.variables?.taskId !== task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            runAnalysis(task.id);
                          }}
                        >
                          {task.status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                          {task.status === 'completed' ? 'View Results' : 
                           task.status === 'in_progress' ? 'Processing...' : 'Start Analysis'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="xl:col-span-3">
            <Card className="h-[calc(100vh-10rem)] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedTask && tasks.find(t => t.id === selectedTask) ? 
                      React.createElement(tasks.find(t => t.id === selectedTask)!.icon, {className: "h-5 w-5 text-blue-600"})
                      : <FileText className="h-5 w-5 text-blue-600" />
                    }
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedTask ? tasks.find(t => t.id === selectedTask)?.title || 'Analysis Results' : 'Analysis Results'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTask ? tasks.find(t => t.id === selectedTask)?.description || 'Detailed view of the selected analysis.' : 'Select a tool to view results.'}
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
              <CardContent className="p-0 h-[calc(100%-5.5rem)]"> {/* Adjusted height */}
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {renderAnalysisContent()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full mt-8">
          <div className="flex justify-between items-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              className="flex items-center gap-2 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous: Project Setup
            </Button>

            <div className="flex items-center gap-4">
              <Button 
                onClick={onNext} 
                disabled={progressPercentage < 100 || analysisInProgress}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Next: Review & Finalize
                <ArrowRight className="h-4 w-4" />
                {progressPercentage >= 100 && (
                  <Badge className="ml-2 bg-white/20 text-white border-white/30">
                    Ready
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