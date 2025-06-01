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
  BarChart3
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
      <div className="space-y-12">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome back to <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">VadisAI</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Your production dashboard is ready. Create compelling scripts, secure funding, and bring your vision to life with AI-powered insights.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Link href="/dashboard/projects/new">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-8">
                      <Plus className="mr-2 h-5 w-5" />
                      Start New Project
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="lg" className="border-2">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Projects</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects?.length || 0}</div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {projects?.filter(p => p.status === 'completed').length || 0} completed
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Published Projects</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects?.filter(p => p.isPublished).length || 0}</div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Visible to investors
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Funding Goal</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(projects?.reduce((sum, p) => sum + (p.fundingGoal || 0), 0) || 0)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Across all projects
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-pink-700 dark:text-pink-300">Funds Raised</CardTitle>
              <div className="p-2 bg-pink-100 dark:bg-pink-800/50 rounded-lg">
                <DollarSign className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(projects?.reduce((sum, p) => sum + p.fundingRaised, 0) || 0)}
              </div>
              <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
                Total amount raised
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Projects</h2>
            <Link href="/dashboard/projects/new">
              <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
                <Plus className="mr-2 h-4 w-4" />
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
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
              <div className="relative p-16 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/50 dark:via-purple-900/50 dark:to-pink-900/50 rounded-full flex items-center justify-center mb-8 shadow-lg">
                  <FolderOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl mb-4 text-gray-900 dark:text-white">Ready to create your first project?</CardTitle>
                <CardDescription className="text-lg mb-8 max-w-md mx-auto text-gray-600 dark:text-gray-300">
                  Transform your creative vision into reality. Choose between AI-powered script analysis or intelligent script generation to get started.
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/dashboard/projects/new">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Project
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" size="lg" className="border-2 px-6 py-3">
                      Set Up Profile First
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
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