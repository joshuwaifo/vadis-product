/**
 * Production Suite - Redesigned User Experience
 * 
 * Unified workspace for script generation and comprehensive analysis
 * Integrates Cannes demo features with optimized workflows
 */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Wand2,
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
  Download,
  PlusCircle,
  Lightbulb,
  Film,
  TrendingUp,
  Target,
  Award,
  Briefcase,
  Share
} from "lucide-react";
import DashboardLayout from "./dashboard/dashboard-layout";
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

interface AnalysisData {
  scene_extraction?: any[];
  character_analysis?: any[];
  casting_suggestions?: any[];
  location_analysis?: any[];
  vfx_analysis?: any[];
  product_placement?: any[];
  financial_planning?: any;
  project_summary?: any;
}

export default function ProductionSuite() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [scriptGenerationModalOpen, setScriptGenerationModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const endpoints = [
        'scene_extraction',
        'character_analysis',
        'casting_suggestions',
        'location_analysis',
        'vfx_analysis',
        'product_placement',
        'financial_planning',
        'project_summary'
      ];
      
      const results: any = {};
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiRequest(`/api/script-analysis/${endpoint}`, 'POST', { projectId });
          const data = await response.json();
          results[endpoint] = data.data || data;
        } catch (error) {
          console.error(`Error in ${endpoint}:`, error);
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setAnalysisData(data);
      toast({
        title: "Analysis Complete",
        description: "Comprehensive script analysis has been generated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Unable to complete script analysis. Please try again.",
      });
    },
  });

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveTab("project");
  };

  const handleAnalyzeScript = (project: Project) => {
    setSelectedProject(project);
    analysisMutation.mutate(project.id);
    setActiveTab("analysis");
  };

  const downloadAnalysisReport = () => {
    if (!analysisData || !selectedProject) return;
    
    const report = {
      project: selectedProject.title,
      date: new Date().toISOString(),
      ...analysisData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.title}-analysis-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Suite</h1>
              <p className="text-gray-600 dark:text-gray-300">AI-powered script generation and comprehensive analysis</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setScriptGenerationModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Script
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Script
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="project" disabled={!selectedProject}>Project Details</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!selectedProject}>Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats as any)?.totalProjects || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats as any)?.publishedProjects || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Development</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.developmentProjects || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">85%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setScriptGenerationModalOpen(true)}
                    >
                      <Wand2 className="w-6 h-6" />
                      <span>Generate New Script</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setActiveTab("projects")}
                    >
                      <FileText className="w-6 h-6" />
                      <span>Analyze Existing</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                    >
                      <Upload className="w-6 h-6" />
                      <span>Upload Script</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span>View Reports</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Market Trend</p>
                      <p className="text-xs text-blue-700 dark:text-blue-200">Sci-Fi genres are trending 23% higher this quarter</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Budget Optimization</p>
                      <p className="text-xs text-green-700 dark:text-green-200">Consider filming in Georgia for 15% tax incentives</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Projects</h2>
                <Button onClick={() => setScriptGenerationModalOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project: Project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Genre:</span>
                          <span className="font-medium">{project.genre}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Timeline:</span>
                          <span className="font-medium">{project.timeline}</span>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleProjectSelect(project)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAnalyzeScript(project)}
                            disabled={analysisMutation.isPending}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analyze
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Project Details Tab */}
            <TabsContent value="project" className="space-y-6">
              {selectedProject && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                      <p className="text-muted-foreground">{selectedProject.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleAnalyzeScript(selectedProject)}
                        disabled={analysisMutation.isPending}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {analysisMutation.isPending ? 'Analyzing...' : 'Analyze Script'}
                      </Button>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Start Production
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Script Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96 w-full border rounded-md p-4">
                          <pre className="text-sm whitespace-pre-wrap">
                            {selectedProject.scriptContent || 'No script content available'}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge>{selectedProject.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Genre:</span>
                            <span>{selectedProject.genre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Budget:</span>
                            <span>${selectedProject.budget?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span>{selectedProject.timeline}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button className="w-full" size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download Script
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Export PDF
                          </Button>
                          <Button className="w-full" size="sm" variant="outline">
                            <Star className="w-4 h-4 mr-2" />
                            Add to Favorites
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              {selectedProject && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Analysis Results</h2>
                      <p className="text-muted-foreground">{selectedProject.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadAnalysisReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button>
                        <Share className="w-4 h-4 mr-2" />
                        Share Analysis
                      </Button>
                    </div>
                  </div>

                  {analysisMutation.isPending && (
                    <Card>
                      <CardContent className="py-8">
                        <div className="text-center space-y-4">
                          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-primary animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Analyzing Your Script</h3>
                            <p className="text-muted-foreground">
                              Our AI is performing comprehensive analysis including character development, 
                              scene breakdown, casting suggestions, and budget planning.
                            </p>
                          </div>
                          <Progress value={65} className="w-full max-w-sm mx-auto" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisData && Object.keys(analysisData).length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Scene Analysis */}
                      {analysisData.scene_extraction && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Film className="w-5 h-5" />
                              Scene Breakdown
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-2xl font-bold">
                                {analysisData.scene_extraction.length} Scenes
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Estimated runtime: {Math.round(analysisData.scene_extraction.length * 2.5)} minutes
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Character Analysis */}
                      {analysisData.character_analysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Characters
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-2xl font-bold">
                                {analysisData.character_analysis.length} Characters
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Lead roles: {analysisData.character_analysis.filter((c: any) => c.importance === 'lead').length}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Financial Analysis */}
                      {analysisData.financial_planning && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5" />
                              Budget Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-2xl font-bold">
                                ${analysisData.financial_planning.totalBudget?.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ROI: {analysisData.financial_planning.roi}%
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* VFX Analysis */}
                      {analysisData.vfx_analysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              VFX Requirements
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-2xl font-bold">
                                {analysisData.vfx_analysis.length} VFX Shots
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Complexity: Medium to High
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Script Generation Modal */}
        <ScriptGenerationModal
          open={scriptGenerationModalOpen}
          onOpenChange={setScriptGenerationModalOpen}
          onScriptGenerated={(script: string) => {
            console.log('Generated script:', script.substring(0, 200) + '...');
            setScriptGenerationModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          }}
        />
      </div>
    </DashboardLayout>
  );
}