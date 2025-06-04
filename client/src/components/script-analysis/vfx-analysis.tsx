import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VFXNeed {
  id: number;
  sceneId: number;
  vfxType: string;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  estimatedCost: number;
  description: string;
  requirements: string[];
  qualityTier: 'LOW' | 'MEDIUM' | 'HIGH';
  sceneDescription?: string;
}

interface VFXAnalysisProps {
  projectId: number;
}

export default function VFXAnalysis({ projectId }: VFXAnalysisProps) {
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vfxNeeds, isLoading } = useQuery<VFXNeed[]>({
    queryKey: ['vfx-needs', projectId],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/vfx-needs`),
    enabled: !!projectId
  });

  const updateVfxTierMutation = useMutation({
    mutationFn: async ({ vfxId, tier }: { vfxId: number; tier: string }) => {
      return apiRequest('PUT', `/api/vfx-needs/${vfxId}/tier`, { qualityTier: tier });
    },
    onSuccess: () => {
      toast({
        title: "VFX Tier Updated",
        description: "VFX quality tier has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['vfx-needs', projectId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update VFX tier"
      });
    }
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-purple-100 text-purple-800';
      case 'HIGH': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVfxNeeds = vfxNeeds?.filter(vfx => {
    const complexityMatch = selectedComplexity === 'all' || vfx.complexity === selectedComplexity;
    const tierMatch = selectedTier === 'all' || vfx.qualityTier === selectedTier;
    return complexityMatch && tierMatch;
  });

  const totalVfxScenes = vfxNeeds?.length || 0;
  const totalEstimatedCost = vfxNeeds?.reduce((sum, vfx) => sum + vfx.estimatedCost, 0) || 0;
  const averageCostPerScene = totalVfxScenes > 0 ? totalEstimatedCost / totalVfxScenes : 0;

  const complexityDistribution = {
    low: vfxNeeds?.filter(v => v.complexity === 'low').length || 0,
    medium: vfxNeeds?.filter(v => v.complexity === 'medium').length || 0,
    high: vfxNeeds?.filter(v => v.complexity === 'high').length || 0,
    extreme: vfxNeeds?.filter(v => v.complexity === 'extreme').length || 0,
  };

  const tierDistribution = {
    LOW: vfxNeeds?.filter(v => v.qualityTier === 'LOW').length || 0,
    MEDIUM: vfxNeeds?.filter(v => v.qualityTier === 'MEDIUM').length || 0,
    HIGH: vfxNeeds?.filter(v => v.qualityTier === 'HIGH').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* VFX Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{totalVfxScenes}</div>
                <div className="text-sm text-gray-600">VFX Scenes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${(totalEstimatedCost / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">Total VFX Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${(averageCostPerScene / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">Avg Cost/Scene</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {complexityDistribution.high + complexityDistribution.extreme}
                </div>
                <div className="text-sm text-gray-600">Complex Scenes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Complexities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="extreme">Extreme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Quality Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality Tiers</SelectItem>
              <SelectItem value="LOW">Low Quality</SelectItem>
              <SelectItem value="MEDIUM">Medium Quality</SelectItem>
              <SelectItem value="HIGH">High Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complexity & Tier Distribution */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complexity Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(complexityDistribution).map(([complexity, count]) => (
                <div key={complexity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getComplexityColor(complexity)}>
                      {complexity}
                    </Badge>
                  </div>
                  <span className="font-medium">{count} scenes</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(tierDistribution).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getTierColor(tier)}>
                      {tier}
                    </Badge>
                  </div>
                  <span className="font-medium">{count} scenes</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* VFX Needs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                VFX Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-4 p-4">
                  {filteredVfxNeeds?.map((vfx) => (
                    <div key={vfx.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{vfx.vfxType}</h4>
                          <p className="text-sm text-gray-600">Scene {vfx.sceneId}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getComplexityColor(vfx.complexity)}>
                            {vfx.complexity}
                          </Badge>
                          <Badge className={getTierColor(vfx.qualityTier)}>
                            {vfx.qualityTier}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vfx.description}
                      </p>

                      {vfx.requirements.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Requirements:</h5>
                          <div className="flex flex-wrap gap-1">
                            {vfx.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">
                              ${(vfx.estimatedCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select 
                            value={vfx.qualityTier} 
                            onValueChange={(value) => updateVfxTierMutation.mutate({ 
                              vfxId: vfx.id, 
                              tier: value 
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low Quality</SelectItem>
                              <SelectItem value="MEDIUM">Medium Quality</SelectItem>
                              <SelectItem value="HIGH">High Quality</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredVfxNeeds?.length === 0 && (
                    <div className="text-center py-8">
                      <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No VFX requirements match your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cost Breakdown */}
      {totalVfxScenes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>VFX Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">By Complexity</h4>
                <div className="space-y-2">
                  {Object.entries(complexityDistribution).map(([complexity, count]) => {
                    const complexityCost = vfxNeeds
                      ?.filter(v => v.complexity === complexity)
                      .reduce((sum, v) => sum + v.estimatedCost, 0) || 0;
                    const percentage = totalEstimatedCost > 0 ? (complexityCost / totalEstimatedCost) * 100 : 0;
                    
                    return (
                      <div key={complexity} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{complexity}</span>
                          <span>${(complexityCost / 1000).toFixed(0)}K</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">By Quality Tier</h4>
                <div className="space-y-2">
                  {Object.entries(tierDistribution).map(([tier, count]) => {
                    const tierCost = vfxNeeds
                      ?.filter(v => v.qualityTier === tier)
                      .reduce((sum, v) => sum + v.estimatedCost, 0) || 0;
                    const percentage = totalEstimatedCost > 0 ? (tierCost / totalEstimatedCost) * 100 : 0;
                    
                    return (
                      <div key={tier} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{tier.toLowerCase()}</span>
                          <span>${(tierCost / 1000).toFixed(0)}K</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Budget Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>VFX Budget:</span>
                    <span className="font-medium">${(totalEstimatedCost / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg per Scene:</span>
                    <span className="font-medium">${(averageCostPerScene / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High/Extreme Scenes:</span>
                    <span className="font-medium">
                      {((complexityDistribution.high + complexityDistribution.extreme) / totalVfxScenes * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}