import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
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
  Wand2,
  ArrowLeft,
  RefreshCw,
  Download,
  Share
} from "lucide-react";
import DashboardLayout from "../dashboard/dashboard-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: string;
  results?: any;
}

interface ProjectAnalysis {
  project: {
    id: number;
    title: string;
    userId: number;
    scriptContent: string;
  };
  scenes: any[];
  characters: any[];
  financial: any;
  casting: any[];
  locations: any[];
  vfx: any[];
  productPlacement: any[];
  summary: any;
}

export default function ScriptAnalysisDashboard() {
  const [, setLocation] = useLocation();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string>('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get project ID from URL or latest project
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('project');
    if (id) {
      setProjectId(parseInt(id));
    }
  }, []);

  // Fetch project analysis data from Cannes demo backend
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['script-analysis', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project selected');
      const response = await fetch(`/api/projects/${projectId}/analysis`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      return response.json();
    },
    enabled: !!projectId
  });

  // Fetch available projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiRequest('/api/projects', 'GET');
      return response.json();
    }
  });

  // Start analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: async (features: string[]) => {
      return apiRequest(`/api/projects/${projectId}/analyze`, 'POST', { features });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "Your script analysis has begun. This may take several minutes."
      });
      queryClient.invalidateQueries({ queryKey: ['script-analysis', projectId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis"
      });
    }
  });

  const analysisFeatures = [
    {
      id: 'scenes',
      name: 'Scene Analysis',
      description: 'Extract and analyze all scenes from your script',
      icon: Camera,
      estimatedTime: '2-3 min'
    },
    {
      id: 'characters',
      name: 'Character Analysis',
      description: 'Detailed character breakdown and relationships',
      icon: Users,
      estimatedTime: '3-5 min'
    },
    {
      id: 'casting',
      name: 'Casting Suggestions',
      description: 'AI-powered actor recommendations for each role',
      icon: Star,
      estimatedTime: '5-8 min'
    },
    {
      id: 'locations',
      name: 'Location Scouting',
      description: 'Find perfect filming locations with tax incentives',
      icon: MapPin,
      estimatedTime: '4-6 min'
    },
    {
      id: 'vfx',
      name: 'VFX Analysis',
      description: 'Identify visual effects requirements and costs',
      icon: Zap,
      estimatedTime: '3-4 min'
    },
    {
      id: 'product_placement',
      name: 'Product Placement',
      description: 'Discover brand partnership opportunities',
      icon: BarChart3,
      estimatedTime: '2-3 min'
    },
    {
      id: 'financial',
      name: 'Financial Planning',
      description: 'Generate detailed budget and revenue projections',
      icon: DollarSign,
      estimatedTime: '4-7 min'
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'Comprehensive project overview and recommendations',
      icon: FileText,
      estimatedTime: '2-3 min'
    }
  ];

  const getFeatureStatus = (featureId: string): AnalysisFeature => {
    const baseFeature = analysisFeatures.find((f: AnalysisFeature) => f.id === featureId)!;
    const analysisFeature = analysis?.features?.find((f: any) => f.id === featureId);
    
    // Check if we have results from the Cannes demo backend
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    let results = null;
    
    if (analysis?.project) {
      switch (featureId) {
        case 'scene-breakdown':
          if (analysis.scenes && analysis.scenes.length > 0) {
            status = 'completed';
            results = analysis.scenes;
          }
          break;
        case 'character-analysis':
          if (analysis.characters && analysis.characters.length > 0) {
            status = 'completed';
            results = analysis.characters;
          }
          break;
        case 'financial-planning':
          if (analysis.financial) {
            status = 'completed';
            results = analysis.financial;
          }
          break;
        case 'casting-suggestions':
          if (analysis.casting && analysis.casting.length > 0) {
            status = 'completed';
            results = analysis.casting;
          }
          break;
        case 'location-scouting':
          if (analysis.locations && analysis.locations.length > 0) {
            status = 'completed';
            results = analysis.locations;
          }
          break;
        case 'vfx-analysis':
          if (analysis.vfx && analysis.vfx.length > 0) {
            status = 'completed';
            results = analysis.vfx;
          }
          break;
        case 'product-placement':
          if (analysis.productPlacement && analysis.productPlacement.length > 0) {
            status = 'completed';
            results = analysis.productPlacement;
          }
          break;
        case 'readers-report':
          if (analysis.summary) {
            status = 'completed';
            results = analysis.summary;
          }
          break;
      }
    }
    
    return {
      ...baseFeature,
      status: analysisFeature?.status || status,
      progress: analysisFeature?.progress || (status === 'completed' ? 100 : 0),
      results: analysisFeature?.results || results
    };
  };

  const handleStartAnalysis = () => {
    const selectedFeatures = analysisFeatures.map(f => f.id);
    startAnalysisMutation.mutate(selectedFeatures);
  };

  const handleSelectProject = (id: number) => {
    setProjectId(id);
    setLocation(`/dashboard/script-analysis?project=${id}`);
  };

  if (!projectId) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Script Analysis Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Select a project to view comprehensive AI-powered script analysis
            </p>
          </div>

          <div className="grid gap-4">
            {Array.isArray(projects) && projects.map((project: any) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectProject(project.id)}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {project.logline || 'No logline provided'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{project.status}</Badge>
                        {project.scriptContent && (
                          <Badge variant="secondary">Script Uploaded</Badge>
                        )}
                      </div>
                    </div>
                    <Button>
                      <Eye className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (analysisLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setProjectId(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {analysis?.projectTitle || 'Script Analysis'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive AI-powered script analysis and insights
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share Analysis
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Analysis Progress</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {analysis?.analysisProgress || 0}% Complete
                </span>
                {analysis?.analysisProgress === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={analysis?.analysisProgress || 0} className="mb-4" />
            
            {!analysis?.analysisProgress || analysis.analysisProgress === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Ready to analyze your script with AI-powered insights
                </p>
                <Button 
                  onClick={handleStartAnalysis}
                  disabled={startAnalysisMutation.isPending}
                  size="lg"
                >
                  {startAnalysisMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Starting Analysis...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start Complete Analysis
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {/* Quick Stats */}
            {analysis?.metadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.totalScenes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Scenes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.totalCharacters}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.metadata.estimatedShootDays || 'TBD'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Shoot Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysis.metadata.estimatedBudget ? 
                      `$${(analysis.metadata.estimatedBudget / 1000000).toFixed(1)}M` : 
                      'TBD'
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Budget</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysisFeatures.map((feature) => {
            const featureStatus = getFeatureStatus(feature.id);
            const IconComponent = feature.icon;
            
            return (
              <Card key={feature.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedFeature(feature.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      {featureStatus.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {featureStatus.status === 'processing' && (
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      {featureStatus.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {feature.description}
                  </p>
                  
                  {featureStatus.status === 'processing' && (
                    <Progress value={featureStatus.progress} className="mb-2" />
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Badge variant={
                      featureStatus.status === 'completed' ? 'default' :
                      featureStatus.status === 'processing' ? 'secondary' :
                      featureStatus.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {featureStatus.status === 'pending' ? 'Ready' :
                       featureStatus.status === 'processing' ? 'Processing' :
                       featureStatus.status === 'completed' ? 'Complete' : 'Failed'}
                    </Badge>
                    {feature.estimatedTime && featureStatus.status === 'pending' && (
                      <span className="text-xs text-gray-500">
                        ~{feature.estimatedTime}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analysis Results */}
        {analysis?.analysisProgress > 0 && (
          <Tabs value={selectedFeature} onValueChange={setSelectedFeature}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scenes">Scenes</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="casting">Casting</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="vfx">VFX</TabsTrigger>
              <TabsTrigger value="product_placement">Products</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Complete analysis results will appear here as processing finishes.
                        Each section will update in real-time as the AI agents complete their work.
                      </AlertDescription>
                    </Alert>
                    
                    {analysis?.metadata && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Production Complexity</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>VFX Complexity:</span>
                              <Badge variant="outline">
                                {analysis.metadata.vfxComplexityLevel || 'Analyzing...'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Casting Complexity:</span>
                              <Badge variant="outline">
                                {analysis.metadata.castingComplexity || 'Analyzing...'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Production Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Estimated Shoot Days:</span>
                              <span className="font-medium">
                                {analysis.metadata.estimatedShootDays || 'Calculating...'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estimated Budget:</span>
                              <span className="font-medium">
                                {analysis.metadata.estimatedBudget ? 
                                  `$${(analysis.metadata.estimatedBudget / 1000000).toFixed(1)}M` : 
                                  'Calculating...'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional tabs for each analysis feature would go here */}
            {/* For now, showing placeholder content */}
            {analysisFeatures.slice(1).map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5" />
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {getFeatureStatus(feature.id).status === 'completed' 
                          ? 'Analysis complete! Detailed results will be displayed here.'
                          : `${feature.name} analysis in progress. Results will appear here when complete.`
                        }
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}