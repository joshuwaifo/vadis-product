import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  FolderOpen, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Eye,
  BarChart3,
  FileText
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'on-hold': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section with Modern Glass Morphism */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative px-6 py-12 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                      Welcome back, {currentUser?.user?.name || 'Producer'}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                      Manage your productions, analyze scripts with AI, and connect with the perfect brands and investors for your next project.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link to="/dashboard/script-analysis-new">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Plus className="w-5 h-5 mr-2" />
                        New Project
                      </Button>
                    </Link>
                    <Link to="/dashboard/projects">
                      <Button variant="outline" size="lg" className="border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
                        <FolderOpen className="w-5 h-5 mr-2" />
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stats Cards with Glass Effect */}
                <div className="w-full lg:w-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[300px]">
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {stats?.totalProjects || 0}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {stats?.publishedProjects || 0}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/dashboard/script-analysis-new">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Script</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start a new project with AI analysis</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard/marketplace">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-700">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketplace</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find brands and investors</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard/analytics">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-700">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track performance metrics</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard/financial">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-700">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Financial</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Budget and revenue tracking</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Projects Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Projects</h2>
                <Link to="/dashboard/projects">
                  <Button variant="outline">View All Projects</Button>
                </Link>
              </div>

              <div className="grid gap-6">
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-6 w-1/3" />
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-20 ml-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : projects && projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {project.title}
                              </h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                              {project.isPublished && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  Published
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Genre:</span>
                                <span>{project.genre}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${project.budget?.toLocaleString() || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{project.timeline}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Link to={`/projects/${project.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No projects yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Start your first project by uploading a script. Our AI will analyze it and help you find the perfect collaborators.
                          </p>
                        </div>
                        <Link to="/dashboard/script-analysis-new">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Your First Script
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}