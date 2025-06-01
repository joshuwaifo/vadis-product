import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import DashboardLayout from "./dashboard-layout";

interface Project {
  id: number;
  title: string;
  projectType: string;
  status: string;
  budgetRange?: string;
  fundingGoal?: number;
  fundingRaised: number;
  isPublished: boolean;
  createdAt: string;
}

export default function DashboardHome() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'published': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section with Modern Glass Morphism */}
        <div className="relative h-96 overflow-hidden rounded-3xl mb-8">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy"></div>
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          {/* Glass Morphism Card */}
          <div className="relative h-full flex items-center justify-center p-8">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 lg:p-12 max-w-4xl w-full shadow-2xl">
              <div className="text-center space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black text-white mb-6">
                  Build. Fund. <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Create.</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                  Transform your creative vision into investor-ready projects with AI-powered script analysis and generation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  <Link href="/dashboard/projects/new">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Project
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur">
                      Setup Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Projects */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl leading-none flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-500 text-sm font-medium mb-2">Total Projects</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">{projects?.length || 0}</div>
                <div className="text-blue-600 text-sm font-medium">{projects?.filter(p => p.status === 'completed').length || 0} completed</div>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Published Projects */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl leading-none flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-500 text-sm font-medium mb-2">Published</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">{projects?.filter(p => p.isPublished).length || 0}</div>
                <div className="text-purple-600 text-sm font-medium">Visible to investors</div>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Funding Goal */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl leading-none flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-500 text-sm font-medium mb-2">Funding Goal</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {formatCurrency(projects?.reduce((sum, p) => sum + (p.fundingGoal || 0), 0) || 0)}
                </div>
                <div className="text-green-600 text-sm font-medium">Across all projects</div>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Funds Raised */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl leading-none flex items-center justify-between">
              <div className="flex-1">
                <div className="text-gray-500 text-sm font-medium mb-2">Funds Raised</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {formatCurrency(projects?.reduce((sum, p) => sum + p.fundingRaised, 0) || 0)}
                </div>
                <div className="text-pink-600 text-sm font-medium">Total amount raised</div>
              </div>
              <div className="p-4 bg-pink-100 dark:bg-pink-900/50 rounded-full">
                <DollarSign className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Projects</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your creative portfolio and funding journey</p>
            </div>
            <Link href="/dashboard/projects/new">
              <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                New Project
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.slice(0, 4).map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="capitalize">
                          {project.projectType.replace('_', ' ')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(project.status)} variant="secondary">
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.budgetRange && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Budget: {project.budgetRange}
                        </div>
                      )}
                      
                      {project.fundingGoal && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Funding Progress</span>
                            <span>{Math.round((project.fundingRaised / project.fundingGoal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((project.fundingRaised / project.fundingGoal) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatCurrency(project.fundingRaised)} raised</span>
                            <span>{formatCurrency(project.fundingGoal)} goal</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 animate-gradient-xy"></div>
              <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
              
              <div className="relative p-16 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20">
                      <FolderOpen className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-30"></div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-black text-white mb-6">
                  Your Creative Journey <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Starts Here</span>
                </h3>
                
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Launch your first project and unlock AI-powered tools designed to transform scripts into investor-ready productions
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/dashboard/projects/new">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="mr-2 h-5 w-5" />
                      Start First Project
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 text-left">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Script Analysis</h4>
                    <p className="text-gray-400 text-sm">Upload existing scripts for AI-powered insights and investment readiness evaluation</p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 text-left">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Script Generation</h4>
                    <p className="text-gray-400 text-sm">Transform concepts into full scripts with intelligent AI assistance and market analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800/50">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Quick Actions</CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              Streamline your production workflow with these essential tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/dashboard/projects/new">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-700/50 transition-colors">
                        <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">New Project</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Start script analysis or generation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/profile">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-purple-200 dark:hover:border-purple-700 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-800/50 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-700/50 transition-colors">
                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Company Profile</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Manage your company details</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/projects">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-green-200 dark:hover:border-green-700 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-700/50 transition-colors">
                        <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Project Portfolio</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Browse all your projects</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}