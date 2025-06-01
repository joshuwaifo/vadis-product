import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FolderOpen, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Eye,
  BarChart3,
  FileText,
  Film,
  Users,
  MapPin,
  Upload,
  Wand2,
  User,
  Settings,
  Briefcase,
  Home,
  Zap,
  Target,
  Calendar,
  Bell,
  Activity,
  Star,
  Award
} from "lucide-react";

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

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalViews: number;
  totalFundingRaised: number;
}

// Navigation Component
function DashboardNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard/production' },
    { id: 'projects', label: 'Projects', icon: Film, href: '/dashboard/production/projects' },
    { id: 'script-tools', label: 'Script Tools', icon: FileText, href: '/dashboard/production/scripts' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-8">
      <nav className="flex space-x-1">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Script Tools Component
function ScriptToolsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Upload Script</CardTitle>
              <CardDescription className="text-gray-600">
                Upload your existing script for AI-powered analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Drop your PDF script here, or</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Supported: PDF, Final Draft, Fountain</span>
              <span>Max 50MB</span>
            </div>
            <Link href="/dashboard/script-analysis-new">
              <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
                Start Analysis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Generate Script</CardTitle>
              <CardDescription className="text-gray-600">
                Create a new script with AI assistance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Film className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Feature Film</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium">TV Episode</span>
              </Button>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-1 text-yellow-500" />
                AI-powered script generation with:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Character development</li>
                <li>• Plot structure analysis</li>
                <li>• Industry-standard formatting</li>
              </ul>
            </div>
            <Link href="/dashboard/script-generator">
              <Button className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-red-600 hover:from-purple-600 hover:via-pink-700 hover:to-red-700">
                Generate Script
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Insights Component
function InsightsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Project Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Investor Interest</span>
              <span className="font-semibold text-green-600">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Project Completion Rate</span>
              <span className="font-semibold text-blue-600">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average ROI</span>
              <span className="font-semibold text-purple-600">145%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Industry Recognition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Top Producer Badge</p>
                <p className="text-sm text-gray-600">Achieved excellence in project delivery</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Innovation Award</p>
                <p className="text-sm text-gray-600">Recognized for creative excellence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductionDashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Production Studio
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Create, analyze, and manage your entertainment projects
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Link href="/dashboard/project-creation">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <DashboardNavigation />

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Projects</span>
              </TabsTrigger>
              <TabsTrigger value="scripts" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Script Tools</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-blue-900">{stats?.totalProjects || 0}</div>
                    )}
                    <p className="text-xs text-blue-600">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Published</CardTitle>
                    <Eye className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-purple-900">{stats?.publishedProjects || 0}</div>
                    )}
                    <p className="text-xs text-purple-600">
                      Available to investors
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Total Views</CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-green-900">{stats?.totalViews || 0}</div>
                    )}
                    <p className="text-xs text-green-600">
                      Investor interest
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">Funding Raised</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold text-yellow-900">
                        ${(stats?.totalFundingRaised || 0).toLocaleString()}
                      </div>
                    )}
                    <p className="text-xs text-yellow-600">
                      Total investment secured
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for production companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/project-creation">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 border-2 hover:border-blue-200">
                        <Film className="w-8 h-8 text-blue-600" />
                        <div className="text-center">
                          <div className="font-medium">Create Project</div>
                          <div className="text-sm text-gray-500">Start a new film or TV project</div>
                        </div>
                      </Button>
                    </Link>

                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 border-2 hover:border-purple-200">
                      <Users className="w-8 h-8 text-purple-600" />
                      <div className="text-center">
                        <div className="font-medium">Find Investors</div>
                        <div className="text-sm text-gray-500">Browse investor marketplace</div>
                      </div>
                    </Button>

                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 border-2 hover:border-green-200">
                      <MapPin className="w-8 h-8 text-green-600" />
                      <div className="text-center">
                        <div className="font-medium">Location Incentives</div>
                        <div className="text-sm text-gray-500">Research filming locations</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>
                      Your recent film and TV projects
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[100px]" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : recentProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                      <p className="text-gray-500 mb-4">Get started by creating your first project</p>
                      <Link href="/dashboard/project-creation">
                        <Button>Create Your First Project</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Film className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{project.title}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{project.projectType}</span>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={project.isPublished ? "default" : "secondary"}>
                              {project.isPublished ? "Published" : project.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>All Projects</CardTitle>
                  <CardDescription>
                    Manage and track all your production projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management</h3>
                    <p className="text-gray-500 mb-4">Detailed project view will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scripts" className="space-y-8">
              <ScriptToolsSection />
            </TabsContent>

            <TabsContent value="insights" className="space-y-8">
              <InsightsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}