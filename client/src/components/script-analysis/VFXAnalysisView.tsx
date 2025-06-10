import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Star, DollarSign, Loader2, CheckCircle, X } from 'lucide-react';
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

interface VFXAnalysisViewProps {
  projectId: number;
  onClose: () => void;
}

export default function VFXAnalysisView({ projectId, onClose }: VFXAnalysisViewProps) {
  const [vfxScenes, setVfxScenes] = useState<VFXSceneAnalysis[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [totalCostEstimate, setTotalCostEstimate] = useState<number | null>(null);
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

  // Initialize VFX scenes when scenes data is loaded
  useEffect(() => {
    if (scenes && scenes.length > 0 && vfxScenes.length === 0) {
      // Auto-initialize with scene data, marking scenes with VFX needs
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
      setAnalysisComplete(true); // Always show the grid when scenes are loaded
    }
  }, [scenes, vfxScenes.length]);

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
      // Process VFX analysis results
      if (scenes) {
        const vfxAnalysisResults: VFXSceneAnalysis[] = scenes.map(scene => {
          const hasVfx = scene.vfxNeeds && scene.vfxNeeds.length > 0;
          return {
            sceneId: scene.id,
            isVfxScene: hasVfx,
            vfxDescription: hasVfx ? scene.vfxNeeds.join(', ') : '',
            selectedQuality: null
          };
        });
        
        setVfxScenes(vfxAnalysisResults);
        setAnalysisComplete(true);
        
        toast({
          title: "VFX Analysis Complete",
          description: `Identified ${vfxAnalysisResults.filter(s => s.isVfxScene).length} scenes requiring VFX work.`
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
              <h3 className="text-lg font-semibold">Scene Analysis Results</h3>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {scenes.length} total scenes
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {vfxScenes.filter(s => s.isVfxScene).length} VFX scenes
                </Badge>
                {getSelectedScenesCount() > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {getSelectedScenesCount()} selected
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {scenes.map((scene) => {
                const vfxAnalysis = vfxScenes.find(v => v.sceneId === scene.id);
                const isVfxScene = vfxAnalysis?.isVfxScene || false;
                
                return (
                  <Card 
                    key={scene.id} 
                    className={`h-64 hover:shadow-md transition-shadow border ${
                      isVfxScene 
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    } relative`}
                  >
                    {isVfxScene && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          Scene {scene.sceneNumber}
                        </Badge>
                        {isVfxScene && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            VFX
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="text-sm font-medium mb-2 line-clamp-1">
                        {scene.description || `Scene ${scene.sceneNumber}`}
                      </h4>
                      
                      <div className="flex-1 overflow-hidden mb-4">
                        <ScrollArea className="h-16">
                          <p className="text-xs text-muted-foreground leading-relaxed pr-2">
                            {scene.plotSummary || 'Plot summary not available'}
                          </p>
                        </ScrollArea>
                      </div>

                      {isVfxScene && (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Select VFX Quality:
                          </div>
                          <div className="flex gap-1">
                            {(['low', 'medium', 'high'] as const).map((quality) => (
                              <Button
                                key={quality}
                                size="sm"
                                variant={vfxAnalysis?.selectedQuality === quality ? "default" : "outline"}
                                className={`text-xs px-2 py-1 h-7 ${
                                  vfxAnalysis?.selectedQuality === quality 
                                    ? getQualityColor(quality) 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                onClick={() => handleQualitySelect(scene.id, quality)}
                              >
                                {quality.charAt(0).toUpperCase() + quality.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {getSelectedScenesCount() > 0 && (
            <div className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Cost Estimation</h3>
                      <p className="text-muted-foreground">
                        Get AI-powered cost estimates for your selected VFX scenes ({getSelectedScenesCount()} scenes selected)
                      </p>
                      {totalCostEstimate && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-lg font-bold text-green-700 dark:text-green-400">
                              Total Estimated Cost: ${totalCostEstimate.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={calculateCost}
                      disabled={costEstimationMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {costEstimationMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Calculate Cost
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}