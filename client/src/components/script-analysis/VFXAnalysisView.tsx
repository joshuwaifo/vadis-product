import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Star, DollarSign, Loader2, CheckCircle, X, Play, Video, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  plotSummary: string;
  characters: string[];
  content: string;
  pageStart: number;
  pageEnd: number;
  duration: number;
  vfxNeeds: string[];
  productPlacementOpportunities: string[];
  createdAt: string;
  projectId: number;
}

interface VFXSceneAnalysis {
  sceneId: number;
  isVfxScene: boolean;
  vfxDescription: string;
  selectedQuality: 'low' | 'medium' | 'high' | null;
}

interface StoryboardImage {
  id: number;
  sceneId: number;
  imageUrl: string;
  prompt: string;
  charactersPresent: string[] | null;
  generatedAt: Date | null;
}

interface VFXConcept {
  sceneId: number;
  videoUrl: string;
  status: 'generating' | 'completed' | 'failed';
  predictionId?: string;
}

interface VFXAnalysisViewProps {
  projectId: number;
  onClose: () => void;
}

export default function VFXAnalysisView({ projectId, onClose }: VFXAnalysisViewProps) {
  const [vfxScenes, setVfxScenes] = useState<VFXSceneAnalysis[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [totalCostEstimate, setTotalCostEstimate] = useState<number | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [vfxConcepts, setVfxConcepts] = useState<VFXConcept[]>([]);
  const [videoDialog, setVideoDialog] = useState<{ open: boolean; videoUrl: string; sceneId: number | null }>({
    open: false,
    videoUrl: '',
    sceneId: null
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scenes
  const { data: scenes, isLoading: scenesLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'scenes'],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/scenes`);
      if (!response.ok) {
        throw new Error('Failed to fetch scenes');
      }
      return response.json();
    },
  });

  // Fetch existing VFX analysis results
  const { data: existingVfxData } = useQuery({
    queryKey: ['/api/projects', projectId, 'vfx-analysis'],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/vfx-analysis`);
      if (!response.ok) {
        throw new Error('Failed to fetch VFX analysis');
      }
      return response.json();
    },
  });

  // Fetch storyboard images for the project
  const { data: storyboardData } = useQuery({
    queryKey: [`/api/projects/${projectId}/storyboard`],
    enabled: !!projectId,
  });

  // Initialize VFX scenes when scenes data is loaded
  useEffect(() => {
    if (scenes && scenes.length > 0 && vfxScenes.length === 0) {
      // Use existing VFX analysis results if available
      if (existingVfxData && existingVfxData.vfxNeeds && existingVfxData.vfxNeeds.length > 0) {
        const vfxAnalysisResults: VFXSceneAnalysis[] = scenes.map((scene: any) => {
          const vfxData = existingVfxData.vfxNeeds.find((vfx: any) => vfx.sceneId === scene.id);
          const hasVfx = vfxData && vfxData.estimatedCost > 0;
          
          return {
            sceneId: scene.id,
            isVfxScene: hasVfx,
            vfxDescription: hasVfx ? vfxData.description || vfxData.vfxType || '' : '',
            selectedQuality: null
          };
        });
        
        setVfxScenes(vfxAnalysisResults);
        setAnalysisComplete(true);
      } else {
        // Fallback to basic initialization
        const initialVfxScenes: VFXSceneAnalysis[] = scenes.map((scene: any) => {
          const hasVfx = scene.vfxNeeds && scene.vfxNeeds.length > 0;
          return {
            sceneId: scene.id,
            isVfxScene: hasVfx,
            vfxDescription: hasVfx ? scene.vfxNeeds.join(', ') : '',
            selectedQuality: null
          };
        });
        
        setVfxScenes(initialVfxScenes);
        setAnalysisComplete(true);
      }
    }
  }, [scenes, existingVfxData, vfxScenes.length]);

  // VFX analysis mutation
  const vfxAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/script-analysis/vfx_analysis`, 'POST', {
        projectId: projectId
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'VFX analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Process VFX analysis results from API response
      if (data && data.vfxNeeds && scenes) {
        const vfxAnalysisResults: VFXSceneAnalysis[] = scenes.map(scene => {
          // Find VFX analysis for this scene from API response
          const vfxData = data.vfxNeeds.find((vfx: any) => vfx.sceneId === scene.id);
          const hasVfx = vfxData && vfxData.estimatedCost > 0;
          
          return {
            sceneId: scene.id,
            isVfxScene: hasVfx,
            vfxDescription: hasVfx ? vfxData.description || vfxData.vfxType || '' : '',
            selectedQuality: null
          };
        });
        
        setVfxScenes(vfxAnalysisResults);
        setAnalysisComplete(true);
        
        const vfxCount = vfxAnalysisResults.filter(s => s.isVfxScene).length;
        toast({
          title: "VFX Analysis Complete",
          description: `Identified ${vfxCount} scenes requiring VFX work.`
        });
      }
    },
    onError: (error) => {
      toast({
        title: "VFX Analysis Failed",
        description: error.message || "An error occurred during VFX analysis.",
        variant: "destructive"
      });
    }
  });

  // Cost estimation mutation
  const costEstimationMutation = useMutation({
    mutationFn: async () => {
      const selectedScenes = vfxScenes.filter(scene => scene.selectedQuality);
      
      if (selectedScenes.length === 0) {
        throw new Error('Please select at least one scene for cost estimation');
      }

      const response = await apiRequest(`/api/script-analysis/vfx_cost_estimate`, 'POST', {
        projectId: projectId,
        selectedScenes: selectedScenes.map(scene => ({
          sceneId: scene.sceneId,
          quality: scene.selectedQuality,
          vfxDescription: scene.vfxDescription
        }))
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cost estimation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setTotalCostEstimate(data.totalCost);
      toast({
        title: "Cost Estimation Complete",
        description: `Total estimated VFX cost: $${data.totalCost.toLocaleString()}`
      });
    },
    onError: (error) => {
      toast({
        title: "Cost Estimation Failed",
        description: error.message || "An error occurred during cost estimation.",
        variant: "destructive"
      });
    }
  });

  // VFX concept video generation mutation
  const generateVfxConceptMutation = useMutation({
    mutationFn: async ({ sceneId, quality }: { sceneId: number; quality: 'low' | 'medium' | 'high' }) => {
      const response = await apiRequest(`/api/vfx/generate-concept`, 'POST', {
        sceneId,
        projectId,
        quality
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate VFX concept');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { sceneId } = variables;
      setVfxConcepts(prev => [
        ...prev.filter(c => c.sceneId !== sceneId),
        {
          sceneId,
          videoUrl: '',
          status: 'generating' as const,
          predictionId: data.predictionId
        }
      ]);
      
      toast({
        title: "VFX Concept Generation Started",
        description: "The video concept is being generated. This may take a few minutes."
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start video generation",
        variant: "destructive"
      });
    }
  });

  const handleQualitySelect = (sceneId: number, quality: 'low' | 'medium' | 'high') => {
    setVfxScenes(prev => 
      prev.map(scene => 
        scene.sceneId === sceneId 
          ? { ...scene, selectedQuality: scene.selectedQuality === quality ? null : quality }
          : scene
      )
    );
  };

  const startVFXAnalysis = () => {
    vfxAnalysisMutation.mutate();
  };

  const calculateCost = () => {
    costEstimationMutation.mutate();
  };

  const getSelectedScenesCount = () => {
    return vfxScenes.filter(scene => scene.selectedQuality).length;
  };

  const getQualityColor = (quality: 'low' | 'medium' | 'high') => {
    switch (quality) {
      case 'low': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'high': return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getStoryboardImage = (sceneId: number): StoryboardImage | null => {
    if (!storyboardData?.storyboardImages) return null;
    return storyboardData.storyboardImages.find((img: StoryboardImage) => img.sceneId === sceneId) || null;
  };

  const getVfxConcept = (sceneId: number): VFXConcept | null => {
    return vfxConcepts.find(concept => concept.sceneId === sceneId) || null;
  };

  const handleGenerateVfxConcept = (sceneId: number) => {
    const vfxScene = vfxScenes.find(s => s.sceneId === sceneId);
    if (!vfxScene?.selectedQuality) {
      toast({
        title: "Quality Required",
        description: "Please select a VFX quality level first.",
        variant: "destructive"
      });
      return;
    }

    generateVfxConceptMutation.mutate({
      sceneId,
      quality: vfxScene.selectedQuality
    });
  };

  const handleViewConcept = (sceneId: number) => {
    const concept = getVfxConcept(sceneId);
    if (concept?.videoUrl && concept.status === 'completed') {
      setVideoDialog({
        open: true,
        videoUrl: concept.videoUrl,
        sceneId
      });
    }
  };

  const vfxScenesOnly = vfxScenes.filter(scene => scene.isVfxScene);
  const selectedScene = selectedSceneId ? scenes?.find((s: any) => s.id === selectedSceneId) : null;

  if (scenesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">VFX Analysis</h2>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!scenes || scenes.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">VFX Analysis</h2>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">No scenes found. Please run scene extraction first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            VFX Analysis
          </h2>
          <p className="text-muted-foreground mt-1">
            Identify scenes requiring visual effects and estimate costs
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      {!analysisComplete && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Start VFX Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI will analyze each scene to identify VFX requirements and mark scenes that need visual effects work.
                  </p>
                  <Button 
                    onClick={startVFXAnalysis}
                    disabled={vfxAnalysisMutation.isPending}
                    className="w-full max-w-md"
                  >
                    {vfxAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Scenes...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start VFX Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisComplete && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">VFX Scene Analysis</h3>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {vfxScenesOnly.length} VFX scenes
                </Badge>
                {getSelectedScenesCount() > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {getSelectedScenesCount()} with quality selected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* New Layout: Left Panel List + Right Panel Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            {/* Left Panel - Scene List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                Scenes with VFX Requirements
              </h4>
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {vfxScenesOnly.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No VFX scenes identified</p>
                    </div>
                  ) : (
                    vfxScenesOnly.map((vfxScene) => {
                      const scene = scenes?.find((s: any) => s.id === vfxScene.sceneId);
                      if (!scene) return null;
                      
                      const isSelected = selectedSceneId === scene.id;
                      const concept = getVfxConcept(scene.id);
                      
                      return (
                        <Card 
                          key={scene.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedSceneId(scene.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge variant="outline" className="text-xs mb-1">
                                  Scene {scene.sceneNumber}
                                </Badge>
                                <h5 className="font-medium text-sm">
                                  {scene.location} - {scene.timeOfDay}
                                </h5>
                              </div>
                              {concept?.status === 'completed' && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ready
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {vfxScene.vfxDescription}
                            </p>
                            
                            {/* VFX Quality Selection */}
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                Select VFX Quality:
                              </div>
                              <div className="flex gap-1">
                                {(['low', 'medium', 'high'] as const).map((quality) => (
                                  <Button
                                    key={quality}
                                    size="sm"
                                    variant={vfxScene.selectedQuality === quality ? "default" : "outline"}
                                    className={`text-xs px-2 py-1 h-6 ${
                                      vfxScene.selectedQuality === quality 
                                        ? getQualityColor(quality) 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQualitySelect(scene.id, quality);
                                    }}
                                  >
                                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Image Display */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Storyboard & VFX Concept
              </h4>
              
              {selectedScene ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h5 className="font-medium">
                          Scene {selectedScene.sceneNumber}: {selectedScene.location}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {selectedScene.description}
                        </p>
                      </div>
                      
                      {/* Storyboard Image */}
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                        {(() => {
                          const storyboardImage = getStoryboardImage(selectedScene.id);
                          return storyboardImage ? (
                            <img 
                              src={storyboardImage.imageUrl} 
                              alt={`Scene ${selectedScene.sceneNumber} storyboard`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No storyboard image</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Generate VFX Concept Button */}
                      <div className="space-y-2">
                        {(() => {
                          const concept = getVfxConcept(selectedScene.id);
                          const vfxScene = vfxScenesOnly.find(s => s.sceneId === selectedScene.id);
                          
                          if (concept?.status === 'generating') {
                            return (
                              <Button disabled className="w-full">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating VFX Concept...
                              </Button>
                            );
                          }
                          
                          if (concept?.status === 'completed') {
                            return (
                              <Button 
                                onClick={() => handleViewConcept(selectedScene.id)}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Concept
                              </Button>
                            );
                          }
                          
                          return (
                            <Button 
                              onClick={() => handleGenerateVfxConcept(selectedScene.id)}
                              disabled={!vfxScene?.selectedQuality || generateVfxConceptMutation.isPending}
                              className="w-full"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Generate VFX Concept
                            </Button>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="h-64">
                  <CardContent className="p-4 h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select a scene to view storyboard and generate VFX concepts</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Video Dialog */}
      <Dialog open={videoDialog.open} onOpenChange={(open) => setVideoDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>VFX Concept Video</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {videoDialog.videoUrl && (
              <video 
                src={videoDialog.videoUrl} 
                controls 
                className="w-full h-full"
                autoPlay
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}