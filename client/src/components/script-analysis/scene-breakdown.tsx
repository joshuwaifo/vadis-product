import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  ShoppingBag,
  Eye,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Scene {
  id: number;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  content: string;
  pageStart: number;
  pageEnd: number;
  duration: number;
  vfxNeeds: string[];
  productPlacementOpportunities: string[];
}

interface SceneBreakdownProps {
  projectId: number;
}

export default function SceneBreakdown({ projectId }: SceneBreakdownProps) {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: scenes, isLoading } = useQuery<Scene[]>({
    queryKey: ['scenes', projectId],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/scenes`),
    enabled: !!projectId
  });

  const { data: sceneAnalysis } = useQuery({
    queryKey: ['scene-analysis', projectId, selectedScene?.id],
    queryFn: () => apiRequest('GET', `/api/scenes/${selectedScene?.id}/analysis`),
    enabled: !!selectedScene?.id
  });

  const totalDuration = scenes?.reduce((sum, scene) => sum + scene.duration, 0) || 0;
  const totalPages = scenes?.length > 0 ? Math.max(...scenes.map(s => s.pageEnd)) : 0;
  const vfxScenes = scenes?.filter(scene => scene.vfxNeeds.length > 0).length || 0;
  const brandableScenes = scenes?.filter(scene => scene.productPlacementOpportunities.length > 0).length || 0;

  const getTimeOfDayColor = (timeOfDay: string) => {
    switch (timeOfDay?.toLowerCase()) {
      case 'day': return 'bg-yellow-100 text-yellow-800';
      case 'night': return 'bg-blue-100 text-blue-800';
      case 'dawn': return 'bg-orange-100 text-orange-800';
      case 'dusk': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      {/* Scene Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{scenes?.length || 0}</div>
                <div className="text-sm text-gray-600">Total Scenes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(totalDuration)}</div>
                <div className="text-sm text-gray-600">Est. Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{vfxScenes}</div>
                <div className="text-sm text-gray-600">VFX Scenes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{brandableScenes}</div>
                <div className="text-sm text-gray-600">Brandable</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scene Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {scenes?.map((scene) => (
                    <div
                      key={scene.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedScene?.id === scene.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedScene(scene)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Scene {scene.sceneNumber}</span>
                        <Badge className={getTimeOfDayColor(scene.timeOfDay)}>
                          {scene.timeOfDay}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {scene.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          ~{Math.round(scene.duration)} min
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          {scene.characters.length} characters
                        </div>
                      </div>

                      <div className="flex gap-1 mt-2">
                        {scene.vfxNeeds.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            VFX
                          </Badge>
                        )}
                        {scene.productPlacementOpportunities.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Brand
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Scene Details */}
        <div className="lg:col-span-2">
          {selectedScene ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scene {selectedScene.sceneNumber} Details</span>
                  <Badge className={getTimeOfDayColor(selectedScene.timeOfDay)}>
                    {selectedScene.timeOfDay}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="opportunities">Brand Ops</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Location & Timing</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{selectedScene.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time of Day:</span>
                            <span className="font-medium">{selectedScene.timeOfDay}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">~{Math.round(selectedScene.duration)} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pages:</span>
                            <span className="font-medium">{selectedScene.pageStart}-{selectedScene.pageEnd}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Characters</h4>
                        <div className="space-y-1">
                          {selectedScene.characters.map((character, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {character}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedScene.description}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <ScrollArea className="h-64">
                      <div className="text-sm whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded">
                        {selectedScene.content}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">VFX Requirements</h4>
                      {selectedScene.vfxNeeds.length > 0 ? (
                        <div className="space-y-2">
                          {selectedScene.vfxNeeds.map((vfx, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              <Zap className="w-3 h-3 mr-1" />
                              {vfx}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No VFX requirements identified</p>
                      )}
                    </div>

                    {sceneAnalysis && (
                      <div>
                        <h4 className="font-semibold mb-2">Production Notes</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
                          {sceneAnalysis.productionNotes || "Analysis in progress..."}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="opportunities" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Product Placement Opportunities</h4>
                      {selectedScene.productPlacementOpportunities.length > 0 ? (
                        <div className="space-y-2">
                          {selectedScene.productPlacementOpportunities.map((opportunity, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">{opportunity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No product placement opportunities identified</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Select a scene to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}