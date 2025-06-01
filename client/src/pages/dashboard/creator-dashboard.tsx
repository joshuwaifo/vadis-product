import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  FileText,
  TrendingUp, 
  Eye,
  Users,
  Lightbulb,
  Video,
  Calendar
} from "lucide-react";


interface CreatorProject {
  id: number;
  title: string;
  type: string;
  status: string;
  collaborators: number;
  views: number;
  createdAt: string;
}

interface DashboardStats {
  totalProjects: number;
  activeCollaborations: number;
  totalViews: number;
  monthlyViews: number;
}

export default function CreatorDashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery<CreatorProject[]>({
    queryKey: ['/api/creator/projects'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/creator/stats'],
  });

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600">Manage your creative projects and collaborations</p>
          </div>
          <Link href="/creator/projects/new">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Scripts and concepts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Collaborations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeCollaborations || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                With other creators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Profile visibility
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.monthlyViews || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                This month's growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for content creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/creator/script-generator">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Lightbulb className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Generate Script</div>
                    <div className="text-sm text-gray-500">AI-powered script creation</div>
                  </div>
                </Button>
              </Link>

              <Link href="/creator/collaborations">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="text-center">
                    <div className="font-medium">Find Collaborators</div>
                    <div className="text-sm text-gray-500">Connect with other creators</div>
                  </div>
                </Button>
              </Link>

              <Link href="/creator/portfolio">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                  <Video className="w-8 h-8 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">Manage Portfolio</div>
                    <div className="text-sm text-gray-500">Showcase your work</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>
                Your recent creative projects and scripts
              </CardDescription>
            </div>
            <Link href="/creator/projects">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
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
                <p className="text-gray-500 mb-4">Start creating your first project or script</p>
                <Link href="/creator/projects/new">
                  <Button>Create Your First Project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{project.type}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={project.status === 'completed' ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                      <Link href={`/creator/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}