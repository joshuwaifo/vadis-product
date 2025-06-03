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
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../dashboard/dashboard-layout";

interface Project {
  id: number;
  title: string;
  description: string;
  genre: string;
  budget: number;
  timeline: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
  scriptContent?: string;
}

export default function ProductionDashboard() {
  const [, setLocation] = useLocation();

  // Fetch current user data from session
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Authentication required');
      }
      return response.json();
    },
  });

  // Redirect to login if authentication fails
  if (userError) {
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
    let progress = 10; // Basic project creation
    if (project.scriptContent) progress += 20; // Script uploaded
    // Add more progress indicators based on analysis completion
    return Math.min(progress, 100);
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
    if (!project.scriptContent) {
      return {
        action: "Upload Script",
        icon: Upload,
        description: "Upload your PDF script to begin analysis",
        link: `/dashboard/projects/${project.id}/upload-script`,
        variant: "default" as const
      };
    }
    
    return {
      action: "Run Analysis",
      icon: Play,
      description: "Generate comprehensive script analysis",
      link: `/dashboard/projects/${project.id}/run-analysis`,
      variant: "default" as const
    };
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
                    Transform your scripts into comprehensive production plans with AI-powered analysis, casting suggestions, and financial planning
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/dashboard/project-create">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="w-5 h-5 mr-2" />
                      Start New Project
                    </Button>
                  </Link>
                  <Link to="/dashboard/script-analysis-new">
                    <Button variant="outline" size="lg" className="border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400">
                      <FileText className="w-5 h-5 mr-2" />
                      Quick Script Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="px-6 py-8 sm:px-8 lg:px-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.totalProjects || 0}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats as any)?.publishedProjects || 0}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{((stats as any)?.totalProjects || 0) - ((stats as any)?.publishedProjects || 0)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scripts Analyzed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects?.filter(p => p.scriptContent).length || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

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
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('-', ' ')}
                            </Badge>
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

        {/* AI Analysis Features */}
        <div className="px-6 py-8 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Comprehensive Script Analysis</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our AI-powered platform provides detailed insights across every aspect of your production
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysisFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/dashboard/script-analysis-new">
                <Button size="lg" variant="outline" className="border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400">
                  <FileText className="w-5 h-5 mr-2" />
                  Try Script Analysis Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}