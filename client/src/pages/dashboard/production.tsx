import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Film, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  BarChart3,
  Zap,
  Target
} from "lucide-react";

export default function ProductionDashboard() {
  const [activeProjects] = useState([
    {
      id: 1,
      title: "Summer Blockbuster",
      status: "In Development",
      budget: "$25M",
      genre: "Action/Adventure",
      progress: 65,
      aiAnalysisComplete: true
    },
    {
      id: 2,
      title: "Indie Drama",
      status: "Pre-Production",
      budget: "$2M",
      genre: "Drama",
      progress: 30,
      aiAnalysisComplete: false
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Production Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, Producer Demo
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Film className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127M</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Analyses</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Scripts analyzed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Project completion
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="talent">Talent</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>
                    Your current projects and their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {project.title}
                            </h3>
                            <Badge variant={project.status === "In Development" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                            {project.aiAnalysisComplete && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                AI Analyzed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>{project.genre}</span>
                            <span>{project.budget}</span>
                            <span>{project.progress}% Complete</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">
                            AI Analysis
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                  <CardDescription>
                    Analytics across all your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budget Utilization</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Timeline Adherence</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ROI Projection</span>
                      <span className="text-sm font-medium text-green-600">+147%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Recent AI analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Summer Blockbuster has 94% commercial success probability
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Identified 12 product placement opportunities
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        VFX budget optimization saved $2.3M
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="talent" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Talent Management</CardTitle>
                <CardDescription>
                  Cast and crew for your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Talent management features coming soon
                  </p>
                  <Button variant="outline">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Project Marketplace</CardTitle>
                <CardDescription>
                  Share your projects with investors and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Marketplace features coming soon
                  </p>
                  <Button variant="outline">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}