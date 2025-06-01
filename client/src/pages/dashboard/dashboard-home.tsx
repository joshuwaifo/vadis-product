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
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your projects and track your funding progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {projects?.filter(p => p.status === 'completed').length || 0} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Projects</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.filter(p => p.isPublished).length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Visible to investors
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding Goal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(projects?.reduce((sum, p) => sum + (p.fundingGoal || 0), 0) || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(projects?.reduce((sum, p) => sum + p.fundingRaised, 0) || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
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
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">No projects yet</CardTitle>
              <CardDescription className="mb-6">
                Get started by creating your first project. Choose between script analysis or script generation.
              </CardDescription>
              <Link href="/dashboard/projects/new">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your production company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/projects/new">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Plus className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">New Project</div>
                    <div className="text-sm text-gray-500">Start a new script project</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/profile">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Update Profile</div>
                    <div className="text-sm text-gray-500">Manage company details</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/projects">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Eye className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">View All Projects</div>
                    <div className="text-sm text-gray-500">Browse your portfolio</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}