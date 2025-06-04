import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Plus,
  FileText, 
  Upload,
  Users, 
  Camera,
  MapPin,
  DollarSign,
  Star,
  Zap,
  BarChart3,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Wand2
} from "lucide-react";
import DashboardLayout from "../dashboard/dashboard-layout";
import ScriptGenerationModal from "@/components/script-generation/script-generation-modal";

interface Project {
  id: number;
  title: string;
  description: string;
  genre: string;
  budget: number;
  timeline: string;
  status: string;
  workflowStatus?: string;
  isPublished: boolean;
  createdAt: string;
  scriptContent?: string;
}

export default function ProductionDashboard() {
  const [, setLocation] = useLocation();
  const [scriptGenerationModalOpen, setScriptGenerationModalOpen] = useState(false);



  // Fetch current user data from session
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication required');
      }
      return response.json();
    },
    retry: false, // Don't retry auth failures
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Redirect to login if authentication fails, but only once
  if (userError && !userLoading) {
    console.log('Authentication error, redirecting to login:', userError.message);
    setLocation('/login');
    return null;
  }

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getProjectProgress = (project: Project) => {
    const workflowStep = project.workflowStatus || 'project_info';
    
    switch (workflowStep) {
      case 'project_info':
        return project.scriptContent ? 25 : 10;
      case 'script_analysis':
        return 50;
      case 'review_results':
        return 75;
      case 'finalize_project':
        return 90;
      default:
        if (project.status === 'completed') return 100;
        return 10;
    }
  };

  const getWorkflowStepName = (project: Project) => {
    const workflowStep = project.workflowStatus || 'project_info';
    
    switch (workflowStep) {
      case 'project_info':
        return 'Project Setup';
      case 'script_analysis':
        return 'Analysis Running';
      case 'review_results':
        return 'Review Phase';
      case 'finalize_project':
        return 'Finalizing';
      default:
        return project.status?.replace('_', ' ') || 'New Project';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'script-uploaded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getNextAction = (project: Project) => {
    // Map workflow status to appropriate action
    const workflowStep = project.workflowStatus || 'project_info';
    
    switch (workflowStep) {
      case 'project_info':
        return {
          action: "Continue Setup",
          icon: Upload,
          description: "Complete project information and script upload",
          link: `/dashboard/script-analysis-workflow?projectId=${project.id}&step=project_info`,
          variant: "default" as const
        };
      case 'script_analysis':
        return {
          action: "Continue Analysis",
          icon: Play,
          description: "Run remaining analysis tools",
          link: `/dashboard/script-analysis-workflow?projectId=${project.id}&step=script_analysis`,
          variant: "default" as const
        };
      case 'review_results':
        return {
          action: "Review Results",
          icon: FileText,
          description: "Review and approve analysis results",
          link: `/dashboard/script-analysis-workflow?projectId=${project.id}&step=review_results`,
          variant: "default" as const
        };
      case 'finalize_project':
        return {
          action: "Finalize Project",
          icon: CheckCircle,
          description: "Complete and publish your project",
          link: `/dashboard/script-analysis-workflow?projectId=${project.id}&step=finalize_project`,
          variant: "default" as const
        };
      default:
        if (project.status === 'completed') {
          return {
            action: "View Project",
            icon: Eye,
            description: "View completed project details",
            link: `/dashboard/projects/${project.id}`,
            variant: "outline" as const
          };
        }
        return {
          action: "Start Analysis",
          icon: Play,
          description: "Begin comprehensive script analysis",
          link: `/dashboard/script-analysis-workflow?projectId=${project.id}`,
          variant: "default" as const
        };
    }
  };

  const analysisFeatures = [
    {
      title: "Character Analysis",
      description: "Extract and analyze all characters from your script",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Scene Breakdown",
      description: "Detailed scene-by-scene analysis and breakdown",
      icon: Camera,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Casting Suggestions",
      description: "AI-powered actor recommendations for each role",
      icon: Star,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Location Scouting",
      description: "Find perfect filming locations with tax incentives",
      icon: MapPin,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "VFX Analysis",
      description: "Identify visual effects requirements and costs",
      icon: Zap,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Product Placement",
      description: "Discover brand partnership opportunities",
      icon: Star,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Financial Planning",
      description: "Generate detailed budget breakdowns and projections",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Reader's Report",
      description: "Comprehensive script analysis and recommendations",
      icon: FileText,
      color: "from-slate-500 to-gray-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="relative px-6 py-12 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Welcome back, {currentUser?.user?.name || 'Producer'}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Upload scripts for AI analysis, complete comprehensive insights, and publish to our marketplace to attract investors and production partners
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/dashboard/script-analysis-workflow">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FileText className="w-5 h-5 mr-2" />
                      Analyze Script
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400"
                    onClick={() => setScriptGenerationModalOpen(true)}
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Script
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Main Action Panes */}
        <div className="px-6 py-8 sm:px-8 lg:px-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              
              {/* Analyze New Script Pane */}
              <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Analyze New Script</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 flex flex-col flex-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    Upload your script for comprehensive AI analysis including character breakdown, casting suggestions, VFX needs, and financial planning.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Analysis Features</span>
                      <span className="text-2xl font-bold text-blue-600">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</span>
                      <span className="text-lg font-semibold text-green-600">2-3 hrs</span>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                  <Link to="/dashboard/script-analysis-workflow">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                      <FileText className="w-4 h-4 mr-2" />
                      Start Analysis Workflow
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Continue Analysis Pane */}
              <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Continue Analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 flex flex-col flex-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete ongoing script analysis, review AI insights, and finalize comprehensive production reports.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</span>
                      <span className="text-2xl font-bold text-orange-600">{projects?.filter(p => p.status === 'in_progress' || p.status === 'draft').length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Complete</span>
                      <span className="text-lg font-semibold text-green-600">{projects?.filter(p => p.scriptContent && p.status !== 'completed' && p.status !== 'published').length || 0}</span>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                  <Link to="/dashboard/projects">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg">
                      <Clock className="w-4 h-4 mr-2" />
                      Continue Projects
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Project Marketplace Pane */}
              <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Project Marketplace</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 flex flex-col flex-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    Publish completed analysis to attract investors, brands, and production partners. Showcase your projects with comprehensive AI insights.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</span>
                      <span className="text-2xl font-bold text-green-600">{projects?.filter(p => p.isPublished || p.status === 'published').length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Publish</span>
                      <span className="text-lg font-semibold text-blue-600">{projects?.filter(p => p.status === 'completed' && !p.isPublished).length || 0}</span>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                  <Link to="/dashboard/projects">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Manage Marketplace
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* Your Projects */}
        <div className="px-6 py-8 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
              <Link to="/dashboard/project-create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{projects.map((project) => {
                  const nextAction = getNextAction(project);
                  const progress = getProjectProgress(project);
                  
                  return (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(project.status)}>
                                {getWorkflowStepName(project)}
                              </Badge>
                              {project.workflowStatus && (
                                <Badge variant="outline" className="text-xs">
                                  Step {project.workflowStatus === 'project_info' ? '1' : 
                                        project.workflowStatus === 'script_analysis' ? '2' :
                                        project.workflowStatus === 'review_results' ? '3' : '4'}/4
                                </Badge>
                              )}
                            </div>
                          </div>
                          {project.isPublished && (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {project.description || `${project.timeline || 'New'} project in ${project.status} stage`}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link to={nextAction.link} className="flex-1">
                            <Button variant={nextAction.variant} size="sm" className="w-full">
                              <nextAction.icon className="w-4 h-4 mr-2" />
                              {nextAction.action}
                            </Button>
                          </Link>
                          <Link to={`/dashboard/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                        
                        {project.scriptContent && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              ✓ Script uploaded - Ready for analysis
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start Your First Project</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Create a new project to begin script analysis, casting suggestions, and production planning
                      </p>
                    </div>
                    <Link to="/dashboard/project-create">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>


      </div>

      {/* Script Generation Modal */}
      <ScriptGenerationModal
        open={scriptGenerationModalOpen}
        onOpenChange={setScriptGenerationModalOpen}
        onScriptGenerated={(script: string) => {
          console.log('Generated script:', script.substring(0, 200) + '...');
          setScriptGenerationModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}