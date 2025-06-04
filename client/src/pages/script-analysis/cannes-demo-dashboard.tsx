import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
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
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";

interface AnalysisFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: string;
  results?: any;
}

export default function CannesDemoDashboard() {
  const [, setLocation] = useLocation();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [analysisRunning, setAnalysisRunning] = useState(false);
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

  // Fetch available projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  // Fetch project analysis data
  const { data: analysisData, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['cannes-analysis', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project selected');
      const response = await fetch(`/api/projects/${projectId}/analysis`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      return response.json();
    },
    enabled: !!projectId
  });

  // Run analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async (features: string[]) => {
      if (!projectId) throw new Error('No project selected');
      const response = await fetch(`/api/enhanced-script-analysis/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, features })
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Analysis Started", description: "Your script analysis is now running." });
      setAnalysisRunning(true);
      // Refetch analysis data to see progress
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({ 
        title: "Analysis Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const analysisFeatures: AnalysisFeature[] = [
    {
      id: 'scene-breakdown',
      title: 'Scene Breakdown',
      description: 'Extract and analyze script scenes with timing and location details',
      icon: FileText,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-5 min'
    },
    {
      id: 'character-analysis',
      title: 'Character Analysis',
      description: 'Analyze character development, relationships, and personality traits',
      icon: Users,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-4 min'
    },
    {
      id: 'casting-suggestions',
      title: 'Casting Suggestions',
      description: 'AI-powered actor recommendations for each character role',
      icon: Star,
      status: 'pending',
      progress: 0,
      estimatedTime: '4-6 min'
    },
    {
      id: 'location-scouting',
      title: 'Location Scouting',
      description: 'Suggested filming locations with tax incentives and logistics',
      icon: MapPin,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-5 min'
    },
    {
      id: 'vfx-analysis',
      title: 'VFX Analysis',
      description: 'Visual effects requirements and complexity assessment',
      icon: Zap,
      status: 'pending',
      progress: 0,
      estimatedTime: '4-7 min'
    },
    {
      id: 'product-placement',
      title: 'Product Placement',
      description: 'Brand integration opportunities and revenue potential',
      icon: Camera,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-4 min'
    },
    {
      id: 'financial-planning',
      title: 'Financial Planning',
      description: 'Comprehensive budget breakdown and ROI projections',
      icon: DollarSign,
      status: 'pending',
      progress: 0,
      estimatedTime: '5-8 min'
    },
    {
      id: 'readers-report',
      title: "Reader's Report",
      description: 'Executive summary and market analysis report',
      icon: BarChart3,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-3 min'
    }
  ];

  // Update feature status based on analysis data
  const getFeatureStatus = (featureId: string): AnalysisFeature => {
    const baseFeature = analysisFeatures.find(f => f.id === featureId)!;
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    let results = null;
    
    if (analysisData) {
      switch (featureId) {
        case 'scene-breakdown':
          if (analysisData.scenes && analysisData.scenes.length > 0) {
            status = 'completed';
            results = analysisData.scenes;
          }
          break;
        case 'character-analysis':
          if (analysisData.characters && analysisData.characters.length > 0) {
            status = 'completed';
            results = analysisData.characters;
          }
          break;
        case 'financial-planning':
          if (analysisData.financial) {
            status = 'completed';
            results = analysisData.financial;
          }
          break;
        case 'casting-suggestions':
          if (analysisData.casting && analysisData.casting.length > 0) {
            status = 'completed';
            results = analysisData.casting;
          }
          break;
        case 'location-scouting':
          if (analysisData.locations && analysisData.locations.length > 0) {
            status = 'completed';
            results = analysisData.locations;
          }
          break;
        case 'vfx-analysis':
          if (analysisData.vfx && analysisData.vfx.length > 0) {
            status = 'completed';
            results = analysisData.vfx;
          }
          break;
        case 'product-placement':
          if (analysisData.productPlacement && analysisData.productPlacement.length > 0) {
            status = 'completed';
            results = analysisData.productPlacement;
          }
          break;
        case 'readers-report':
          if (analysisData.summary) {
            status = 'completed';
            results = analysisData.summary;
          }
          break;
      }
    }
    
    return {
      ...baseFeature,
      status,
      progress: status === 'completed' ? 100 : 0,
      results
    };
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleRunAnalysis = () => {
    if (selectedFeatures.length === 0) {
      toast({ 
        title: "No Features Selected", 
        description: "Please select at least one analysis feature.",
        variant: "destructive"
      });
      return;
    }
    runAnalysisMutation.mutate(selectedFeatures);
  };

  const selectedProject = projects?.find((p: any) => p.id === projectId);
  const hasScript = selectedProject?.scriptContent;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Advanced Script Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive AI-powered script analysis using industry-proven tools
              </p>
            </div>
          </div>
        </div>

        {/* Project Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
            <CardDescription>
              Choose a project with an uploaded script to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select 
                value={projectId?.toString() || ''} 
                onValueChange={(value) => setProjectId(parseInt(value))}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects?.filter((p: any) => p.scriptContent)?.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <Badge variant={hasScript ? "default" : "secondary"}>
                  {hasScript ? "Script Available" : "No Script"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {projectId && (
          <>
            {/* Analysis Features */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Analysis Features</CardTitle>
                <CardDescription>
                  Select the analysis features you want to run for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {analysisFeatures.map((feature) => {
                    const featureStatus = getFeatureStatus(feature.id);
                    const isSelected = selectedFeatures.includes(feature.id);
                    
                    return (
                      <Card 
                        key={feature.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                        } ${featureStatus.status === 'completed' ? 'border-green-500' : ''}`}
                        onClick={() => handleFeatureToggle(feature.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <feature.icon className={`h-5 w-5 ${
                              featureStatus.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                            }`} />
                            {featureStatus.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {feature.description}
                          </p>
                          {featureStatus.estimatedTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {featureStatus.estimatedTime}
                            </div>
                          )}
                          {featureStatus.status === 'completed' && (
                            <Badge variant="default" className="mt-2 text-xs">
                              Completed
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleRunAnalysis}
                    disabled={selectedFeatures.length === 0 || runAnalysisMutation.isPending || !hasScript}
                    size="lg"
                  >
                    {runAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Analysis ({selectedFeatures.length} features)
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFeatures(analysisFeatures.map(f => f.id))}
                  >
                    Select All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFeatures([])}
                  >
                    Clear All
                  </Button>
                </div>

                {!hasScript && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        This project doesn't have a script uploaded. Please upload a script to run analysis.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisData && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    Review the completed analysis for {selectedProject?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="scenes">Scenes</TabsTrigger>
                      <TabsTrigger value="characters">Characters</TabsTrigger>
                      <TabsTrigger value="financial">Financial</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                              {analysisData.scenes?.length || 0}
                            </div>
                            <p className="text-sm text-gray-600">Total Scenes</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                              {analysisData.characters?.length || 0}
                            </div>
                            <p className="text-sm text-gray-600">Characters</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                              {analysisData.financial?.totalBudget ? 
                                `$${(analysisData.financial.totalBudget / 1000000).toFixed(1)}M` : 
                                'N/A'
                              }
                            </div>
                            <p className="text-sm text-gray-600">Est. Budget</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                              {analysisData.scenes?.reduce((sum: number, scene: any) => 
                                sum + (scene.duration || 0), 0) || 0}
                            </div>
                            <p className="text-sm text-gray-600">Total Minutes</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="scenes" className="mt-6">
                      <div className="space-y-4">
                        {analysisData.scenes?.map((scene: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">Scene {scene.sceneNumber}</h4>
                                <Badge>{scene.timeOfDay}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{scene.location}</p>
                              <p className="text-sm">{scene.description}</p>
                              {scene.characters && (
                                <div className="mt-3">
                                  <p className="text-xs text-gray-500 mb-1">Characters:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {scene.characters.map((char: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {char}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="characters" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.characters?.map((character: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{character.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{character.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{character.age}</Badge>
                                  <Badge variant="outline">{character.gender}</Badge>
                                  <Badge variant="secondary">{character.importance}</Badge>
                                </div>
                                {character.personality && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Personality:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {character.personality.map((trait: string, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {trait}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="financial" className="mt-6">
                      {analysisData.financial ? (
                        <div className="space-y-6">
                          <Card>
                            <CardContent className="p-6">
                              <h4 className="font-semibold mb-4">Budget Breakdown</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Total Budget</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    ${(analysisData.financial.totalBudget / 1000000).toFixed(1)}M
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Expected ROI</p>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {analysisData.financial.roi}%
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {analysisData.financial.budgetBreakdown && (
                            <Card>
                              <CardContent className="p-6">
                                <h4 className="font-semibold mb-4">Budget Categories</h4>
                                <div className="space-y-3">
                                  {Object.entries(analysisData.financial.budgetBreakdown).map(([category, amount]: [string, any]) => (
                                    <div key={category} className="flex items-center justify-between">
                                      <span className="capitalize text-sm">
                                        {category.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="font-medium">
                                        ${(amount / 1000000).toFixed(1)}M
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No financial analysis available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}